export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function uploadLogsApi(payload: {
  text?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/logs/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

export async function uploadLogFilesApi(files: FileList | File[]): Promise<any> {
  const form = new FormData();
  const arr = Array.from(files);
  arr.forEach((file) => form.append("files", file));

  const res = await fetch(`${API_BASE_URL}/logs/upload`, {
    method: "POST",
    body: form
  });
  return handleResponse(res);
}

export async function analyzeSummaryApi(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/logs/analyze`, {
    method: "POST"
  });
  return handleResponse(res);
}

export async function fetchLogsApi(params: {
  level?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<any> {
  const query = new URLSearchParams();
  if (params.level) query.set("level", params.level);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));

  const res = await fetch(`${API_BASE_URL}/logs?${query.toString()}`);
  return handleResponse(res);
}

export async function clearLogsApi(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/logs`, {
    method: "DELETE"
  });
  return handleResponse(res);
}

export async function fetchPatternsApi(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/patterns`);
  return handleResponse(res);
}

export async function fetchCorrelationsApi(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/correlations`);
  return handleResponse(res);
}

export async function runAIDebugApi(payload: {
  question: string;
  service?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/ai/debug`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res);
}

