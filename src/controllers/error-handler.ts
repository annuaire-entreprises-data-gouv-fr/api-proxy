import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { type HttpError, isHttpError } from "../http-exceptions";

export const errorHandler = (err: Error | HttpError, c: Context) => {
  if (isHttpError(err)) {
    return c.json(
      { message: err.message || "Une erreur est survenue" },
      err.status as ContentfulStatusCode
    );
  }

  return c.json({ message: err.message || "Une erreur est survenue" }, 500);
};
