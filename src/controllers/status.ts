import type { Handler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { fetchRneAPI } from "../models/rne";
import { verifySiren } from "../models/siren-and-siret";

export const apiRneStatusController: Handler<object, "/rne"> = async (c) => {
  try {
    const dummySiren = verifySiren("552032534");

    await fetchRneAPI(dummySiren);
    return c.json({ message: "ok", status: 200 });
  } catch (e: any) {
    const status = e.status || 500;
    return c.json({ message: "ko", status }, status as ContentfulStatusCode);
  }
};
