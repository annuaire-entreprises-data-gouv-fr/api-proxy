import type { IObservation } from "../../../../models/rne";
import { extractFromHtmlBlock } from "./helpers";

const parseObservations = (observationsHtml: NodeListOf<Element>) => {
  const observations = [] as IObservation[];

  for (let i = 0; i < observationsHtml.length; i++) {
    const current = {
      numObservation: "",
      dateAjout: "",
      description: "",
    } as IObservation;

    const fields = observationsHtml[i].querySelectorAll(
      "div.bloc-detail-notice"
    );

    for (let j = 0; j < fields.length; j++) {
      const { label, text } = extractFromHtmlBlock(fields[j]);
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
