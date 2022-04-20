import { HttpForbiddenError } from "../../../htttp-exceptions";
import routes from "../../../clients/urls";
import httpClient from "../../network";

export class APICookie {
  private cookie: null | string = null;

  constructor(private login = "", private password = "") {}

  async authenticateAndGet() {
    try {
      const response = await httpClient({
        url: routes.rncs.api.login,
        method: "POST",
        headers: {
          login: this.login,
          password: this.password,
        },
      });

      const setCookieValue = response.headers["set-cookie"] || [];
      const cookieValue = setCookieValue[0];

      if (!cookieValue || typeof cookieValue !== "string") {
        throw new Error("Authentication failed");
      }
      this.cookie = cookieValue.split(";")[0];
      return this.cookie;
    } catch (e: any) {
      throw new HttpForbiddenError(e);
    }
  }

  async get() {
    if (!this.cookie) {
      return await this.authenticateAndGet();
    }
    return this.cookie;
  }
}
