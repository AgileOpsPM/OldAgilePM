import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// This is the API route for POST /api/projects/[projectId]/phases
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);

  // 1. Authentication Check
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { projectId } = params;
  const body = await request.json();
  const { title, allocatedHours } = body;

  // 2. Input Validation
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return new NextResponse(JSON.stringify({ error: 'A valid title is required' }), { status: 400 });
  }

  const hours = parseFloat(allocatedHours);
  if (isNaN(hours) || hours < 0) {
      return new NextResponse(JSON.stringify({ error: 'A valid, non-negative number for hours is required' }), { status: 400 });
  }

  try {
    // 3. Authorization and Business Logic Validation
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { phases: true }, // Include existing phases to calculate current total
    });

    if (!project) {
      return new NextResponse(JSON.stringify({ error: 'Project not found' }), { status: 404 });
    }

    if (project.consultantId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized to add a phase to this project' }), { status: 403 });
    }

    // Check if adding the new phase exceeds the total billed hours
    const currentAllocatedHours = project.phases.reduce((sum, phase) => sum + phase.allocatedHours.toNumber(), 0);
    const newTotalAllocated = currentAllocatedHours + hours;
    const totalBilled = project.totalBilledHours.toNumber();

    if (newTotalAllocated > totalBilled) {
      return new NextResponse(JSON.stringify({ 
        error: `Cannot add phase. The new total allocated hours (${newTotalAllocated}) would exceed the project's limit of ${totalBilled}.`
      }), { status: 400 });
    }

    // 4. Create the new phase
    const newPhase = await prisma.phase.create({
      data: {
        title: title.trim(),
        allocatedHours: hours,
        projectId: projectId,
      },
    });

    return NextResponse.json(newPhase, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating phase:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create phase' }), { status: 500 });
  }
}