import constants from "../../constants";
import type { Siren, Siret } from "../../models/siren-and-siret";
import httpClient from "../../utils/network";
import routes from "../urls";

function createSOAPRequest(eoriNumber: string) {
  return `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> 
  <soap:Body> 
    <ev:validateEORI xmlns:ev="http://eori.ws.eos.dds.s/"> 
      <ev:eori>${eoriNumber}</ev:eori> 
    </ev:validateEORI> 
  </soap:Body> 
</soap:Envelope>
`;
}

export type IEORIValidation = {
  eori: string;
  isValid: boolean;
};

const resultRegex = /<result>[\s\S]*?<\/result>/;
const eoriRegex = /<eori>(.*?)<\/eori>/;

/**
 * Call EORI SOAP API to validate EORI number
 * @param siret
 */
const clientEORI = async (
  siretOrSiren: Siret | Siren,
  signal?: AbortSignal
): Promise<IEORIValidation | null> => {
  const eoriConstructed = `FR${siretOrSiren}`;

  const response = await httpClient<string>({
    url: routes.eori,
    method: "POST",
    data: createSOAPRequest(eoriConstructed),
    headers: {
      "Content-Type": "text/xml;charset=UTF-8",
      SOAPAction: "",
    },
    timeout: constants.timeout.XXL,
    useCache: true,
    signal,
  });
  const result = response.match(resultRegex)?.[0];

  if (!result?.includes("<status>")) {
    return null;
  }

  const eori = result.match(eoriRegex)?.[1] ?? eoriConstructed;
  const isValid = result.includes("<status>0</status>");
  return {
    eori,
    isValid,
  };
};

export default clientEORI;

/* SOAP Response type
<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">
   <S:Body>
      <ns0:validateEORIResponse xmlns:ns0="http://eori.ws.eos.dds.s/">
         <return>
            <requestDate>25/06/2024</requestDate>
            <result>
               <eori>DE123456</eori>
               <status>1</status>
               <statusDescr>Not valid</statusDescr>
            </result>
            <result>
               <eori>IT123456789</eori>
               <status>1</status>
               <statusDescr>Not valid</statusDescr>
            </result>
         </return>
      </ns0:validateEORIResponse>
   </S:Body>
</S:Envelope>

*/
