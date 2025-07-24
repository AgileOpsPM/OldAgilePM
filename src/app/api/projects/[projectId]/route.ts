import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// API route for PATCH /api/projects/[projectId] - (This is your existing code)
export async function PATCH(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { projectId } = params;
  const body = await request.json();
  const { title, description, totalBilledHours, startDate, endDate } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return new NextResponse(JSON.stringify({ error: 'A valid title is required' }), { status: 400 });
  }
  const hours = parseFloat(totalBilledHours);
  if (isNaN(hours) || hours <= 0) {
    return new NextResponse(JSON.stringify({ error: 'A valid, positive number for total hours is required' }), { status: 400 });
  }
  if (!startDate) {
    return new NextResponse(JSON.stringify({ error: 'A start date is required' }), { status: 400 });
  }
  const start = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    if (end < start) {
      return new NextResponse(JSON.stringify({ error: 'End date cannot be before the start date' }), { status: 400 });
    }
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { phases: true },
    });

    if (!project) {
      return new NextResponse(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }
    if (project.consultantId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const currentlyAllocatedHours = project.phases.reduce((sum, phase) => sum + phase.allocatedHours.toNumber(), 0);
    if (hours < currentlyAllocatedHours) {
      return new NextResponse(JSON.stringify({ 
        error: `New total hours (${hours}) cannot be less than the hours already allocated to phases (${currentlyAllocatedHours}).`
      }), { status: 400 });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: title.trim(),
        description: description || null,
        totalBilledHours: hours,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update project' }), { status: 500 });
  }
}

// --- NEW FUNCTION ADDED HERE ---
// API route for DELETE /api/projects/[projectId]
export async function DELETE(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { projectId } = params;

  try {
    const projectToVerify = await prisma.project.findUnique({
      where: { id: projectId },
      select: { consultantId: true },
    });

    if (!projectToVerify) {
      return new NextResponse(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    if (projectToVerify.consultantId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting project:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete project' }), { status: 500 });
  }
}