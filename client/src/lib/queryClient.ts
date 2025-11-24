import { QueryClient, QueryFunction } from "@tanstack/react-query";
import mockApi, { initializeMockData } from "@/services/mockApi";

// Environment variable kontrolü - varsayılan olarak true (mock API kullan)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_DATA !== "false" && import.meta.env.VITE_USE_MOCK_DATA !== "0";

// Mock data'yı initialize et
if (USE_MOCK_API) {
  initializeMockData();
}

/**
 * URL'den endpoint ve parametreleri parse et
 */
function parseUrl(url: string): { endpoint: string; params: Record<string, string>; pathParams: Record<string, string> } {
  const [path, queryString] = url.split("?");
  const params: Record<string, string> = {};
  const pathParams: Record<string, string> = {};

  // Query params
  if (queryString) {
    queryString.split("&").forEach((param) => {
      const [key, value] = param.split("=");
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
  }

  return { endpoint: path, params, pathParams };
}

/**
 * Mock API'den Response objesi oluştur
 */
function createMockResponse(data: any, status: number = 200): Response {
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: "application/json" });
  
  // Response objesi oluştur
  const response = new Response(blob, {
    status,
    statusText: status >= 200 && status < 300 ? "OK" : status === 400 ? "Bad Request" : status === 401 ? "Unauthorized" : status === 403 ? "Forbidden" : status === 404 ? "Not Found" : "Error",
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Response.json() metodunu override et
  const originalJson = response.json.bind(response);
  response.json = async () => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return data;
    }
  };

  // ok property'sini ekle
  Object.defineProperty(response, 'ok', {
    value: status >= 200 && status < 300,
    writable: false,
  });

  return response;
}

/**
 * Mock API çağrısını gerçek API formatına dönüştür
 */
