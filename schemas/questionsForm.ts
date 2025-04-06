import * as z from 'zod';


export const questionSchema = z.object({
    content: z.string()
      .min(20, "Question must be at least 30 characters long")
      .max(5000, "Question cannot exceed 5000 characters"),
    tags: z.array(z.string()).min(1, "Add at least one tag").max(5, "Cannot add more than 5 tags"),
  });
  
  export const answerSchema = z.object({
    content: z.string()
      .min(10, "Answer must be at least 30 characters long")
      .max(10000, "Answer cannot exceed 10000 characters"),
  });
  
  export const replySchema = z.object({
    content: z.string()
      .min(10, "Reply must be at least 10 characters long")
      .max(1000, "Reply cannot exceed 1000 characters"),
  });
  
  export type QuestionFormData = z.infer<typeof questionSchema>;
  export type AnswerFormData = z.infer<typeof answerSchema>;
  export type ReplyFormData = z.infer<typeof replySchema>;