"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { formatTime } from "@/lib/time-helpers";

interface Comment {
  id: string;
  contentPlain: string;
  contentJson: any;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    fullname: string;
    publicName: string;
    avatarUrl: string;
  };
  commentAttachments: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    mimeType: string;
  }>;
  commentReactions: Array<{
    id: string;
    emoji: string;
    user: {
      id: string;
      email: string;
      fullname: string;
      publicName: string;
      avatarUrl: string;
    };
  }>;
  commentMentions: Array<{
    id: string;
    mentionedUser: {
      id: string;
      email: string;
      fullname: string;
      publicName: string;
      avatarUrl: string;
    };
  }>;
}

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps): JSX.Element {
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Force re-render every minute to update relative time
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render by updating a dummy state
      setShowEmojiPicker((prev) => prev);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch comments
  const {
    data: commentsData,
    loading: commentsLoading,
    refetch: refetchComments,
  } = useFetchApi<{
    comments: Comment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/task-comments/task/${taskId}?page=1&limit=20`);

  // Create comment
  const { mutate: createComment, loading: isCreating } = useCreateApi<
    {
      taskId: string;
      contentJson: any;
      contentPlain: string;
    },
    Comment
  >("/task-comments", {
    onSuccess: () => {
      setNewComment("");
      refetchComments();
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    createComment({
      taskId,
      contentJson: { text: newComment },
      contentPlain: newComment,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // Use the helper function for consistent time formatting
  const formatDate = (dateString: string) => formatTime(dateString);

  const getUserDisplayName = (user: Comment["author"]) => {
    return user.publicName || user.fullname || user.email;
  };

  const getUserAvatar = (user: Comment["author"]) => {
    if (user.avatarUrl) {
      return (
        <img
          src={user.avatarUrl}
          alt={getUserDisplayName(user)}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
        {getUserDisplayName(user).charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>

      {/* Comments List */}
      <div className="relative mb-6">
        {/* Vertical line connecting comments */}
        {commentsData?.comments && commentsData.comments.length > 0 && (
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
        )}

        <div className="space-y-6">
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
            </div>
          ) : commentsData?.comments?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            commentsData?.comments?.map((comment, index) => (
              <div key={comment.id} className="relative flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 relative z-10">
                  {getUserAvatar(comment.author)}
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0 w-64">
                  {/* Comment Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {getUserDisplayName(comment.author)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.isEdited && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>

                  {/* Comment Text */}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                    {comment.contentPlain}
                  </p>

                  {/* Attachments */}
                  {comment.commentAttachments?.length > 0 && (
                    <div className="mb-2 space-y-1">
                      {comment.commentAttachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Paperclip className="h-3 w-3" />
                          <a
                            href={attachment.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {attachment.fileName}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {comment.commentReactions?.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {comment.commentReactions.map((reaction) => (
                        <span
                          key={reaction.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs border border-gray-200"
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-gray-600">
                            {getUserDisplayName(reaction.user)}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reaction Buttons - positioned on the right */}
                <div className="flex-shrink-0 flex items-start gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <CheckSquare className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.publicName || user.fullname || user.email}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
              {(user?.publicName || user?.fullname || user?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 w-64">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a comment..."
            className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-700 placeholder-gray-500 min-h-[60px]"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
