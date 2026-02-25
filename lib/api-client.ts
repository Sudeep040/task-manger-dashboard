// Lightweight client for calling app API endpoints from the client
export type LoginForm = { email: string; password: string };
export type RegisterForm = { name: string; email: string; password: string };

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.error || data.message)) || "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  auth: {
    async login(form: LoginForm) {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      return handleResponse<{ token: string; user: any }>(res);
    },
    async register(form: RegisterForm) {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      return handleResponse<{ token: string; user: any }>(res);
    }
  }
};

