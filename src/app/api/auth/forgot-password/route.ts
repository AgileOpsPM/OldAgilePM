import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// A placeholder for the actual email sending function
async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  
  console.log(`Password reset link for ${email}: ${resetLink}`);
  
  // TODO: Implement a real email sending service here (e.g., Resend, SendGrid)
  // This is where you would use a library to send an email.
  // For now, we'll just log it to the console.
  
  return Promise.resolve();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist.
      // Still return a success message for security reasons.
      return new NextResponse('If a user with that email exists, a password reset link has been sent.', { status: 200 });
    }

    // Generate a secure, random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set an expiry date (e.g., 1 hour from now)
    const passwordResetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        passwordResetToken,
        passwordResetTokenExpiry,
      },
    });

    // Send the email with the plain token (not the hashed one)
    await sendPasswordResetEmail(email, resetToken);

    return new NextResponse('If a user with that email exists, a password reset link has been sent.', { status: 200 });

  } catch (error) {
    console.error('[FORGOT_PASSWORD_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}