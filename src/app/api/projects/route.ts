import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";

// Imports the authOptions defined.
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 

const prisma = new PrismaClient();

const DEFAULT_PHASES = [
  { title: "Phase 1: Discovery & Planning", allocatedHours: 0 },
  { title: "Phase 2: Design & Prototyping", allocatedHours: 0 },
  { title: "Phase 3: Development & Implementation", allocatedHours: 0 },
  { title: "Phase 4: Testing & QA", allocatedHours: 0 },
  { title: "Phase 5: Deployment & Launch", allocatedHours: 0 },
];

export async function POST(req: Request) {
  // Get the session by passing your authOptions to getServerSession.
  // This is the standard way for the App Router.
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { title, description, totalBilledHours } = body;

    if (!title || !totalBilledHours) {
      return new NextResponse(
        JSON.stringify({ error: "Title and Total Billed Hours are required" }),
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        totalBilledHours: parseFloat(totalBilledHours),
        consultantId: userId,
        phases: {
          create: DEFAULT_PHASES,
        },
      },
      include: {
        phases: true,
      },
    });

    return new NextResponse(JSON.stringify(newProject), { status: 201 });

  } catch (error) {
    console.error("Error creating project:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create project" }), 
      { status: 500 }
    );
  }
}