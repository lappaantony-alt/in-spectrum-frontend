import { apiClient } from './client';
import type { ProgressCreateRequest, ProgressEntryResponse } from './types';

export async function createProgressEntry(
  planItemId: string,
  data: ProgressCreateRequest,
): Promise<ProgressEntryResponse> {
  const response = await apiClient.post<ProgressEntryResponse>(
    `/plan-items/${planItemId}/progress`,
    data,
  );
  return response.data;
}

export async function listProgressEntries(
  planItemId: string,
): Promise<ProgressEntryResponse[]> {
  const response = await apiClient.get<ProgressEntryResponse[]>(
    `/plan-items/${planItemId}/progress`,
  );
  return response.data;
}
