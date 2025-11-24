import { z } from 'zod';

export const e164PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+\d{8,15}$/u, 'Must be E.164 format, e.g., +919876543210');

export const smsSendSchema = z.object({
  to: e164PhoneSchema,
  body: z.string().min(1).max(1600),
  mediaUrl: z.string().url().optional(),
});

export const outboundCallSchema = z.object({
  to: e164PhoneSchema,
  record: z.boolean().optional(),
});

export const identitySchema = z.object({
  identity: z.string().min(1).max(64),
});

export type SmsSendInput = z.infer<typeof smsSendSchema>;
export type OutboundCallInput = z.infer<typeof outboundCallSchema>;


