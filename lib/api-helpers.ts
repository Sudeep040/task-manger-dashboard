export function jsonResponse(data: unknown, status = 200) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}
