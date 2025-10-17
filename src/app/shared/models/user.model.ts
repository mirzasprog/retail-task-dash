export enum UserRole {
  Admin = 'Admin',
  Headquarters = 'Headquarters',
  RegionalDirector = 'RegionalDirector',
  AreaManager = 'AreaManager',
  StoreManager = 'StoreManager'
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  regionId?: string | null;
  storeId?: string | null;
  stores: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  regionId?: string | null;
  storeId?: string | null;
  storeAssignments: string[];
}
