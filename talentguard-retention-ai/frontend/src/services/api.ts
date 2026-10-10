import type { 
  HealthResponse, 
  MetricsResponse,
  WatchlistResponse,
  EmployeeBasic,
  EmployeeDetails,
  WhatIfRequest,
  WhatIfResponse,
  ExpectedLossResponse,
  ActionDraft
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Failed to fetch health status');
  return response.json();
}

export async function getMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/metrics`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
}

export async function getWatchlist(): Promise<WatchlistResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/watchlist`);
  if (!response.ok) throw new Error('Failed to fetch watchlist');
  return response.json();
}

export function getWatchlistDownloadUrl(): string {
  return `${API_BASE_URL}/api/v1/watchlist/download`;
}

export async function getEmployees(): Promise<EmployeeBasic[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/employees`);
  if (!response.ok) throw new Error('Failed to fetch employees');
  return response.json();
}

export async function getEmployeeDetails(employeeId: number): Promise<EmployeeDetails> {
  const response = await fetch(`${API_BASE_URL}/api/v1/watchlist/${employeeId}`);
  if (!response.ok) throw new Error('Failed to fetch employee details');
  return response.json();
}

export async function postWhatIf(request: WhatIfRequest): Promise<WhatIfResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/what-if`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });
  if (!response.ok) throw new Error('Failed to post what-if simulation');
  return response.json();
}

export async function getExpectedLoss(): Promise<ExpectedLossResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/expected-loss`);
  if (!response.ok) throw new Error('Failed to fetch expected loss');
  return response.json();
}

export async function getFairness(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/fairness`);
  if (!response.ok) throw new Error('Failed to fetch fairness audit');
  return response.json();
}

export async function getHotspots(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/hotspots`);
  if (!response.ok) throw new Error('Failed to fetch hotspots');
  return response.json();
}

export async function getActionDrafts(): Promise<ActionDraft[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/action-drafts`);
  if (!response.ok) throw new Error('Failed to fetch action drafts');
  return response.json();
}

