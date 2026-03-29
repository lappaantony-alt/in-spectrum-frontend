import { apiClient } from './client';
import type {
  AssessmentTemplate,
  AssessmentCreateRequest,
  AssessmentResponse,
} from './types';

export async function getAssessmentTemplate(): Promise<AssessmentTemplate> {
  const response = await apiClient.get<AssessmentTemplate>('/assessments/template');
  return response.data;
}

export async function createAssessment(
  data: AssessmentCreateRequest,
): Promise<AssessmentResponse> {
  const response = await apiClient.post<AssessmentResponse>('/assessments', data);
  return response.data;
}

export async function getLatestAssessment(): Promise<AssessmentResponse> {
  const response = await apiClient.get<AssessmentResponse>('/assessments/latest');
  return response.data;
}
