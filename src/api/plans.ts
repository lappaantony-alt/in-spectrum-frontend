import { apiClient } from './client';
import type {
  PlanResponse,
  PlanGenerateRequest,
  PlanItemResponse,
  PlanItemStatusUpdateRequest,
} from './types';

export async function getCurrentPlan(): Promise<PlanResponse> {
  const response = await apiClient.get<PlanResponse>('/plans/current');
  return response.data;
}

export async function generatePlan(
  data: PlanGenerateRequest,
): Promise<PlanResponse> {
  const response = await apiClient.post<PlanResponse>('/plans/generate', data);
  return response.data;
}

export async function updatePlanItemStatus(
  planItemId: string,
  data: PlanItemStatusUpdateRequest,
): Promise<PlanItemResponse> {
  const response = await apiClient.patch<PlanItemResponse>(
    `/plans/items/${planItemId}/status`,
    data,
  );
  return response.data;
}
