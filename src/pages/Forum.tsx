
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, AlertTriangle, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { moderateContent, getModerationHistory } from "@/utils/moderation";
import { useQuery } from "@tanstack/react-query";

const Forum = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  // Fetch moderation history
  const { data: moderationHistory } = useQuery({
    queryKey: ['moderationHistory'],
    queryFn: getModerationHistory
  });

  const handlePost = async () => {
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsPosting(true);
    
    try {
      // Check title
      const titleModeration = await moderateContent(title, 'forum');
      if (!titleModeration.isSafe) {
        toast({
          title: "Content Warning",
          description: `Title ${titleModeration.reason}`,
          variant: "destructive",
        });
        setIsPosting(false);
        return;
      }

      // Check content
      const contentModeration = await moderateContent(content, 'forum');
      if (!contentModeration.isSafe) {
        toast({
          title: "Content Warning",
          description: `Post ${contentModeration.reason}`,
          variant: "destructive",
        });
        setIsPosting(false);
        return;
      }

      // If both checks pass, proceed with posting
      toast({
        title: "Success",
        description: "Your post has been published",
      });

      // Clear the form
      setTitle("");
      setContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Anonymous Forum</h1>
            <div className="flex gap-2">
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                Moderation History
              </Button>
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share Your Story</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Title of your post"
                  className="w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="w-full min-h-[200px] p-4 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="Share your experience (completely anonymous)"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                    Content is automatically moderated for safety
                  </div>
                  <Button onClick={handlePost} disabled={isPosting}>
                    {isPosting ? "Posting..." : "Post Anonymously"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Moderation History */}
          {moderationHistory && moderationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Moderation Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderationHistory.map((entry) => (
                    <div key={entry.id} className="border-b pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                        <span className={`text-sm ${entry.is_flagged ? 'text-red-500' : 'text-green-500'}`}>
                          {entry.is_flagged ? 'Flagged' : 'Safe'}
                        </span>
                      </div>
                      <p className="text-sm mt-2">{entry.content_text.substring(0, 100)}...</p>
                      {entry.flag_reason && (
                        <p className="text-sm text-red-500 mt-1">
                          Reason: {entry.flag_reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sample Forum Posts */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">My Safety Journey</h3>
                <p className="text-gray-600 text-sm">
                  I wanted to share my experience with using this app and how it helped me feel safer during my late-night commutes...
                </p>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <span>2 hours ago</span>
                  <Button variant="ghost" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SOSButton />
    </div>
  );
};

export default Forum;
