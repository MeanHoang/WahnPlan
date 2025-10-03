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
import { useRouter } from "next/navigation";
import { useTranslation } from "@/contexts/language-context";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: () => void;
  currentWorkspaceId?: string;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  onUnreadCountChange,
  currentWorkspaceId,
}: NotificationDropdownProps): JSX.Element {
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
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
  >("/notifications");
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

    if (diffInSeconds < 60) return t("notificationDropdown.justNow");
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)}${t("notificationDropdown.mAgo")}`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}${t("notificationDropdown.hAgo")}`;
    return `${Math.floor(diffInSeconds / 86400)}${t("notificationDropdown.dAgo")}`;
  };

  const handleNotificationClick = async (notification: Notification) => {
    console.log("Notification clicked:", notification);

    // Check if this is a task-related notification
    const taskRelatedTypes = [
      NotificationType.TASK_ASSIGNED,
      NotificationType.TASK_UPDATED,
      NotificationType.TASK_COMPLETED,
      NotificationType.TASK_STATUS_CHANGED,
      NotificationType.TASK_PRIORITY_CHANGED,
      NotificationType.TASK_DUE_SOON,
      NotificationType.TASK_OVERDUE,
      NotificationType.COMMENT_ADDED,
      NotificationType.MENTION,
    ];

    console.log("Notification type:", notification.type);
    console.log(
      "Is task related:",
      taskRelatedTypes.includes(notification.type)
    );
    console.log("Notification data:", notification.data);
    console.log("Has taskId:", notification.data?.taskId);

    if (
      taskRelatedTypes.includes(notification.type) &&
      notification.data?.taskId
    ) {
      try {
        console.log(
          "Fetching task details for taskId:",
          notification.data.taskId
        );

        let workspaceId = currentWorkspaceId;

        // If we don't have currentWorkspaceId, try to fetch from task
        if (!workspaceId) {
          const { apiRequest } = await import("@/lib/api-request");
          const task = await apiRequest<any>(
            `/tasks/${notification.data.taskId}`
          );
          console.log("Task details:", task);
          workspaceId = task?.board?.workspace?.id;
        }

        if (workspaceId) {
          const url = `/workspace/${workspaceId}/task/${notification.data.taskId}`;
          console.log("Navigating to:", url);

          // Mark as read before navigating
          if (!notification.isRead) {
            await handleMarkAsRead(notification.id);
          }

          // Navigate to the task detail page
          router.push(url);
          onClose();
          return;
        } else {
          console.log("WorkspaceId not found");
          toast({
            title: t("common.error"),
            description: t("notificationDropdown.unableToDetermineWorkspace"),
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching task details:", error);
        toast({
          title: t("common.error"),
          description: t("notificationDropdown.failedToLoadTaskDetails"),
          variant: "destructive",
        });
      }
    }

    // For non-task notifications or if task details couldn't be fetched, just mark as read
    if (!notification.isRead) {
      console.log("Marking notification as read");
      await handleMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(
        {},
        {
          endpoint: `/notifications/${notificationId}/read`,
          method: "PATCH",
        }
      );
      refetch();
      refetchUnread();
      onUnreadCountChange?.();
      toast({
        title: t("common.success"),
        description: t("notificationDropdown.notificationMarkedAsRead"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("notificationDropdown.failedToMarkAsRead"),
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(
        {},
        {
          endpoint: "/notifications/mark-all-read",
          method: "PATCH",
        }
      );
      refetch();
      refetchUnread();
      onUnreadCountChange?.();
      toast({
        title: t("common.success"),
        description: t("notificationDropdown.allNotificationsMarkedAsRead"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("notificationDropdown.failedToMarkAllAsRead"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Use apiRequest directly for delete
      const { apiRequest } = await import("@/lib/api-request");
      await apiRequest<{ message: string }>(
        `/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      refetch();
      refetchUnread();
      onUnreadCountChange?.();
      toast({
        title: t("common.success"),
        description: t("notificationDropdown.notificationDeleted"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("notificationDropdown.failedToDeleteNotification"),
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
          <h3 className="text-lg font-semibold text-gray-900">
            {t("notificationDropdown.notifications")}
          </h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                {t("notificationDropdown.markAllRead")}
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
            {t("notificationDropdown.all")}
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              activeTab === "unread"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("notificationDropdown.unread")} ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2">
              {t("notificationDropdown.loadingNotifications")}
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">
              {t("notificationDropdown.noNotifications")}
            </p>
            <p className="text-sm">
              {activeTab === "unread"
                ? t("notificationDropdown.youAreAllCaughtUp")
                : t("notificationDropdown.youDontHaveAnyNotificationsYet")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                    : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
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
            {t("notificationDropdown.viewAllNotifications")}
          </Button>
        </div>
      )}
    </div>
  );
}
