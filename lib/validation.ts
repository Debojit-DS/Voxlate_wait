import { z } from "zod";

export const waitlistSchema = z.object({
  name: z.string().min(1, "Full name is required").max(120),
  email: z.string().email("Enter a valid email address"),
  company: z.string().max(200).optional().or(z.literal("")),
  type: z.enum(["individual", "business"]),
  product: z.enum(["digital", "physical", "both"]),
  source: z.string().optional(),
});
export type WaitlistFormValues = z.infer<typeof waitlistSchema>;
