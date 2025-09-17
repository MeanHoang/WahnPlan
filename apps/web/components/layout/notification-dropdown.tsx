"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  Calendar,
  Users,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchApi, useUpdateApi } from "@/hooks";
import {
  Notification,
  NotificationType,
  NotificationResponse,
} from "@/types/notification";
import { useToast } from "@/hooks/use-toast";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
}: NotificationDropdownProps): JSX.Element {
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  // Fetch notifications
  const {
    data: notificationsData,
    loading,
    refetch,
  } = useFetchApi<NotificationResponse>("/notifications", {
    limit: "20",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch unread count
  const { data: unreadData, refetch: refetchUnread } = useFetchApi<{
    unreadCount: number;
  }>("/notifications/unread-count");

  // Mark as read mutation
  const { mutate: markAsRead } = useUpdateApi<any, { message: string }>(
    "/notifications"
  );
  const { mutate: markAllAsRead } = useUpdateApi<
    any,
    { message: string; count: number }
  >("/notifications/mark-all-read");
  const { mutate: deleteNotification } = useUpdateApi<any, { message: string }>(
    "/notifications"
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const notifications = notificationsData?.data || [];
  const unreadCount = unreadData?.unreadCount || 0;

  // Filter notifications based on active tab
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
      case NotificationType.TASK_UPDATED:
      case NotificationType.TASK_COMPLETED:
      case NotificationType.TASK_STATUS_CHANGED:
      case NotificationType.TASK_PRIORITY_CHANGED:
        return <Check className="h-4 w-4 text-blue-600" />;
      case NotificationType.COMMENT_ADDED:
      case NotificationType.MENTION:
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case NotificationType.TASK_DUE_SOON:
      case NotificationType.TASK_OVERDUE:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case NotificationType.WORKSPACE_INVITE:
      case NotificationType.WORKSPACE_ROLE_CHANGED:
        return <Users className="h-4 w-4 text-purple-600" />;
      case NotificationType.BOARD_CREATED:
        return <Settings className="h-4 w-4 text-indigo-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - new Date(date).getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      });
      refetch();
      refetchUnread();
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({
        url: "/notifications/mark-all-read",
        method: "PATCH",
      });
      refetch();
      refetchUnread();
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      });
      refetch();
      refetchUnread();
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return <></>;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === "unread"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">
              {activeTab === "unread"
                ? "You're all caught up!"
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            !notification.isRead
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-blue-600 hover:text-blue-700"
            onClick={() => {
              // Navigate to full notifications page
              window.location.href = "/notifications";
            }}
          >
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
