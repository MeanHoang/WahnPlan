// Examples of how to use the new individual API hooks

import { useFetchApi } from "./use-fetch-api";
import { useCreateApi } from "./use-create-api";
import { useUpdateApi } from "./use-update-api";
import { useDeleteApi } from "./use-delete-api";

// Example 1: Simple GET request
export function useUsers() {
  return useFetchApi<User[]>("/users");
}

// Example 2: GET with query parameters
export function useUsersWithPagination(page: number, limit: number) {
  return useFetchApi<{ users: User[]; total: number }>("/users", {
    page,
    limit,
  });
}

// Example 3: GET with conditional fetching
export function useUserProfile(userId: string, enabled: boolean) {
  return useFetchApi<User>(`/users/${userId}`, undefined, {
    enabled,
  });
}

// Example 4: POST request
export function useCreateUser() {
  return useCreateApi<CreateUserData, User>("/users", {
    onSuccess: (user) => {
      console.log("User created:", user);
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });
}

// Example 5: PATCH request
export function useUpdateUser(userId: string) {
  return useUpdateApi<UpdateUserData, User>(`/users/${userId}`, {
    onSuccess: (user) => {
      console.log("User updated:", user);
    },
  });
}

// Example 6: DELETE request
export function useDeleteUser(userId: string) {
  return useDeleteApi(`/users/${userId}`, {
    onSuccess: () => {
      console.log("User deleted");
    },
  });
}

// Example 7: Complex API with callbacks
export function useCreateProject() {
  return useCreateApi<CreateProjectData, Project>("/projects", {
    onSuccess: (project) => {
      console.log("Project created:", project);
      // You can add navigation or other side effects here
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    },
  });
}

// Example 8: API with custom headers (you can extend the hooks for this)
export function useUploadFile() {
  return useCreateApi<FormData, { url: string }>("/upload", {
    onSuccess: (data) => {
      console.log("File uploaded:", data.url);
    },
  });
}

// Types for examples
interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateUserData {
  name: string;
  email: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface CreateProjectData {
  name: string;
  description: string;
}
