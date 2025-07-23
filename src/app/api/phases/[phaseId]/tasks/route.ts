import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// API route for POST /api/phases/[phaseId]/tasks
export async function POST(
  request: Request,
  { params }: { params: { phaseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { phaseId } = params;
  const body = await request.json();
  // Now we accept both title and an optional description
  const { title, description } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return new NextResponse(JSON.stringify({ error: 'A valid title is required' }), { status: 400 });
  }

  try {
    // Security check: Verify the user owns the project this phase belongs to
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

    // --- Create the new task with both fields ---
    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null, // Set description or null if not provided
        phaseId: phaseId,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create task' }), { status: 500 });
  }
}