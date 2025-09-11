"use client";

import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WorkspaceSettings } from "../../../../components/workspaces/workspace-settings";

export default function WorkspaceSettingsPage(): JSX.Element {
  const params = useParams();
  const workspaceId = params.id as string;

  return (
    <DashboardLayout>
      <WorkspaceSettings workspaceId={workspaceId} />
    </DashboardLayout>
  );
}
