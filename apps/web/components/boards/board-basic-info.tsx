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
import { Board } from "@/types/board-core";

interface BoardBasicInfoProps {
  board: Board;
  onBoardUpdate?: (updatedBoard: Board) => void;
}

export function BoardBasicInfo({ board, onBoardUpdate }: BoardBasicInfoProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: board.title,
    description: board.description || "",
  });

  const { mutate: updateBoard, loading } = useUpdateApi<any, Board>(
    `/boards/${board.id}`
  );

  const handleEdit = () => {
    setIsEditing(true);
    setFormData({
      title: board.title,
      description: board.description || "",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: board.title,
      description: board.description || "",
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        toast({
          title: "Error",
          description: "Board title is required",
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
          title: "Success",
          description: "Board information updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating board:", error);
      toast({
        title: "Error",
        description: "Failed to update board information",
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
                Board Information
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Manage basic information and settings for this board
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
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Board Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Board Title
            </label>
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter board title"
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
              Description
            </label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter board description (optional)"
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
                {board.description ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {board.description}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No description provided
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
                Total Tasks
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {board._count?.taskStatuses || 0}
              </div>
              <div className="text-sm text-green-600 font-medium">Statuses</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {board._count?.members || 0}
              </div>
              <div className="text-sm text-purple-600 font-medium">Members</div>
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
                Cancel
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
                Save Changes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Board Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Board Settings
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Additional configuration options for this board
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Board Visibility</h4>
              <p className="text-sm text-gray-600">
                Control who can view and access this board
              </p>
            </div>
            <div className="text-sm text-gray-500">Private Board</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Created</h4>
              <p className="text-sm text-gray-600">
                When this board was created
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(board.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
