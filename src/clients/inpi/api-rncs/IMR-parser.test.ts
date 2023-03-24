import { readFileSync } from 'fs';
import { verifySiren } from '../../../models/siren-and-siret';
import { extractIMRFromXml } from './IMR-parser';

const dummySiren = verifySiren('880878145');

describe('IMR XML parser', () => {
  it('parses the XML for company with single leader', () => {
    const okXML = readFileSync(
      __dirname + '/__tests__/xml_ok_simple_company.txt',
      'utf-8'
    );

    const result = extractIMRFromXml(okXML, dummySiren);
    expect(result).toEqual({
      identite: {
        capital: '1 000 EUR (fixe)',
        dateCessationActivite: '',
        dateClotureExercice: '31 décembre',
        dateDebutActiv: '2020-01-23',
        dateImmatriculation: '2020-01-23',
        libelleNatureJuridique: 'Société par actions simplifiée',
        isPersonneMorale: true,
        dateRadiation: '',
        denomination: 'Ganymède',
        dureePersonneMorale: '99 ans',
        natureEntreprise: '',
      },
      beneficiaires: [],
      dirigeants: [
        {
          prenom: 'Bilbon',
          nom: 'Sacquet',
          role: 'Président',
          dateNaissancePartial: '2000-01',
          dateNaissanceFull: '2000-01-01',
        },
      ],
    });
  });

  it('parses the XML for company with several leaders including a company', () => {
    const okXML = readFileSync(
      __dirname + '/__tests__/xml_ok_complex_company.txt',
      'utf-8'
    );

    const result = extractIMRFromXml(okXML, dummySiren);

    expect(result).toEqual({
      identite: {
        capital: '1 000 EUR (fixe)',
        dateCessationActivite: '',
        dateClotureExercice: '31 décembre',
        dateDebutActiv: '2020-01-23',
        dateImmatriculation: '2020-01-23',
        libelleNatureJuridique: 'Société par actions simplifiée',
        isPersonneMorale: true,
        dateRadiation: '',
        denomination: 'Ganymède',
        dureePersonneMorale: '99 ans',
        natureEntreprise: '',
      },
      beneficiaires: [],
      dirigeants: [
        {
          prenom: 'Bilbon',
          nom: 'Sacquet',
          role: 'Président',
          dateNaissancePartial: '2000-01',
          dateNaissanceFull: '2000-01-01',
        },
        {
          denomination: 'Nazgul SAS',
          natureJuridique: 'SAS',
          siren: '356000000',
          role: 'Président',
        },
      ],
    });
  });

  it('returns domain error when xml is invalid', () => {
    expect(() => extractIMRFromXml('yolo<', dummySiren)).toThrowError(Error);
  });
});

export {};
