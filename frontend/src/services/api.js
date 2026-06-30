const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const getHeaders = () => {
  return { 'Content-Type': 'application/json' };
};

async function handleResponse(res) {
  if (!res.ok) {

    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.detail || res.statusText, res.status);
  }
  return res.json();
}

export const fetchEvents = async () => {
  const res = await fetch(`${BASE_URL}/api/events`, { credentials: 'omit' });
  return handleResponse(res);
};

export const fetchStats = async () => {
  const res = await fetch(`${BASE_URL}/api/stats`, { credentials: 'omit' });
  return handleResponse(res);
};

export const fetchConfig = async () => {
  const res = await fetch(`${BASE_URL}/api/config`, { credentials: 'omit' });
  return handleResponse(res);
};

export const triggerPipelineRun = async () => {
  const res = await fetch(`${BASE_URL}/api/run`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(res);
};

export const fetchRunStatus = async () => {
  const res = await fetch(`${BASE_URL}/api/run/status`);
  return handleResponse(res);
};

export const updateConfig = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/config`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};
