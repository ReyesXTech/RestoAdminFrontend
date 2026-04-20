export interface LoginCommand {
  fullName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  fullName: string;
  role: string;
  userId: string;
}
