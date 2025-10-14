/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes all HTML tags and dangerous characters
 */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize for URL usage
 */
export function sanitizeUrl(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Validate and sanitize file uploads
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
} = {}): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 5 * 1024 * 1024; // Default 5MB
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size must be less than ${maxSize / (1024 * 1024)}MB` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    };
  }

  return { valid: true };
}

/**
 * Validate numeric input
 */
export function validateNumber(input: any, options: {
  min?: number;
  max?: number;
} = {}): { valid: boolean; value?: number; error?: string } {
  const num = Number(input);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Invalid number' };
  }

  if (options.min !== undefined && num < options.min) {
    return { valid: false, error: `Number must be at least ${options.min}` };
  }

  if (options.max !== undefined && num > options.max) {
    return { valid: false, error: `Number must be at most ${options.max}` };
  }

  return { valid: true, value: num };
}

/**
 * Rate limiting helper for client-side
 */
export class ClientRateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxAttempts: number;

  constructor(windowMs: number = 60000, maxAttempts: number = 5) {
    this.windowMs = windowMs;
    this.maxAttempts = maxAttempts;
  }

  check(key: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    let keyAttempts = this.attempts.get(key) || [];
    keyAttempts = keyAttempts.filter(timestamp => timestamp > windowStart);
    
    if (keyAttempts.length >= this.maxAttempts) {
      const oldestAttempt = Math.min(...keyAttempts);
      const retryAfter = Math.ceil((oldestAttempt + this.windowMs - now) / 1000);
      return { allowed: false, retryAfter };
    }
    
    keyAttempts.push(now);
    this.attempts.set(key, keyAttempts);
    
    return { allowed: true };
  }

  reset(key: string) {
    this.attempts.delete(key);
  }
}
