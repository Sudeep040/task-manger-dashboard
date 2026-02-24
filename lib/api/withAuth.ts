import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { verifyJwt, JWTPayload } from "../auth/jwt";
import { ApiError } from "./ApiError";

// Wrapper for Next.js API routes (pages/api)
export function withApiAuth(handler: NextApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
      if (!token) throw new ApiError("Unauthorized", 401);
      const payload = verifyJwt(token) as JWTPayload;
      // attach user to request
      (req as any).user = payload;
      return await handler(req, res);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      if (err instanceof ApiError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}

// Helper for App Router route handlers (Request)
export async function getUserFromRequest(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  if (!token) throw new ApiError("Unauthorized", 401);
  try {
    const payload = verifyJwt(token) as JWTPayload;
    return payload;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") throw new ApiError("Token expired", 401);
    throw new ApiError("Unauthorized", 401);
  }
}

