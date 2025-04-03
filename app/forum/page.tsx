"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, ThumbsUp, MessageSquare } from "lucide-react";

export default function Forum() {
  const [posts] = useState([
    {
      id: 1,
      title: "How to improve communication?",
      content: "My partner and I have been struggling with communication lately...",
      author: "Sarah",
      likes: 15,
      comments: 8,
    },
    // Add more mock posts
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Relationship Forum</h1>
          <Button>
            <MessageCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="mb-4">
            <CardHeader>
              <Input placeholder="Search discussions..." />
            </CardHeader>
          </Card>

          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Posted by {post.author}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {post.comments} Comments
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}