type IExceptionArgument = {
  /** Name of the exception, CamelCase
   *  @example SiretNotFoundError
   *
   *  Should inform about what went wrong from a business point of view
   */
  name: string;
  /** Message of the exception */
  message?: string;

  /** Contextual information about the exception */
  context?: {
    siren?: string;
    idRna?: string | null;
    siret?: string;
    slug?: string;
    details?: string;
    page?: string;
    referrer?: string;
    browser?: string;
    digest?: string;
    domain?: string;
  };
};

export type IExceptionContext = NonNullable<IExceptionArgument["context"]>;

export class Exception extends Error {
  name: string;
  context: IExceptionContext;

  constructor({ name, message, context }: IExceptionArgument) {
    super(message);
    this.name = name;
    this.context = context ?? {};
  }
}

export const Information = Exception;

/**
 * Throw an error when a case is not supposed to happen (ex: a switch case that should never happen)
 *
 * This is a way to make sure that the code is exhaustive, because the typescript compiler will complain otherwise
 *
 * @param value The value that should not be reached
 */
export function throwUnreachableCaseError(value: never): never {
  throw new InternalError({
    message: "Unreachable case",
    context: { details: value },
  });
}

/**
 * Represents an validation error when processing a form submission
 */

export class ValidationError extends Exception {
  constructor(args: {
    message: string;
    cause?: any;
    context?: IExceptionContext;
  }) {
    super({ name: "ValidationError", ...args });
  }
}

/**
 * Represents an internal error.
 * This error should never be thrown.
 * If it is, it means that there is a bug in the code.
 */

export class InternalError extends Exception {
  constructor(args: {
    message: string;
    cause?: any;
    context?: IExceptionContext;
  }) {
    super({ name: "InternalError", ...args });
  }
}
