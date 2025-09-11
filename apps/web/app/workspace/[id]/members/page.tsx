"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MembersContent } from "../../../../components/workspaces/members-content";

export default function WorkspaceMembersPage(): JSX.Element {
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <DashboardLayout>
      <MembersContent workspaceId={workspaceId} />
    </DashboardLayout>
  );
}
