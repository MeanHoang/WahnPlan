-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('task_assigned', 'task_updated', 'task_completed', 'task_due_soon', 'task_overdue', 'comment_added', 'mention', 'workspace_invite', 'workspace_role_changed', 'board_created', 'task_status_changed', 'task_priority_changed', 'task_tester_assigned', 'task_reviewer_assigned');

-- CreateEnum
CREATE TYPE "public"."NotificationStatus" AS ENUM ('unread', 'read', 'archived');

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "status" "public"."NotificationStatus" NOT NULL DEFAULT 'unread',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
