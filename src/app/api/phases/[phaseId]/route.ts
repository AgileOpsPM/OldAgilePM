import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// --- UNIFIED PATCH FUNCTION ---
export async function PATCH(
  request: Request,
  { params }: { params: { phaseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { phaseId } = params;
  const body = await request.json();
  const { title, allocatedHours, isCompleted } = body;

  try {
    const phaseToUpdate = await prisma.phase.findUnique({
      where: { id: phaseId },
      include: { project: { include: { phases: true } } },
    });

    if (!phaseToUpdate) {
      return new NextResponse(JSON.stringify({ error: 'Phase not found' }), { status: 404 });
    }
    if (phaseToUpdate.project.consultantId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    const dataToUpdate: { title?: string; allocatedHours?: number; isCompleted?: boolean; } = {};

    // --- NEW LOGIC: VALIDATE isCompleted ---
    if (isCompleted === true) {
      const incompleteTasksCount = await prisma.task.count({
        where: {
          phaseId: phaseId,
          isCompleted: false,
        },
      });

      if (incompleteTasksCount > 0) {
        return new NextResponse(JSON.stringify({ error: `Cannot complete phase: ${incompleteTasksCount} task(s) are still open.` }), { status: 400 });
      }
      dataToUpdate.isCompleted = true;
    } else if (isCompleted === false) {
      dataToUpdate.isCompleted = false;
    }
    
    // Logic for other fields remains the same
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (allocatedHours !== undefined) {
      const newHours = parseFloat(allocatedHours);
      if (isNaN(newHours) || newHours < 0) return new NextResponse(JSON.stringify({ error: 'Invalid allocatedHours value' }), { status: 400 });
      
      const otherPhasesHours = phaseToUpdate.project.phases
        .filter(p => p.id !== phaseId)
        .reduce((sum, p) => sum + p.allocatedHours.toNumber(), 0);
      const newTotalAllocated = otherPhasesHours + newHours;
      const totalBilled = phaseToUpdate.project.totalBilledHours.toNumber();
      
      if (newTotalAllocated > totalBilled) {
        return new NextResponse(JSON.stringify({ error: `Total allocated hours (${newTotalAllocated}) would exceed total billed hours (${totalBilled}).` }), { status: 400 });
      }
      dataToUpdate.allocatedHours = newHours;
    }
    
    if (Object.keys(dataToUpdate).length === 0) {
      return new NextResponse(JSON.stringify({ error: 'No update data provided' }), { status: 400 });
    }

    const updatedPhase = await prisma.phase.update({
      where: { id: phaseId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedPhase);
  } catch (error) {
    console.error('Error updating phase:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update phase' }), { status: 500 });
  }
}

// DELETE function remains unchanged
export async function DELETE(
  request: Request,
  { params }: { params: { phaseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { phaseId } = params;

  try {
    const phase = await prisma.phase.findUnique({
      where: { id: phaseId },
      select: { project: { select: { consultantId: true } } },
    });

    if (!phase) {
      return new NextResponse(JSON.stringify({ error: 'Phase not found' }), { status: 404 });
    }

    if (phase.project.consultantId !== session.user.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
    }

    await prisma.phase.delete({
      where: { id: phaseId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting phase:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete phase' }), { status: 500 });
  }
}