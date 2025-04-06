"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, ThumbsUp } from "lucide-react";
import { QuestionFormData, questionSchema } from "@/schemas/questionsForm";
import { Question, Reaction } from "@/models/Questions";
import { format } from "date-fns";
import axios from 'axios';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting,setIsSubmitting] = useState(false);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      content: "",
      tags: [],
    },
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async (search = "") => {
    try {
      setLoading(true);
      const response = await axios.get('/api/questions', {
        params: { search, page: 1, limit: 10 }
      });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions(searchTerm);
  };

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);
    if (!session?.user) {
      toast.error("You must be logged in to post a question");
      return;
    }


    try {
      const response = await axios.post('/api/questions', {
        data
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setIsDialogOpen(false);
        form.reset();
        fetchQuestions(); // Refresh questions list
        router.replace(`/@&A/${response.data.questionId}`); 
      }
    } catch (error) {
      toast.error('Failed to post question');
      console.error("Error submitting question:", error);
    }
    finally{
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Relationship Q&A</h1>
            <p className="text-muted-foreground mt-2">
              Ask questions, share experiences, and get advice from the community
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide more context about your question..."
                            className="min-h-[200px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Add tags (comma separated)"
                            onChange={(e) => field.onChange(e.target.value.split(",").map((tag) => tag.trim()).filter(tag => tag !== ""))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button disabled={isSubmitting} type="submit"> {!isSubmitting ? "Post Question": <Loader2 className="h-6 m-auto w-12 animate-spin text-white-600 mb-4 "/> }</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input 
                placeholder="Search questions..." 
                className="max-w-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <Button type="submit">Search</Button>
            </form>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {loading ? (
            <p className="text-center py-10">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="text-center py-10">No questions found. Be the first to ask!</p>
          ) : (
            questions.map((question) => (
              <Card key={question._id?.toString()} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={question.author.image} alt={question.author.name} />
                      <AvatarFallback>{question.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>{question.author.name}</span>
                        <span>•</span>
                        <span>{format(new Date(question.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">{question.content}</p>
                  <div className="flex gap-2 mt-4">
                    {question.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex gap-4">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <ThumbsUp className="h-4 w-4" />
                      {question.upvotes.length}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {question.answers.length} Answers
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 hover:bg-secondary"
                      >
                        <Link href={`/Q&A/${question._id}`}>
                         View Response
                        </Link>
                      </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}