import * as z from "zod";

export const feedbackFormSchema = z.object({
    message: z.string().min(10, "Message must be at least 10 characters long").max(500, "Message cannot exceed 500 characters"),
    rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
})

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>