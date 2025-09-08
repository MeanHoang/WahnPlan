const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

// Generic API request function
export async function apiRequest<T>(
  url: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    query?: Record<string, any>;
    headers?: Record<string, string>;
  } = {}
): Promise<T> {
  const { method = "GET", body, query, headers = {} } = options;

  // Build URL with query parameters
  let fullUrl = `${API_BASE_URL}${url}`;
  if (query && Object.keys(query).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    fullUrl += `?${searchParams.toString()}`;
  }

  // Get auth token
  const token = localStorage.getItem("accessToken");

  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(fullUrl, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
}
