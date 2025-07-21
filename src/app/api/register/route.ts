import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Check if all required fields are present
    if (!email || !name || !password) {
      return new NextResponse('Missing name, email, or password', { status: 400 });
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      return new NextResponse('User with this email already exists', { status: 409 }); // 409 Conflict
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create the new user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: 'USER', // Assign a default role
      },
    });

    // Return the created user object (without the password)
    return NextResponse.json(user);

  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}