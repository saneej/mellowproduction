import { z } from 'zod';

// Access Code Verification Schema
export const accessCodeSchema = z.object({
  pin: z.string()
    .min(1, { message: "Access code must be at least 1 character" })
    .max(50, { message: "Access code must not exceed 50 characters" })
});

// Project Creation / Editing Schema
export const projectSchema = z.object({
  title: z.string().min(2, "Title is required").max(100, "Title too long"),
  clientName: z.string().min(2, "Client name is required").max(100, "Client name too long"),
  clientEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug too long")
    .regex(/^[a-z0-9\-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  category: z.enum(["wedding", "engagement", "corporate", "event", "commercial"]),
  date: z.string().min(1, "Date is required"),
  coverImage: z.string().min(1, "Cover image URL or ID is required"),
  isPinProtected: z.boolean(),
  pin: z.string().optional(),
  driveFolderId: z.string().optional(),
  description: z.string().max(500, "Description too long").optional(),
});

// Drive Account Form Schema
export const driveAccountSchema = z.object({
  name: z.string().min(2, "Account name is required").max(100),
  email: z.string().email("Invalid email address"),
  folderId: z.string().optional()
});

// Client Favorite Submission Schema
export const favoriteSubmissionSchema = z.object({
  clientName: z.string().min(2, "Your name is required").max(100),
  clientEmail: z.string().email("Valid email address is required"),
  clientPhone: z.string().max(20).optional(),
  notes: z.string().max(1000, "Notes are too long").optional(),
  selectedMediaIds: z.array(z.string()).min(1, "Select at least 1 photo to submit favorites")
});

export type AccessCodeInput = z.infer<typeof accessCodeSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type DriveAccountInput = z.infer<typeof driveAccountSchema>;
export type FavoriteSubmissionInput = z.infer<typeof favoriteSubmissionSchema>;
