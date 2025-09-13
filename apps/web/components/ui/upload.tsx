"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, File, Image, Video } from "lucide-react";

interface UploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function UploadComponent({
  onUpload,
  accept = "image/*",
  maxSize = 10,
  className = "",
  disabled = false,
  children,
}: UploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      toast({
        title: "Upload successful",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const getFileIcon = () => {
    if (accept.includes("image")) return <Image className="w-8 h-8" />;
    if (accept.includes("video")) return <Video className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {children || (
        <>
          <div className="flex justify-center mb-4 text-gray-400">
            {getFileIcon()}
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-xs text-gray-500">Max file size: {maxSize}MB</p>
        </>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Uploading...</p>
        </div>
      )}
    </div>
  );
}

// Avatar Upload Component
interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  onUpload,
  onRemove,
  disabled = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar size must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemove) return;

    setIsRemoving(true);
    try {
      await onRemove();
      toast({
        title: "Avatar removed",
        description: "Your avatar has been removed",
      });
    } catch (error) {
      toast({
        title: "Remove failed",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-2xl font-medium">
              {getInitials("User")}
            </span>
          </div>
        )}

        {(isUploading || isRemoving) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {currentAvatar ? "Change" : "Upload"}
        </Button>

        {currentAvatar && onRemove && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || isRemoving}
          >
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
