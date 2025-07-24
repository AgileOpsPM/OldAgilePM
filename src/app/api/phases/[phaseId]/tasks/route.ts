import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

// POST a new task to a phase
export async function POST(
  request: Request,
  { params }: { params: { phaseId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { phaseId } = params;
  const body = await request.json();
  // --- UPDATED: Accept title and description ---
  const { title, description } = body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return new NextResponse(JSON.stringify({ error: 'A valid title is required' }), { status: 400 });
  }

  try {
    // Security check: ensure the user owns the project this phase belongs to
    const phase = await prisma.phase.findFirst({
      where: {
        id: phaseId,
        project: {
          consultantId: session.user.id,
        },
      },
    });

    if (!phase) {
      return new NextResponse(JSON.stringify({ error: 'Phase not found or not authorized' }), { status: 404 });
    }

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description || null, // Add the description
        phaseId: phaseId,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create task' }), { status: 500 });
  }
}