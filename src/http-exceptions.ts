export const isHttpError = (
  toBeDetermined: Error | HttpError
): toBeDetermined is HttpError => {
  if (
    (toBeDetermined as HttpError).status &&
    (toBeDetermined as HttpError).message
  ) {
    return true;
  }
  return false;
};

export class HttpError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

export class HttpNotFound extends HttpError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class HttpConnectionReset extends HttpError {
  constructor(message: string) {
    super(message, 500);
  }
}

export class HttpServerError extends HttpError {
  constructor(message: string) {
    super(message, 500);
  }
}
export class HttpTimeoutError extends HttpError {
  constructor(message: string) {
    super(message, 408);
  }
}

export class HttpTooManyRequests extends HttpError {
  constructor(message: string) {
    super(message, 429);
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class HttpForbiddenError extends HttpError {
  constructor(message: string) {
    super(message, 403);
  }
}
export class HttpBadRequestError extends HttpError {
  constructor(message: string) {
    super(message, 400);
  }
}
