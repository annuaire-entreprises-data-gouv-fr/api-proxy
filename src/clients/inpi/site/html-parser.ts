import { JSDOM } from "jsdom";
import { HttpServerError } from "../../../http-exceptions";
import type { IObservation } from "../../../models/rne";
import type { Siren } from "../../../models/siren-and-siret";
import parseObservations from "./parsers/observations";

export class InvalidFormatError extends HttpServerError {
  constructor(message: string) {
    super(`Unable to parse HTML :${message}`);
  }
}

export const extractObservationsFromHtml = (
  html: string,
  _siren: Siren
): IObservation[] => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const container = document.querySelector(
    "div#notice-description > div.bloc-without-img"
  );

  if (!container) {
    throw new InvalidFormatError("Cannot find Inpi container");
  }

  const observationsHtml = container.querySelectorAll(
    "#observations + div.row, #observations-other > div.row"
  );

  return parseObservations(observationsHtml);
};
