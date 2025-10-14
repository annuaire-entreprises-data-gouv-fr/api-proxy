import type { IObservation } from "../../../../models/rne";
import { extractFromHtmlBlock } from "./helpers";

const parseObservations = (observationsHtml: NodeListOf<Element>) => {
  const observations = [] as IObservation[];

  for (const observationHtml of observationsHtml) {
    const current = {
      numObservation: "",
      dateAjout: "",
      description: "",
    } as IObservation;

    const fields = observationHtml.querySelectorAll("div.bloc-detail-notice");

    for (const field of fields) {
      const { label, text } = extractFromHtmlBlock(field);
      if (label.indexOf("Numéro") > -1) {
        current.numObservation = text;
      } else if (label.indexOf("Date") > -1) {
        current.dateAjout = text;
      } else if (label.indexOf("Description") > -1) {
        current.description = text;
      }
    }

    observations.push(current);
  }

  return observations;
};

export default parseObservations;
