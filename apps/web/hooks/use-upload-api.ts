import { useState, useCallback } from "react";
import { apiRequest } from "@/lib/api-request";

// useUploadApi Hook
export function useUploadApi<TResponse>(
  endpoint: string,
  options?: {
    onSuccess?: (data: TResponse) => void;
    onError?: (error: Error) => void;
  }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    async (file: File, additionalData?: Record<string, any>) => {
      try {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        // Add additional data if provided
        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
          });
        }

        const result = await apiRequest<TResponse>(endpoint, {
          method: "POST",
          body: formData,
          // Don't set Content-Type header, let browser set it with boundary for FormData
        });

        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, options]
  );

  return { upload, loading, error };
}

// useAvatarUpload Hook
export function useAvatarUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadAvatar = useCallback(async (file: File) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("avatar", file);

      const result = await apiRequest<{ url: string }>("/upload/avatar", {
        method: "POST",
        body: formData,
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAvatar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiRequest<{ message: string }>("/upload/avatar", {
        method: "DELETE",
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadAvatar, deleteAvatar, loading, error };
}

// useVideoUpload Hook
export function useVideoUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadVideo = useCallback(async (file: File, folder?: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("video", file);
      if (folder) {
        formData.append("folder", folder);
      }

      const result = await apiRequest<{ url: string }>("/upload/video", {
        method: "POST",
        body: formData,
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadVideo, loading, error };
}

// useFileUpload Hook
export function useFileUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(async (file: File, folder?: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      if (folder) {
        formData.append("folder", folder);
      }

      const result = await apiRequest<{ url: string }>("/upload/file", {
        method: "POST",
        body: formData,
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFile = useCallback(async (publicId: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiRequest<{ message: string }>("/upload/file", {
        method: "DELETE",
        body: { publicId },
      });

      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return { uploadFile, deleteFile, loading, error };
}
