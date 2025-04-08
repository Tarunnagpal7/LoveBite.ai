import * as z from "zod";

export const profileSchema = z.object({
  age: z.number()
    .min(18, "You must be at least 18 years old")
    .max(100, "Please enter a valid age"),
  gender: z.enum(["male", "female"]),
  inRelation: z.enum(["single", "in a relationship", "married"]),
  zodiacSign: z.enum([
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ]),
});

export type ProfileFormData = z.infer<typeof profileSchema>;