// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  phoneNumber: string;
  email: string;
  password: string;
  userType: 'PARENT' | 'EDUCATOR';
}

export interface TokenResponse {
  token: string;
}

// User
export interface UserResponse {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  userType: 'PARENT' | 'EDUCATOR';
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface UserUpdateRequest {
  name?: string;
  phoneNumber?: string;
}

// Assessment Template
export interface AnswerScaleOption {
  value: number;
  label: string;
}

export interface AssessmentQuestion {
  id: string;
  category: string;
  text: string;
}

export interface AssessmentTemplate {
  id: string;
  title: string;
  description: string;
  version: number;
  answerScale: AnswerScaleOption[];
  questions: AssessmentQuestion[];
}

// Assessment
export interface AssessmentCreateRequest {
  answers: Record<string, unknown>;
}

export interface AssessmentResponse {
  id: string;
  userId: string;
  submittedAt: string;
  answers?: Record<string, unknown>;
  result?: Record<string, unknown>;
}

// Plan
export interface PlanResponse {
  id: string;
  title: string;
  createdAt: string;
  items: PlanItemResponse[];
}

export interface PlanItemResponse {
  id: string;
  status: 'TODO' | 'DONE' | 'SKIPPED';
  sortOrder: number;
  resource: ResourceShort;
}

export interface ResourceShort {
  id: string;
  title: string;
  type: 'VIDEO' | 'TEXT' | 'IMAGE';
  audience: 'HOME' | 'CLASS' | 'BOTH';
  url: string;
}

export interface PlanGenerateRequest {
  assessmentId: string;
}

export interface PlanItemStatusUpdateRequest {
  status: 'TODO' | 'DONE' | 'SKIPPED';
}

// Resource
export interface ResourceResponse {
  id: string;
  skillId: string;
  title: string;
  description: string;
  type: 'VIDEO' | 'TEXT' | 'IMAGE';
  audience: 'HOME' | 'CLASS' | 'BOTH';
  url: string;
  content?: string | null;
  published: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Progress
export interface ProgressCreateRequest {
  entryDate: string;
  note?: string | null;
}

export interface ProgressEntryResponse {
  id: string;
  planItemId: string;
  entryDate: string;
  note?: string | null;
  createdAt: string;
}

// Error
export interface ApiError {
  message: string;
}
