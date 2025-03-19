import { authOptions } from '@/lib/auth/auth';
import { ApiError, ApiErrorCode } from '@/types/api';
import { getServerSession, Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Define schema for profile completion
const profileCompleteSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  userId: z.string().min(1, "User ID is required"),
});

interface AuthSession extends Session {
  user?: {
    id: string;
    email?: string | null;
    image?: string | null;
    name?: string | null;
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as AuthSession;

    if (!session?.user) {
      throw new ApiError(ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const { displayName, username, userId } = await req.json();

    if (!displayName || !username || !userId) {
      throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Display name, username, and user ID are required', 400);
    }

    // Validate input data
    try {
      profileCompleteSchema.parse({ displayName, username, userId });
    } catch (error) {
      throw new ApiError(ApiErrorCode.VALIDATION_ERROR, 'Invalid input data', 400);
    }

    // Check if user has permission to update this profile
    if (session.user.email !== userId && session.user.id !== userId) {
      throw new ApiError(ApiErrorCode.ACCESS_DENIED, 'You can only update your own profile', 403);
    }

    // Check if username is available
    // TODO: Implement username availability check with database

    // Update user profile 
    // TODO: Implement actual database update when database is set up

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      user: {
        id: userId,
        displayName,
        username,
        email: session.user.email,
      }
    });

  } catch (error) {
    console.error('Profile completion error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message
        }
      }, { status: error.statusCode });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        message: 'An unexpected error occurred'
      }
    }, { status: 500 });
  }
} 