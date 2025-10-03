import { z } from 'zod';
import { ALLOWED_EMAIL_DOMAINS } from './email-domains.config';

// Schema สำหรับ Login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});
// Schema สำหรับ Register
export const registerSchema = z.object({
  firstname: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .refine((email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      return ALLOWED_EMAIL_DOMAINS.includes(domain);
    }, `Email domain not allowed. Please use one of these domains: ${ALLOWED_EMAIL_DOMAINS.join(', ')}`),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val) => /[0-9]/.test(val), {
      message: 'Password must contain at least one number',
    })
    .refine((val) => /[!@#$%^&*]/.test(val), {
      message: 'Password must contain at least one special character',
    }),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
  position: z
    .string()
    .min(1, 'Position is required')
    .min(2, 'Position must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type definitions
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
