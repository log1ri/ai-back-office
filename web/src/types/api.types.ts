// Base interfaces following SOLID principles - Interface Segregation Principle
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_records: number;
  current_page: number;
  total_pages: number;
}

// User related interfaces
export interface User extends BaseEntity {
  name: string;
  email: string;
  firstname?: string;
  lastname?: string;
  position?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface CreateUserDto {
  name: string;
  email: string;
  firstname?: string;
  lastname?: string;
  position?: string;
  password?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  position?: string;
}

// OCR Services Log interfaces
export interface OcrServiceLog extends BaseEntity {
  message: {
    subId?: string;
    images?: {
      original?: string;
      processed?: string;
      name?: string;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export interface FilterOcrServicesLogDto {
  subId?: string;
  page?: string;
  limit?: string;
}

// Organization interfaces
export interface Organization extends BaseEntity {
  organization: string;
  profilePic?: string;
}

// Authentication interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}

// RateModel interfaces
export interface RateModelCheckRateSummary {
  matched: number;
  modified: number;
  upserted: number;
}

export interface RateModelCheckRateResponse {
  status: number;
  message: string;
  summary: RateModelCheckRateSummary;
  errors: any[]; 
}

export interface RateModelItem {
  id: string;
  name: string;
  province: string;
  regnum: string;
  status: string;
  subId: string;
}

export interface listRateItem{
  _id: string,
  createAt: string,
  imgName: string,
  logId: string,
  province: string,
  regNum: string,
  status: string,
  subId: string;
  updateAt: string,
  whoIsCreate: string
}

// Error handling
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public response?: any;

  constructor(
    status: number,
    statusText: string,
    message: string,
    response?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}
