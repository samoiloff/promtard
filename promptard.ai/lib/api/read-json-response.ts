export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    if (!response.ok) {
      throw new ApiError(`Ошибка запроса (${response.status})`, response.status);
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      response.ok
        ? "Некорректный ответ сервера"
        : `Ошибка запроса (${response.status})`,
      response.status,
    );
  }
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ response: Response; data: T }> {
  const response = await fetch(input, init);
  const data = await readJsonResponse<T>(response);
  return { response, data };
}
