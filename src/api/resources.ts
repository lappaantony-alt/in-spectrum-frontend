import { apiClient } from './client';
import type { ResourceResponse } from './types';

export async function getResourceById(
  resourceId: string,
): Promise<ResourceResponse> {
  const response = await apiClient.get<ResourceResponse>(
    `/resources/${resourceId}`,
  );
  return response.data;
}
