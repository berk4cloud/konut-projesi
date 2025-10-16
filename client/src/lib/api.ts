export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// API functions
export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Houses
  getHouses: (params?: { date?: string; city?: string; showEmptyOnly?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append("date", params.date);
    if (params?.city) searchParams.append("city", params.city);
    if (params?.showEmptyOnly) searchParams.append("showEmptyOnly", "true");
    
    const query = searchParams.toString();
    return apiRequest(`/api/houses${query ? `?${query}` : ""}`);
  },

  // Workers
  getWorkers: () => apiRequest("/api/workers"),

  // Reservations
  createReservation: (data: {
    workerId: string;
    bedId: string;
    startDate: string;
    endDate?: string;
    dailyRate?: string;
  }) =>
    apiRequest("/api/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
