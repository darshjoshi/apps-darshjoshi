export interface APIResponse<T = any> {
  message: string;
  data: T;
}

export interface ErrorResponse {
  detail: string;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  app: string;
}
