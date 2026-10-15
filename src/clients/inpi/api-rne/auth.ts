import dotenv from "dotenv";
import constants from "../../../constants";
import {
  HttpTooManyRequests,
  HttpUnauthorizedError,
} from "../../../http-exceptions";
import httpClient, {
  httpGet,
  type IDefaultRequestConfig,
} from "../../../utils/network";
import routes from "../../urls";

dotenv.config();

type RNEAccount = "main" | "fallback";

interface IRNEAccountState {
  refreshTokenPromise: Promise<string> | null;
  token: string;
}

class RNEAccountUnavailableError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super("RNE account token refresh failed");
    this.cause = cause;
  }
}

const parisDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
});

const parisDateParts = (date: Date) =>
  Object.fromEntries(
    parisDateFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  );

const nextDayAtFivePastMidnight = () => {
  const { year, month, day } = parisDateParts(new Date());
  const resetTime = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day) + 1,
    0,
    5
  );
  const resetParts = parisDateParts(new Date(resetTime));
  // Convert the Paris calendar time to UTC using the offset on the reset day.
  const offset =
    Date.UTC(
      Number(resetParts.year),
      Number(resetParts.month) - 1,
      Number(resetParts.day),
      Number(resetParts.hour),
      Number(resetParts.minute)
    ) - resetTime;

  return new Date(resetTime - offset);
};

const isAccountUnavailable = (error: unknown) =>
  error instanceof RNEAccountUnavailableError ||
  error instanceof HttpTooManyRequests;

export class RNEClient {
  private readonly _accounts: Record<RNEAccount, IRNEAccountState> = {
    main: { token: "", refreshTokenPromise: null },
    fallback: { token: "", refreshTokenPromise: null },
  };
  private _forceFallbackUntil: Date | null = null;

  private readonly getActiveAccount = (): RNEAccount => {
    if (
      this._forceFallbackUntil &&
      this._forceFallbackUntil.getTime() > Date.now()
    ) {
      return "fallback";
    }
    this._forceFallbackUntil = null;
    return "main";
  };

  refreshToken = async (account: RNEAccount = this.getActiveAccount()) => {
    const username =
      account === "fallback"
        ? process.env.RNE_GRAND_PUBLIC_FALLBACK_LOGIN
        : process.env.RNE_GRAND_PUBLIC_LOGIN;
    const password =
      account === "fallback"
        ? process.env.RNE_GRAND_PUBLIC_FALLBACK_PASSWORD
        : process.env.RNE_GRAND_PUBLIC_PASSWORD;

    const response = await httpClient<{ token: string }>({
      method: "POST",
      url: routes.inpi.api.rne.login,
      data: {
        username,
        password,
      },
      timeout: constants.timeout.XXL,
      useCache: false,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.token;
  };

  private readonly getToken = async (
    account: RNEAccount,
    rejectedToken?: string
  ) => {
    const state = this._accounts[account];
    if (state.token && state.token !== rejectedToken) {
      return state.token;
    }

    if (!state.refreshTokenPromise) {
      state.refreshTokenPromise = this.refreshToken(account)
        .then((token) => {
          state.token = token;
          return token;
        })
        .catch((error: unknown) => {
          state.token = "";
          throw new RNEAccountUnavailableError(error);
        })
        .finally(() => {
          state.refreshTokenPromise = null;
        });
    }

    return await state.refreshTokenPromise;
  };

  private readonly getWithAccount = async <T>(
    account: RNEAccount,
    route: string,
    options?: IDefaultRequestConfig,
    signal?: AbortSignal
  ): Promise<T> => {
    const callback = (token: string) =>
      httpGet<T>(route, {
        ...options,
        headers: {
          ...options?.headers,
          Authorization: `Bearer ${token}`,
        },
        useCache: !!options?.useCache,
        signal,
      });

    const token = await this.getToken(account);
    try {
      return await callback(token);
    } catch (error) {
      if (error instanceof HttpUnauthorizedError) {
        return await callback(await this.getToken(account, token));
      }
      throw error;
    }
  };

  get = async <T>(
    route: string,
    options?: IDefaultRequestConfig,
    signal?: AbortSignal
  ): Promise<T> => {
    const account = this.getActiveAccount();
    try {
      return await this.getWithAccount<T>(account, route, options, signal);
    } catch (error) {
      if (!isAccountUnavailable(error)) {
        throw error;
      }
    }

    const otherAccount = account === "main" ? "fallback" : "main";
    if (otherAccount === "fallback") {
      // Concurrent failures must not extend an existing fallback period.
      if (
        !this._forceFallbackUntil ||
        this._forceFallbackUntil.getTime() <= Date.now()
      ) {
        this._forceFallbackUntil = nextDayAtFivePastMidnight();
      }
    } else {
      this._forceFallbackUntil = null;
    }

    console.log(
      `[RNEClient] Account ${account} is unavailable, trying ${otherAccount}`
    );

    // Try each account at most once, even when both accounts are unavailable.
    try {
      return await this.getWithAccount<T>(otherAccount, route, options, signal);
    } catch (error) {
      if (otherAccount === "fallback" && isAccountUnavailable(error)) {
        this._forceFallbackUntil = null;
      }
      throw error instanceof RNEAccountUnavailableError ? error.cause : error;
    }
  };
}

const defaultApiRneClient = new RNEClient();

export { defaultApiRneClient };
