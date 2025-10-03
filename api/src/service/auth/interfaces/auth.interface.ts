export interface JwtValidatedUser {
  userId: string | undefined;
  email: string;
  role: string;
}

export interface JwtPayload {
  email: string;
  sub: string;
  role: string;
}


export interface LocalPayload {
  _id: string;
  email: string;
  role: string;
}
export interface validateToken {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  position?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role?: string;
}

export interface Tokens{
  access_token: string;
  refreshToken: string;
}