import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return new NextResponse('Missing token or password', { status: 400 });
    }

    // Hash the incoming token to match the one in the database
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await prisma.user.findUnique({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user || !user.passwordResetTokenExpiry) {
      return new NextResponse('Invalid or expired token', { status: 400 });
    }

    if (new Date() > user.passwordResetTokenExpiry) {
      return new NextResponse('Token has expired', { status: 400 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password and clear the reset token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    return new NextResponse('Password has been reset successfully.', { status: 200 });

  } catch (error) {
    console.error('[RESET_PASSWORD_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}