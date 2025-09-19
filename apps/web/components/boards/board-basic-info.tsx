"use client";

import { useState } from "react";
import { Save, Edit3, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateApi } from "@/hooks/use-update-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/language-context";
import { Board } from "@/types/board-core";
import { DeleteBoardDialog } from "./delete-board-dialog";

interface BoardBasicInfoProps {
  board: Board;
  onBoardUpdate?: (updatedBoard: Board) => void;
  onBoardDeleted?: () => void;
}

export function BoardBasicInfo({
  board,
  onBoardUpdate,
  onBoardDeleted,
}: BoardBasicInfoProps): JSX.Element {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: board.title,
    description: board.subtitle || "",
  });

  const { mutate: updateBoard, loading } = useUpdateApi<any, Board>(
    `/boards/${board.id}`
  );

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      title: board.title,
      description: board.subtitle || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: board.title,
      description: board.subtitle || "",
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        toast({
          title: t("common.error"),
          description: t("board.basicInfo.titleRequired"),
          variant: "destructive",
        });
        return;
      }

      const updatedBoard = await updateBoard({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      if (updatedBoard) {
        onBoardUpdate?.(updatedBoard);
        setIsEditing(false);
        toast({
          title: t("common.success"),
          description: t("board.basicInfo.updatedSuccess"),
        });
      }
    } catch (error) {
      console.error("Error updating board:", error);
      toast({
        title: t("common.error"),
        description: t("board.basicInfo.updateFailed"),
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">
                {t("board.basicInfo.boardInformation")}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {t("board.basicInfo.manageBasicInformation")}
              </CardDescription>
            </div>
            {!isEditing && (
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                {t("board.basicInfo.edit")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Board Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("board.basicInfo.boardTitle")}
            </label>
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder={t("board.basicInfo.enterBoardTitle")}
                className="text-base font-medium"
                maxLength={100}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border">
                <p className="text-base font-medium text-gray-900">
                  {board.title}
                </p>
              </div>
            )}
          </div>

          {/* Board Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {t("board.basicInfo.description")}
            </label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder={t("board.basicInfo.enterBoardDescription")}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
                {board.subtitle ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {board.subtitle}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    {t("board.basicInfo.noDescriptionProvided")}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Board Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {board._count?.tasks || 0}
              </div>
              <div className="text-sm text-blue-600 font-medium">
                {t("board.basicInfo.totalTasks")}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {board._count?.taskStatuses || 0}
              </div>
              <div className="text-sm text-green-600 font-medium">
                {t("board.basicInfo.statuses")}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {board._count?.taskPriorities || 0}
              </div>
              <div className="text-sm text-purple-600 font-medium">
                {t("board.basicInfo.priorities")}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t("board.basicInfo.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                size="sm"
                disabled={loading || !formData.title.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {t("board.basicInfo.saveChanges")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Board Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            {t("board.basicInfo.boardSettings")}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t("board.basicInfo.additionalConfigurationOptions")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                {t("board.basicInfo.boardVisibility")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("board.basicInfo.controlWhoCanViewAndAccess")}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {t("board.basicInfo.privateBoard")}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">
                {t("board.basicInfo.created")}
              </h4>
              <p className="text-sm text-gray-600">
                {t("board.basicInfo.whenThisBoardWasCreated")}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(board.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-0 shadow-sm border-red-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-red-600">
            {t("board.basicInfo.dangerZone")}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t("board.basicInfo.dangerZoneDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <h4 className="font-medium text-red-800">
                {t("board.delete.deleteBoard")}
              </h4>
              <p className="text-sm text-red-600">
                {t("board.basicInfo.deleteBoardDescription")}
              </p>
            </div>
            <DeleteBoardDialog board={board} onBoardDeleted={onBoardDeleted} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
