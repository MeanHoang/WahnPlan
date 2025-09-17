"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  CheckSquare,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchApi } from "@/hooks/use-fetch-api";
import { useCreateApi } from "@/hooks/use-create-api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { formatTime } from "@/lib/time-helpers";
import { apiRequest } from "@/lib/api-request";

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(
    null
  );
  const [showCommentMenu, setShowCommentMenu] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(Date.now());

  // Common emoji reactions
  const commonEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡", "🎉", "👏"];

  // Helper function to compare comments and detect changes
  const compareComments = useCallback(
    (oldComments: Comment[], newComments: Comment[]) => {
      const oldMap = new Map(
        oldComments.map((comment) => [comment.id, comment])
      );
      const newMap = new Map(
        newComments.map((comment) => [comment.id, comment])
      );

      const changes = {
        newComments: [] as Comment[],
        updatedComments: [] as Comment[],
        hasChanges: false,
      };

      // Check for new comments
      for (const newComment of newComments) {
        if (!oldMap.has(newComment.id)) {
          changes.newComments.push(newComment);
          changes.hasChanges = true;
        }
      }

      // Check for updated comments
      for (const [id, newComment] of newMap) {
        const oldComment = oldMap.get(id);
        if (
          oldComment &&
          (oldComment.contentPlain !== newComment.contentPlain ||
            oldComment.updatedAt !== newComment.updatedAt ||
            oldComment.commentReactions.length !==
              newComment.commentReactions.length ||
            oldComment.commentAttachments.length !==
              newComment.commentAttachments.length)
        ) {
          changes.updatedComments.push(newComment);
          changes.hasChanges = true;
        }
      }

      return changes;
    },
    []
  );

  // Smart polling function using apiRequest
  const pollForUpdates = useCallback(async () => {
    try {
      // Use apiRequest with the same URL format as useFetchApi
      const result = await apiRequest<{
        comments: Comment[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>(`/task-comments/task/${taskId}`, {
        query: {
          page: 1,
          limit: 50,
        },
      });

      if (result?.comments) {
        // Sort comments: oldest first, newest last (like chat)
        const newComments = result.comments.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const changes = compareComments(comments, newComments);

        if (changes.hasChanges) {
          setComments(newComments);

          // Add new comments to highlight set
          if (changes.newComments.length > 0) {
            const newIds = new Set(changes.newComments.map((c) => c.id));
            setNewCommentIds((prev) => new Set([...prev, ...newIds]));

            // Remove highlight after 3 seconds
            setTimeout(() => {
              setNewCommentIds((prev) => {
                const updated = new Set(prev);
                newIds.forEach((id) => updated.delete(id));
                return updated;
              });
            }, 3000);
          }
        }
      }
    } catch (error) {
      console.error("Error polling for comments:", error);
    }
  }, [comments, compareComments, taskId]);

  // Start polling after initial load
  useEffect(() => {
    if (comments.length > 0) {
      pollingIntervalRef.current = setInterval(pollForUpdates, 5000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [comments.length, pollForUpdates]);

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
  }>(`/task-comments/task/${taskId}?page=1&limit=50`);

  // Update local comments when data changes
  useEffect(() => {
    if (commentsData?.comments) {
      // Sort comments: oldest first, newest last (like chat)
      const sortedComments = commentsData.comments.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setComments(sortedComments);
    }
  }, [commentsData]);

  // Create comment
  const { mutate: createComment, loading: isCreating } = useCreateApi<
    {
      taskId: string;
      contentJson: any;
      contentPlain: string;
    },
    Comment
  >("/task-comments", {
    onSuccess: (newCommentData) => {
      setNewComment("");
      // Optimistically add the new comment to local state and sort
      setComments((prev) => {
        const updated = [...prev, newCommentData];
        return updated.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      // Add to highlight set
      setNewCommentIds((prev) => new Set([...prev, newCommentData.id]));
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setNewCommentIds((prev) => {
          const updated = new Set(prev);
          updated.delete(newCommentData.id);
          return updated;
        });
      }, 3000);

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

  // Add reaction to comment
  const handleAddReaction = async (commentId: string, emoji: string) => {
    try {
      const result = await apiRequest(`/comment-reactions/${commentId}`, {
        method: "POST",
        body: { emoji },
      });

      // Refetch comments to get updated reactions
      refetchComments();
      setShowReactionPicker(null);

      toast({
        title: "Success",
        description: "Reaction added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      });
    }
  };

  // Group reactions by emoji
  const getReactionGroups = (reactions: Comment["commentReactions"]) => {
    const groups = new Map<string, Comment["commentReactions"]>();
    reactions.forEach((reaction) => {
      const emoji = reaction.emoji;
      if (!groups.has(emoji)) {
        groups.set(emoji, []);
      }
      groups.get(emoji)!.push(reaction);
    });
    return groups;
  };

  // Check if current user has reacted with specific emoji
  const hasUserReacted = (
    reactions: Comment["commentReactions"],
    emoji: string
  ) => {
    return reactions.some(
      (reaction) => reaction.emoji === emoji && reaction.user.id === user?.id
    );
  };

  // Check if current user can edit/delete comment
  const canEditComment = (comment: Comment) => {
    return comment.author.id === user?.id;
  };

  // Edit comment
  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.contentPlain);
    setShowCommentMenu(null);
  };

  // Save edited comment
  const handleSaveEdit = async (commentId: string) => {
    if (!editCommentText.trim()) return;

    try {
      await apiRequest(`/task-comments/${commentId}`, {
        method: "PATCH",
        body: {
          contentJson: { text: editCommentText },
          contentPlain: editCommentText,
        },
      });

      setEditingCommentId(null);
      setEditCommentText("");
      refetchComments();

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await apiRequest(`/task-comments/${commentId}`, {
        method: "DELETE",
      });

      setShowCommentMenu(null);
      refetchComments();

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  // Use the helper function for consistent time formatting
  const formatDate = (dateString: string) => formatTime(dateString);

  // Get comments to display based on showAllComments state
  const getCommentsToDisplay = (): Comment[] => {
    if (comments.length <= 2 || showAllComments) {
      return comments;
    }

    // Show first and last comment only when there are 3+ comments
    const firstComment = comments[0];
    const lastComment = comments[comments.length - 1];

    if (!firstComment || !lastComment) {
      return comments;
    }

    return [firstComment, lastComment];
  };

  // Get middle comments count
  const getMiddleCommentsCount = () => {
    if (comments.length <= 2) return 0;
    return comments.length - 2;
  };

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

  // Close reaction picker and comment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showReactionPicker) {
        setShowReactionPicker(null);
      }
      if (showCommentMenu) {
        setShowCommentMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showReactionPicker, showCommentMenu]);

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>

      {/* Comments List */}
      <div className="relative mb-6">
        {/* Vertical line connecting comments */}
        {comments && comments.length > 0 && (
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
        )}

        <div className="space-y-1">
          {commentsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
            </div>
          ) : comments?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <>
              {getCommentsToDisplay().map((comment, index) => (
                <div key={comment.id}>
                  <div
                    className={`relative flex gap-4 transition-all duration-500 ease-in-out ${
                      newCommentIds.has(comment.id)
                        ? "bg-blue-50 border-l-4 border-blue-400 pl-2 py-2 rounded-r-md"
                        : ""
                    }`}
                  >
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
                          <span className="text-xs text-gray-400">
                            (edited)
                          </span>
                        )}
                      </div>

                      {/* Comment Text */}
                      {editingCommentId === comment.id ? (
                        <div className="mb-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={!editCommentText.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                          {comment.contentPlain}
                        </p>
                      )}

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
                          {Array.from(
                            getReactionGroups(comment.commentReactions)
                          ).map(([emoji, reactions]) => (
                            <button
                              key={emoji}
                              onClick={() =>
                                handleAddReaction(comment.id, emoji)
                              }
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                                hasUserReacted(comment.commentReactions, emoji)
                                  ? "bg-blue-100 border-blue-300 text-blue-700"
                                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <span>{emoji}</span>
                              <span>{reactions.length}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Reaction Buttons - positioned on the right */}
                    <div className="flex-shrink-0 flex items-start gap-1 relative">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          onClick={() =>
                            setShowReactionPicker(
                              showReactionPicker === comment.id
                                ? null
                                : comment.id
                            )
                          }
                        >
                          <Smile className="h-3 w-3" />
                        </Button>

                        {/* Reaction Picker */}
                        {showReactionPicker === comment.id && (
                          <div className="absolute top-8 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                            <div className="flex gap-1">
                              {commonEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleAddReaction(comment.id, emoji)
                                  }
                                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                                  disabled={false}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Comment Menu - only show for user's own comments */}
                      {canEditComment(comment) && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            onClick={() =>
                              setShowCommentMenu(
                                showCommentMenu === comment.id
                                  ? null
                                  : comment.id
                              )
                            }
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>

                          {/* Comment Menu */}
                          {showCommentMenu === comment.id && (
                            <div className="absolute top-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                              <button
                                onClick={() => handleEditComment(comment)}
                                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="h-3 w-3" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Show More Button - between first and last comment */}
                  {comments.length > 2 && !showAllComments && index === 0 && (
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllComments(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        Show {getMiddleCommentsCount()} more comments
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </>
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
