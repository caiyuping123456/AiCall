export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  name: string;
}

export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}
