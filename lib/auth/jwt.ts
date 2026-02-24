import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export type JWTPayload = {
  userId: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
};

export function signJwt(payload: Omit<JWTPayload, "iat" | "exp">, options?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d", ...(options || {}) });
}

export function verifyJwt(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

