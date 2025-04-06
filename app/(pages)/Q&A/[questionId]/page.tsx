"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { MessageCircle, ThumbsUp, ArrowLeft, CornerDownRight } from "lucide-react";
import { Question, Answer, Reply, Reaction } from "@/models/Questions";
import { AnswerFormData, ReplyFormData, answerSchema, replySchema } from "@/schemas/questionsForm";
import { format } from "date-fns";
import Link from "next/link";
import Loading from "@/components/Loading";
import axios from "axios";

export default function QuestionDetail() {
  const { data: session } = useSession();
  const params = useParams<{ questionId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const answerForm = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
    defaultValues: { content: "" },
  });

  const replyForm = useForm<ReplyFormData>({
    resolver: zodResolver(replySchema),
    defaultValues: { content: "" },
  });

  useEffect(() => {
    fetchQuestion();
  }, [params.questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`/api/questions/${params.questionId}`);
      if(response.data.success){
      setQuestion(response.data.question);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  const onSubmitAnswer = async (data: AnswerFormData) => {
    try {
      const response = await axios.post(`/api/questions/${params.questionId}/answers`, 
        data
      );

      if (response.data.success) {
        answerForm.reset();
        fetchQuestion();
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const onSubmitReply = async (data: ReplyFormData) => {
    if (!replyingTo) return;

    try {
      const response = await axios.post(
        `/api/questions/${params.questionId}/answers/${replyingTo}/replies`,
         data
      );

      if (response.data.success) {
        replyForm.reset();
        setReplyingTo(null);
        fetchQuestion();
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleReaction = async (answerId: string, reaction: Reaction) => {
    try {
      await axios.post(`/api/questions/${params.questionId}/answers/${answerId}/react`, {
        reaction
      });
      fetchQuestion();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleReplyReaction = async (answerId: string, reaction: Reaction, replyId: string) => {
    try {
      await axios.post(`/api/questions/${params.questionId}/answers/${answerId}/replies/${replyId}/react`, {
        reaction
      });
      fetchQuestion();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleUpvote = async () => {
    try {
      await axios.post(`/api/questions/${params.questionId}/upvote`, {});
      fetchQuestion();
    } catch (error) {
      console.error("Error upvoting question:", error);
    }
  };

  if (!question) {
    return <div><Loading /></div>;
  }

  const reactions: Reaction[] = ["❤️", "👍", "👎", "😂", "🤔"];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/Q&A" className="flex items-center gap-2 text-muted-foreground mb-6 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Q&A
        </Link>

        {/* Question Card - Reddit Style */}
        <Card className="mb-8 overflow-hidden border shadow-md hover:shadow-lg transition-shadow">
          <div className="flex">
            {/* Left side vote column */}
            <div className="flex flex-col items-center justify-center py-4 px-2 bg-secondary/20">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-full"
                onClick={handleUpvote}
                disabled={!session}
              >
                <ThumbsUp className="h-5 w-5" />
              </Button>
              <span className="text-lg font-bold my-1">{question.upvotes.length}</span>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={question.author.image} alt={question.author.name} />
                    <AvatarFallback>{question.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{question.author.name}</span>
                  <span>•</span>
                  <span>{format(new Date(question.createdAt), "MMM d, yyyy")}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold mb-4">{question.content}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {question.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Answer form */}
        {session && (
          <Card className="mb-8 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...answerForm}>
                <form onSubmit={answerForm.handleSubmit(onSubmitAnswer)} className="space-y-4">
                  <FormField
                    control={answerForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Write your answer..."
                            className="min-h-[150px] border-dashed focus:border-solid"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Post Answer</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Answers Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {question.answers.length} {question.answers.length === 1 ? "Answer" : "Answers"}
            </h2>
            {/* You could add sorting options here */}
          </div>

          {question.answers.map((answer) => (
            <Card key={answer._id.toString()} className="mb-4 border-l-4 border-l-primary/30 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={answer.author.image} alt={answer.author.name} />
                    <AvatarFallback>{answer.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{answer.author.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(answer.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-base">{answer.content}</p>
                
                {/* Action buttons and reactions */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 rounded-r-none border-r"
                      onClick={() => handleReaction(answer._id.toString(), "👍")}
                      disabled={!session}
                    >
                      👍 
                      <span className="text-xs font-medium">
                        {answer.reactions.find((r) => r.type === "👍")?.users.length || 0}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 rounded-l-none"
                      onClick={() => handleReaction(answer._id.toString(), "👎")}
                      disabled={!session}
                    >
                      👎
                      <span className="text-xs font-medium">
                        {answer.reactions.find((r) => r.type === "👎")?.users.length || 0}
                      </span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {reactions.filter(r => r !== "👍" && r !== "👎").map((reaction) => (
                      <Button
                        key={reaction}
                        variant="ghost"
                        size="sm"
                        className="px-2 h-8 rounded-full hover:bg-secondary"
                        onClick={() => handleReaction(answer._id.toString(), reaction)}
                        disabled={!session}
                      >
                        {reaction}
                        <span className="ml-1 text-xs">
                          {answer.reactions.find((r) => r.type === reaction)?.users.length || 0}
                        </span>
                      </Button>
                    ))}
                  </div>
                  
                  {session && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground ml-auto"
                      onClick={() => setReplyingTo(answer._id.toString())}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === answer._id.toString() && (
                  <div className="mt-4 pl-4 border-l-2 border-primary/30">
                    <Form {...replyForm}>
                      <form onSubmit={replyForm.handleSubmit(onSubmitReply)} className="space-y-4">
                        <FormField
                          control={replyForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Write your reply..."
                                  className="min-h-[100px] border-dashed focus:border-solid"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" size="sm" className="bg-primary/90 hover:bg-primary">
                            Post Reply
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}

                {/* Replies */}
                {answer.replies.length > 0 && (
                  <div className="mt-6 space-y-4">
                    {answer.replies.map((reply) => (
                      <div key={reply._id.toString()} className="pl-6 border-l-2 border-secondary">
                        <div className="bg-secondary/5 rounded-lg p-3 hover:bg-secondary/10 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <CornerDownRight className="h-3 w-3 text-muted-foreground" />
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.author.image} alt={reply.author.name} />
                              <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{reply.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(reply.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <p className="text-sm ml-5">{reply.content}</p>
                          
                          {/* Reply reactions */}
                          <div className="flex flex-wrap items-center gap-2 mt-2 ml-5">
                            <div className="flex items-center scale-90 origin-left">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 p-0 h-7 w-8 rounded-r-none border-r"
                                onClick={() => handleReplyReaction(answer._id.toString(), "👍", reply._id.toString())}
                                disabled={!session}
                              >
                                👍 
                                <span className="text-xs">
                                  {reply.reactions.find((r) => r.type === "👍")?.users.length || 0}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 p-0 h-7 w-8 rounded-l-none"
                                onClick={() => handleReplyReaction(answer._id.toString(), "👎", reply._id.toString())}
                                disabled={!session}
                              >
                                👎
                                <span className="text-xs">
                                  {reply.reactions.find((r) => r.type === "👎")?.users.length || 0}
                                </span>
                              </Button>
                            </div>
                            
                            {reactions.filter(r => r !== "👍" && r !== "👎").map((reaction) => (
                              <Button
                                key={reaction}
                                variant="ghost"
                                size="sm"
                                className="px-1 h-6 text-xs rounded-full hover:bg-secondary"
                                onClick={() => handleReplyReaction(answer._id.toString(), reaction, reply._id.toString())}
                                disabled={!session}
                              >
                                {reaction}
                                <span className="ml-1 text-xs">
                                  {reply.reactions.find((r) => r.type === reaction)?.users.length || 0}
                                </span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {question.answers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-secondary/5 rounded-lg">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No answers yet. Be the first to respond!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}