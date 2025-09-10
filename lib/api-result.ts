export type ApiResult<T> =
  | {
      data: T
      success: true
    }
  | {
      error: string
      details?: unknown
      success: false
    }

export function createSuccess<T>(data: T): ApiResult<T> {
  return {
    data,
    success: true,
  }
}

export function createError<T = never>(
  error: string,
  details?: unknown
): ApiResult<T> {
  return {
    error,
    details,
    success: false,
  }
}

export function isSuccess<T>(
  result: ApiResult<T>
): result is { data: T; success: true } {
  return result.success === true
}

export function isError<T>(
  result: ApiResult<T>
): result is { error: string; details?: unknown; success: false } {
  return result.success === false
}
