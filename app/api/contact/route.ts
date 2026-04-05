import { type NextRequest, NextResponse } from 'next/server';
import type { ContactFormData, ContactFormResponse } from '@/lib/types';

// ─── Rate Limiting (in-memory, per-IP) ──────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Cleanup old entries periodically (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// ─── Input Validation ───────────────────────────────────────────────────────

function validateContactForm(data: unknown): { valid: true; data: ContactFormData } | { valid: false; errors: Array<{ field: keyof ContactFormData; message: string }> } {
  const errors: Array<{ field: keyof ContactFormData; message: string }> = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: [{ field: 'name', message: 'Invalid request body' }] };
  }

  const { name, email, message } = data as Partial<ContactFormData>;

  // Name validation
  if (!name || typeof name !== 'string') {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push({ field: 'email', message: 'Invalid email address' });
  }

  // Message validation
  if (!message || typeof message !== 'string') {
    errors.push({ field: 'message', message: 'Message is required' });
  } else if (message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message must be at least 10 characters' });
  } else if (message.trim().length > 5000) {
    errors.push({ field: 'message', message: 'Message must be less than 5000 characters' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      name: (name as string).trim(),
      email: (email as string).trim(),
      message: (message as string).trim(),
    },
  };
}

// ─── Response Helpers ───────────────────────────────────────────────────────

function createErrorResponse(status: number, message: string, errors?: Array<{ field: keyof ContactFormData; message: string }>): NextResponse<ContactFormResponse> {
  return NextResponse.json(
    { success: false, message, errors },
    {
      status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

function createSuccessResponse(data: ContactFormResponse): NextResponse<ContactFormResponse> {
  return NextResponse.json(
    data,
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

// ─── Route Handlers ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return createErrorResponse(429, 'Too many requests. Please try again later.');
    }

    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse(400, 'Invalid JSON in request body');
    }

    // Validate
    const validation = validateContactForm(body);
    if (!validation.valid) {
      return createErrorResponse(400, 'Validation failed', validation.errors);
    }

    // TODO: Replace with actual email service / database integration
    // For now, log the submission (in production, send via Resend, SendGrid, etc.)
    console.log('Contact form submission:', {
      name: validation.data.name,
      email: validation.data.email,
      timestamp: new Date().toISOString(),
    });

    return createSuccessResponse(
      { success: true, message: 'Message sent successfully. We will get back to you soon.' }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return createErrorResponse(500, 'Internal server error. Please try again later.');
  }
}

export async function GET() {
  return createErrorResponse(405, 'Method not allowed. Use POST to submit contact forms.');
}
