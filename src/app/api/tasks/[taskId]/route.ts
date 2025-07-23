import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// Security check function to ensure user owns the task
async function verifyUserOwnership(userId: string, taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      phase: {
        select: {
          project: {
            select: { consultantId: true },
          },
        },
      },
    },
  });
  if (!task) return 'Not Found';
  if (task.phase.project.consultantId !== userId) return 'Forbidden';
  return 'Authorized';
}

// --- UNIFIED PATCH FUNCTION for tasks ---
export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { taskId } = params;
  const ownershipStatus = await verifyUserOwnership(session.user.id, taskId);
  if (ownershipStatus === 'Not Found') {
    return new NextResponse(JSON.stringify({ error: 'Task not found' }), { status: 404 });
  }
  if (ownershipStatus === 'Forbidden') {
    return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
  }

  const body = await request.json();
  const { title, description, isCompleted } = body;

  const dataToUpdate: {
    title?: string;
    description?: string;
    isCompleted?: boolean;
  } = {};

  if (title !== undefined) dataToUpdate.title = title;
  if (description !== undefined) dataToUpdate.description = description;
  if (isCompleted !== undefined) dataToUpdate.isCompleted = isCompleted;
  
  if (Object.keys(dataToUpdate).length === 0) {
    return new NextResponse(JSON.stringify({ error: 'No update data provided' }), { status: 400 });
  }

  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update task' }), { status: 500 });
  }
}

// --- DELETE FUNCTION for tasks ---
export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { taskId } = params;
  const ownershipStatus = await verifyUserOwnership(session.user.id, taskId);
  if (ownershipStatus === 'Not Found') {
    return new NextResponse(JSON.stringify({ error: 'Task not found' }), { status: 404 });
  }
  if (ownershipStatus === 'Forbidden') {
    return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 403 });
  }

  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete task' }), { status: 500 });
  }
}