import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const body = await request.json();
  // Destructure the new date fields from the body
  const { title, description, totalBilledHours, startDate, endDate } = body;
  const userId = session.user.id;

  // --- Validation ---
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return new NextResponse(JSON.stringify({ error: 'A valid title is required' }), { status: 400 });
  }

  const hours = parseFloat(totalBilledHours);
  if (isNaN(hours) || hours <= 0) {
    return new NextResponse(JSON.stringify({ error: 'A valid, positive number for total hours is required' }), { status: 400 });
  }

  // --- Date Validation ---
  if (!startDate) {
    return new NextResponse(JSON.stringify({ error: 'A start date is required' }), { status: 400 });
  }
  
  const start = new Date(startDate);
  // Check if endDate is provided and if it's before the startDate
  if (endDate) {
    const end = new Date(endDate);
    if (end < start) {
      return new NextResponse(JSON.stringify({ error: 'End date cannot be before the start date' }), { status: 400 });
    }
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description || null,
        totalBilledHours: hours,
        consultantId: userId,
        // Save the new dates
        startDate: start,
        // Conditionally save endDate, otherwise it will be null
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to create project' }), { status: 500 });
  }
}