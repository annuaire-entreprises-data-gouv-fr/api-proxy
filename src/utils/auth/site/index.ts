import constants from "../../../constants";
import { Siren } from "../../../models/siren-and-siret";
import routes from "../../../clients/urls";
import { httpGet } from "../../network";
import inpiSiteAuth from "./provider";

const siteClient = async (siren: Siren) => {
  const cookies = await inpiSiteAuth.getCookies();
  const response = await httpGet(
    `${routes.rncs.portail.entreprise}${siren}?format=pdf`,
    {
      headers: {
        Cookie: cookies || "",
      },
      responseType: "arraybuffer",
      timeout: constants.defaultTimeout,
    }
  );
  const { data } = response;
  if (!data) {
    throw new Error("response is empty");
  }
  return data;
};

export default siteClient;