async function callMockApi(method: string, url: string, data?: unknown): Promise<Response> {
  try {
    const { endpoint, params } = parseUrl(url);
    let result: any;

    // Route matching ve mock API çağrıları
    if (endpoint === "/api/login" && method === "POST") {
      result = await mockApi.login(data as { email: string; password: string });
    } else if (endpoint === "/api/tenant/login" && method === "POST") {
      result = await mockApi.tenantLogin(data as { email: string; password: string });
    } else if (endpoint === "/api/platform/login" && method === "POST") {
      result = await mockApi.platformLogin(data as { email: string; password: string });
    } else if (endpoint === "/api/login/confirm" && method === "POST") {
      result = await mockApi.loginConfirm(data as { email: string; tenantId: string; role: string });
    } else if (endpoint === "/api/logout" && method === "POST") {
      result = await mockApi.logout();
    } else if (endpoint === "/api/countries" && method === "GET") {
      result = await mockApi.getCountries();
    } else if (endpoint.startsWith("/api/tenants/") && !endpoint.includes("/assignments") && !endpoint.includes("/charges") && !endpoint.includes("/payments") && method === "GET") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.getTenant(id);
    } else if (endpoint.startsWith("/api/tenants/") && !endpoint.includes("/assignments") && !endpoint.includes("/charges") && !endpoint.includes("/payments") && method === "PATCH") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.updateTenant(id, data as any);
    } else if (endpoint === "/api/workers" && method === "GET") {
      const tenantId = params.tenantId;
      result = await mockApi.getWorkers(tenantId);
    } else if (endpoint === "/api/workers-with-accommodation" && method === "GET") {
      const tenantId = params.tenantId;
      result = await mockApi.getWorkersWithAccommodation(tenantId);
    } else if (endpoint.startsWith("/api/workers/") && method === "GET") {
      const employmentId = endpoint.split("/").pop() || "";
      result = await mockApi.getWorker(employmentId);
    } else if (endpoint === "/api/workers" && method === "POST") {
      result = await mockApi.createWorker(data as any);
    } else if (endpoint.startsWith("/api/employments/") && method === "PATCH") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.updateEmployment(id, data as any);
    } else if (endpoint.startsWith("/api/worker-profiles/") && method === "PATCH") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.updateWorkerProfile(id, data as any);
    } else if (endpoint.startsWith("/api/worker-profiles/") && method === "GET") {
      const email = endpoint.split("/").pop() || "";
      result = await mockApi.getWorkerProfileByEmail(decodeURIComponent(email));
    } else if (endpoint.startsWith("/api/employments/worker/") && method === "GET") {
      const workerProfileId = endpoint.split("/").pop() || "";
      result = await mockApi.getEmploymentsByWorkerProfile(workerProfileId);
    } else if (endpoint === "/api/houses" && method === "GET") {
      // Query string'den tenantId ve date'i al
      const tenantId = params.tenantId;
      const date = params.date;
      result = await mockApi.getHouses(tenantId, date);
    } else if (endpoint === "/api/houses" && method === "POST") {
      result = await mockApi.createHouse(data as any);
    } else if (endpoint.startsWith("/api/houses/") && !endpoint.includes("/availability-conflicts") && method === "PATCH") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.updateHouse(id, data as any);
    } else if (endpoint.startsWith("/api/houses/") && !endpoint.includes("/availability-conflicts") && method === "DELETE") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.deleteHouse(id);
    } else if (endpoint.includes("/availability-conflicts") && method === "GET") {
      const parts = endpoint.split("/");
      const houseId = parts[2] || "";
      const startDate = params.startDate;
      const endDate = params.endDate;
      if (!startDate) {
        throw new Error("startDate query parameter required");
      }
      result = await mockApi.getAvailabilityConflicts(houseId, startDate, endDate);
    } else if (endpoint.startsWith("/api/beds/") && endpoint.includes("/check-in") && method === "POST") {
      // Parse bedId from URL: /api/beds/{bedId}/check-in
      const parts = endpoint.split("/");
      const bedId = parts[3] || ""; // /api/beds/{bedId}/check-in -> index 3
      console.log(`[QUERY CLIENT] Parsed bedId from endpoint "${endpoint}": ${bedId}`);
      if (!bedId) {
        throw new Error(`Invalid bedId in endpoint: ${endpoint}`);
      }
      result = await mockApi.checkInBed(bedId, data as any);
    } else if (endpoint.startsWith("/api/rooms/") && endpoint.includes("/check-in") && method === "POST") {
      // Parse roomId from URL: /api/rooms/{roomId}/check-in
      const parts = endpoint.split("/");
      const roomId = parts[3] || ""; // /api/rooms/{roomId}/check-in -> index 3
      console.log(`[QUERY CLIENT] Parsed roomId from endpoint "${endpoint}": ${roomId}`);
      if (!roomId) {
        throw new Error(`Invalid roomId in endpoint: ${endpoint}`);
      }
      result = await mockApi.checkInRoom(roomId, data as any);
    } else if (endpoint.startsWith("/api/beds/") && endpoint.includes("/future-reservations") && method === "GET") {
      const bedId = endpoint.split("/")[2] || "";
      const afterDate = params.afterDate;
      result = await mockApi.getFutureReservations(bedId, afterDate);
    } else if (endpoint === "/api/reservations" && method === "GET") {
      const tenantId = params.tenantId;
      const bedId = params.bedId;
      const active = params.active;
      result = await mockApi.getReservations(tenantId, bedId, active);
    } else if (endpoint.startsWith("/api/reservations/") && endpoint.includes("/check-out") && method === "PATCH") {
      const parts = endpoint.split("/");
      const id = parts[2] || "";
      result = await mockApi.checkOutReservation(id, data as any);
    } else if (endpoint.startsWith("/api/reservations/") && endpoint.includes("/notes") && method === "POST") {
      const parts = endpoint.split("/");
      const id = parts[2] || "";
      result = await mockApi.addReservationNote(id, data as any);
    } else if (endpoint.startsWith("/api/reservations/") && endpoint.includes("/notes") && method === "GET") {
      const parts = endpoint.split("/");
      const id = parts[2] || "";
      result = await mockApi.getReservationNotes(id);
    } else if (endpoint.startsWith("/api/qr-codes/") && endpoint.endsWith("/validate") && method === "GET") {
      const parts = endpoint.split("/");
      const code = parts[3] || "";
      result = await mockApi.validateQRCode(code);
    } else if (endpoint.startsWith("/api/qr-codes/") && method === "GET" && !endpoint.includes("/validate") && !endpoint.includes("/use")) {
      const parts = endpoint.split("/");
      const resourceId = parts[3] || "";
      if (resourceId.startsWith("tenant-")) {
        result = await mockApi.getQRCodes(resourceId);
      } else {
        result = await mockApi.getQRCodeByCode(resourceId);
      }
    } else if (endpoint === "/api/qr-codes" && method === "GET") {
      const tenantId = params.tenantId;
      result = await mockApi.getQRCodes(tenantId);
    } else if (endpoint === "/api/qr-codes" && method === "POST") {
      result = await mockApi.createQRCode(data as any);
    } else if (endpoint.startsWith("/api/qr-codes/") && method === "PATCH") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.updateQRCode(id, data as any);
    } else if (endpoint.startsWith("/api/qr-codes/") && method === "DELETE") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.deleteQRCode(id);
    } else if (endpoint.startsWith("/api/qr-codes/") && endpoint.includes("/use") && method === "POST") {
      const code = endpoint.split("/")[2] || "";
      result = await mockApi.useQRCode(code);
    } else if (endpoint === "/api/guest-registration-requests" && method === "POST") {
      result = await mockApi.createGuestRegistrationRequest(data as any);
    } else if (endpoint.startsWith("/api/guest-registration-requests/pending") && method === "GET") {
      const tenantId = params.tenantId;
      result = await mockApi.getPendingGuestRegistrationRequests(tenantId);
    } else if (endpoint.startsWith("/api/guest-registration-requests/by-code/") && method === "GET") {
      const code = endpoint.split("/").pop() || "";
      result = await mockApi.getGuestRegistrationRequestByQRCode(code);
    } else if (endpoint.startsWith("/api/guest-registration-requests/") && endpoint.endsWith("/approve") && method === "POST") {
      const parts = endpoint.split("/");
      const id = parts[3] || "";
      result = await mockApi.approveGuestRegistrationRequest(id);
    } else if (endpoint.startsWith("/api/guest-registration-requests/") && endpoint.endsWith("/reject") && method === "POST") {
      const parts = endpoint.split("/");
      const id = parts[3] || "";
      result = await mockApi.rejectGuestRegistrationRequest(id);
    } else if (endpoint.startsWith("/api/tenants/") && endpoint.includes("/assignments") && method === "GET") {
      const tenantId = endpoint.split("/")[2] || "";
      result = await mockApi.getAssignments(tenantId);
    } else if (endpoint.startsWith("/api/assignments/") && method === "GET") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.getAssignment(id);
    } else if (endpoint.startsWith("/api/tenants/") && endpoint.includes("/assignments") && method === "POST") {
      const tenantId = endpoint.split("/")[2] || "";
      result = await mockApi.createAssignment(tenantId, data as any);
    } else if (endpoint.startsWith("/api/assignments/") && method === "PATCH") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.updateAssignment(id, data as any);
    } else if (endpoint.startsWith("/api/assignments/") && method === "DELETE") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.deleteAssignment(id);
    } else if (endpoint.includes("/assignments/") && endpoint.includes("/notes") && method === "GET") {
      const parts = endpoint.split("/");
      const assignmentId = parts[parts.indexOf("assignments") + 1] || "";
      result = await mockApi.getAssignmentNotes(assignmentId);
    } else if (endpoint.includes("/assignments/") && endpoint.includes("/notes") && method === "POST") {
      const parts = endpoint.split("/");
      const tenantId = parts[parts.indexOf("tenants") + 1] || "";
      const assignmentId = parts[parts.indexOf("assignments") + 1] || "";
      result = await mockApi.createAssignmentNote(tenantId, assignmentId, data as any);
    } else if (endpoint.startsWith("/api/tenants/") && endpoint.includes("/charges") && method === "GET") {
      const tenantId = endpoint.split("/")[2] || "";
      result = await mockApi.getCharges(tenantId);
    } else if (endpoint.startsWith("/api/charges/") && method === "GET") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.getCharge(id);
    } else if (endpoint.startsWith("/api/tenants/") && endpoint.includes("/charges") && method === "POST") {
      const tenantId = endpoint.split("/")[2] || "";
      result = await mockApi.createCharge(tenantId, data as any);
    } else if (endpoint.startsWith("/api/charges/") && method === "PATCH") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.updateCharge(id, data as any);
    } else if (endpoint.startsWith("/api/charges/") && method === "DELETE") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.deleteCharge(id);
    } else if (endpoint.startsWith("/api/tenants/") && endpoint.includes("/payments") && method === "GET") {
      const tenantId = endpoint.split("/")[2] || "";
      result = await mockApi.getPayments(tenantId);
    } else if (endpoint.startsWith("/api/payments/") && method === "GET") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.getPayment(id);
    } else if (endpoint.startsWith("/api/tenants/") && endpoint.includes("/payments") && method === "POST") {
      const tenantId = endpoint.split("/")[2] || "";
      result = await mockApi.createPayment(tenantId, data as any);
    } else if (endpoint.startsWith("/api/payments/") && method === "DELETE") {
      const id = endpoint.split("/").pop() || "";
      result = await mockApi.deletePayment(id);
    } else {
      // Bilinmeyen endpoint - gerçek API'ye yönlendir veya hata ver
      if (USE_MOCK_API) {
        throw new Error(`Mock API: Endpoint not implemented: ${method} ${endpoint}`);
      }
      // Gerçek API'ye yönlendir
      return fetch(url, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
      });
    }

    return createMockResponse(result);
  } catch (error: any) {
    // Mock API hatalarını Response formatına çevir
    const status = error.status || 500;
    const message = error.message || "Internal Server Error";
    return createMockResponse({ error: message }, status);
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    let errorDetails: any = null;
    let fullError: any = null;
    
    try {
      const text = await res.text();
      if (text) {
        // Try to parse as JSON
        try {
          const json = JSON.parse(text);
          fullError = json;
          if (json.error) {
            errorMessage = json.error;
          } else if (json.message) {
            errorMessage = json.message;
          }
          if (json.details) {
            errorDetails = json.details;
          }
        } catch (parseError) {
          // If JSON parse fails, use text as error message
          errorMessage = text;
        }
      }
    } catch (e) {
      // If text() fails, use statusText
    }
    
    const error = new Error(errorMessage) as any;
    error.status = res.status;
    error.details = errorDetails;
    error.fullError = fullError;
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Mock API kullanılıyorsa
  if (USE_MOCK_API) {
    return await callMockApi(method, url, data);
  }

  // Gerçek API çağrısı
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;

    // Mock API kullanılıyorsa
    if (USE_MOCK_API) {
      try {
        const response = await callMockApi("GET", url);
        
        if (unauthorizedBehavior === "returnNull" && !response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error?.includes("401") || errorData.error?.includes("Unauthorized")) {
            return null;
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw error;
      }
    }

    // Gerçek API çağrısı
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 0, // Data immediately stale - always fetch fresh
      gcTime: 0, // Cache cleared immediately after unmount
      refetchOnMount: true, // Always refetch on component mount
      refetchOnWindowFocus: true, // Refetch when tab gains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Global fetch wrapper (LoginForm, Header vb. için)
// Sadece bir kez wrap et
if (!(window as any).__fetchWrapped && USE_MOCK_API) {
  const originalFetch = window.fetch;
  (window as any).__fetchWrapped = true;
  
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    
    // Mock API kullanılıyorsa ve /api ile başlıyorsa
    if (url && url.startsWith("/api/")) {
      const method = init?.method || "GET";
      let body: any = undefined;
      
      if (init?.body) {
        if (typeof init.body === "string") {
          try {
            body = JSON.parse(init.body);
          } catch {
            body = init.body;
          }
        } else {
          body = init.body;
        }
      }
      
      try {
        return await callMockApi(method, url, body);
      } catch (error: any) {
        const status = error.status || 500;
        const message = error.message || "Internal Server Error";
        return createMockResponse({ error: message }, status);
      }
    }

    // Gerçek fetch çağrısı
    return originalFetch(input, init);
  };
}
