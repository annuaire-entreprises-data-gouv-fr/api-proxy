import constants from '../../../constants';
import { IDocuments } from '../../../models/rne';
import { Siren } from '../../../models/siren-and-siret';
import { actesApiRneClient } from '../../../utils/auth/api-rne';
import routes from '../../urls';

type IDocumentsRNEResponse = {
  actes: {
    updatedAt: string; //'2023-10-17T22:37:22+02:00',
    id: string; //'63df98a28eded29cb31823ee',
    siren: string; //'535113062',
    denomination: string; //'La Cordée SAS',
    dateDepot: string; //'2018-04-10',
    numChrono: string; //'A2018/009563',
    confidentiality: string; //'Public',
    typeRdd: {
      typeActe: string; //"Copie des statuts";
      decision: string; //" Modification relative aux dirigeants d'une société Modification des statuts"
    }[];
    nomDocument: string; //'0zvyXXhek7Ua_C0022A1001L337316D20180425H041421TPIJTES003PDBOR',
    typeDocument: string;
    libelle: string;
  }[];
  bilans: {
    updatedAt: string; // '2023-03-20T19:19:42+01:00',
    id: string; // '63df98a78eded29cb318240a',
    siren: string; // '535113062',
    denomination: string; // 'La Cordée SAS',
    dateDepot: string; // '2020-11-23',
    numChrono: string; // 'B2020/040841',
    nomDocument: string; // 'CA_535113062_6901_2011B05342_2020_B2020040841',
    confidentiality: string; // 'Public',
    dateCloture: string; // '2020-06-30',
    typeBilan: string; // 'C',
    version: string; // '2.0'
  }[];
  bilansSaisis: {
    updatedAt: string; //'2023-03-20T19:19:42+01:00',
    id: string; //'63df98a88eded29cb3182411',
    siren: string; //'535113062',
    denomination: string; //'La Cordée SAS',
    dateDepot: string; //'2020-11-23',
    numChrono: string; //'B2020/040841',
    confidentiality: string; //'Public',
    bilanSaisi: string; //[Object],
    dateCloture: string; //'2020-06-30',
    typeBilan: string; //'C'
  }[];
};

export const listDocumentsRne = async (siren: Siren) => {
  const response = await actesApiRneClient.get(
    routes.inpi.api.rne.cmc.companies + siren + '/attachments',
    { timeout: constants.timeout.XXXL }
  );

  return mapToDomainObject(response.data as IDocumentsRNEResponse);
};

const mapToDomainObject = (response: IDocumentsRNEResponse): IDocuments => {
  return {
    actes: (response?.actes || []).map((a) => {
      return {
        id: a.id || '',
        dateDepot: a.dateDepot || '',
        actes: (a?.typeRdd || []).map((t) => t.typeActe),
        detailsDocuments:
          a?.typeRdd && a?.typeRdd.length > 0
            ? a?.typeRdd.map((t) => {
                return {
                  nom: t.typeActe,
                  label: t.decision,
                };
              })
            : [{ nom: a?.nomDocument, label: a?.libelle }],
      };
    }),
    bilans: (response?.bilans || []).map((a) => {
      return {
        id: a.id || '',
        dateDepot: a.dateDepot || '',
        dateCloture: a.dateCloture || '',
        typeBilan: a.typeBilan || '',
        confidentiality: a.confidentiality || '',
      };
    }),
  };
};
