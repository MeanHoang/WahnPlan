"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MembersSidebar } from "../../../../components/workspaces/members-sidebar";
import { MembersContent } from "../../../../components/workspaces/members-content";

export default function WorkspaceMembersPage(): JSX.Element {
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200">
          <MembersSidebar workspaceId={workspaceId} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <MembersContent workspaceId={workspaceId} />
        </div>
      </div>
    </DashboardLayout>
  );
}
