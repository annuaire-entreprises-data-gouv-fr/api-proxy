import { Siret } from '../../models/siren-and-siret';
import httpClient from '../../utils/network';
import routes from '../urls';

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

/**
 * Call EORI SOAP API to validate EORI number
 * @param siret
 */
const clientEORI = async (siret: Siret): Promise<IEORIValidation | null> => {
  const response = await httpClient({
    url: routes.eori,
    method: 'POST',
    data: createSOAPRequest('FR' + siret),
    headers: {
      'Content-Type': 'text/xml;charset=UTF-8',
      SOAPAction: '',
    },
  });
  const result = response.data.match(/<result>[\s\S]*?<\/result>/)?.[0];

  if (!result || !result.includes('<status>')) {
    return null;
  }

  const isValid = result.includes('<status>0</status>');
  return {
    eori: siret,
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
