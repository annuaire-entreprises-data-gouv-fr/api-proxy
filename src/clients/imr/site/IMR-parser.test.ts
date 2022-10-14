import { readFileSync } from 'fs';
import { verifySiren } from '../../../models/siren-and-siret';
import { extractIMRFromHtml } from './IMR-parser';

const dummySiren = verifySiren('880878145');

describe('IMR HTML parser', () => {
  it('Parses individual company', () => {
    const html = readFileSync(
      __dirname + '/__tests__/html_ok_individual_company.txt',
      'utf-8'
    );

    const result = extractIMRFromHtml(html, dummySiren);
    expect(result).toEqual({
      identite: {
        greffe: null,
        codeGreffe: null,
        numeroRCS: null,
        numGestion: '2022A00922',
        dateImmatriculation: '2022-02-14',
        dateDebutActiv: '2022-01-18',
        dateGreffe: null,
        dateRadiation: null,
        dateCessationActivite: null,
        denomination: 'XXX yyy',
        dureePersonneMorale: null,
        dateClotureExercice: null,
        capital: null,
        isPersonneMorale: false,
        libelleNatureJuridique: 'Entreprise individuelle',
      },
      beneficiaires: [],
      dirigeants: [
        {
          dateNaissancePartial: '1991-10',
          dateNaissanceFull: '',
          lieuNaissance: null,
          nom: 'Xxx Yyy',
          prenom: '',
          role: 'Représentant Légal',
          sexe: null,
        },
      ],
    });
  });

  it('Parses a closed, single dirigeant company', () => {
    const html = readFileSync(
      __dirname + '/__tests__/html_ok_closed_simple_company.txt',
      'utf-8'
    );

    const result = extractIMRFromHtml(html, dummySiren);
    expect(result).toEqual({
      identite: {
        greffe: null,
        codeGreffe: null,
        numeroRCS: null,
        numGestion: '2018B04643',
        dateImmatriculation: '2018-05-12',
        dateDebutActiv: '2018-05-06',
        dateGreffe: null,
        dateRadiation: '2021-10-15',
        dateCessationActivite: '2021-06-30',
        denomination: 'RED NEEDLES',
        dureePersonneMorale: '99 ans',
        dateClotureExercice: '30 Juin',
        capital: '1 000.00 €',
        isPersonneMorale: true,
        libelleNatureJuridique: 'Société à responsabilité limitée',
      },
      beneficiaires: [
        {
          dateGreffe: '',
          dateNaissancePartial: '1990-07',
          type: '',
          nom: 'Xxx Yyy',
          prenoms: '',
          nationalite: 'Francaise',
        },
      ],
      dirigeants: [
        {
          dateNaissancePartial: '1990-07',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Xxx Yyy',
          prenom: '',
          role: 'Liquidateur',
          sexe: null,
        },
      ],
    });
  });
  it('Parses single dirigeant company', () => {
    const html = readFileSync(
      __dirname + '/__tests__/html_ok_simple_company.txt',
      'utf-8'
    );

    const result = extractIMRFromHtml(html, dummySiren);
    expect(result).toEqual({
      identite: {
        greffe: null,
        codeGreffe: null,
        numeroRCS: null,
        numGestion: '2020B02214',
        dateImmatriculation: '2020-01-23',
        dateDebutActiv: '2020-01-13',
        dateGreffe: null,
        dateRadiation: null,
        dateCessationActivite: null,
        denomination: 'Ganymède',
        dureePersonneMorale: '99 ans',
        dateClotureExercice: '31 décembre',
        capital: '1 000.00 €',
        isPersonneMorale: true,
        libelleNatureJuridique: 'Société par actions simplifiée',
      },
      beneficiaires: [],
      dirigeants: [
        {
          dateNaissanceFull: '',
          dateNaissancePartial: '1990-02',
          lieuNaissance: '',
          nom: 'Xxx Yyy',
          prenom: '',
          role: 'Président',
          sexe: null,
        },
      ],
    });
  });

  it('Parses multiple dirigeants company', () => {
    const html = readFileSync(
      __dirname + '/__tests__/html_ok_complex_company.txt',
      'utf-8'
    );

    const result = extractIMRFromHtml(html, dummySiren);
    expect(result).toEqual({
      dirigeants: [
        {
          dateNaissancePartial: '1958-10',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Schnepp Gilles',
          prenom: '',
          role: "Président du conseil d'administration",
          sexe: null,
        },
        {
          dateNaissancePartial: '1964-12',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Bernard De Saint Affrique Antoine',
          prenom: '',
          role: 'Directeur général',
          sexe: null,
        },
        {
          dateNaissancePartial: '1969-07',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Timuray Serpil',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1962-07',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Molitor Bettina (Theissig)',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1954-10',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Zinsou-derlin Lionel',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1971-05',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Olivier Gaëlle',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1957-09',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Severino Jean-michel Marie Fernand',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1960-01',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Lejeune Clara (Gaymard)',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissanceFull: '',
          dateNaissancePartial: '1958-07',
          lieuNaissance: '',
          nom: 'Barilla Guido Maria',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1964-01',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Faber Emmanuel',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1958-10',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Schnepp Gilles',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1951-11',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Landel Michel Marie',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1971-12',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Cabanis Cécile Marie',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          dateNaissancePartial: '1967-08',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Boutebba Frédéric',
          prenom: '',
          role: 'Administrateur',
          sexe: null,
        },
        {
          denomination: 'PRICEWATERHOUSECOOPERS AUDIT ',
          natureJuridique: '',
          role: 'SA ',
          siren: '',
        },
        {
          denomination: 'ERNST &amp; YOUNG AUDIT ',
          natureJuridique: '',
          role: 'Commissaire aux comptes titulaire',
          siren: '',
        },
        {
          denomination: 'AUDITEX ',
          natureJuridique: '',
          role: 'Commissaire aux comptes suppléant',
          siren: '',
        },
        {
          dateNaissancePartial: '1965-05',
          dateNaissanceFull: '',
          lieuNaissance: '',
          nom: 'Georghiou Jean-christophe',
          prenom: '',
          role: 'Commissaire aux comptes suppléant',
          sexe: null,
        },
      ],
      identite: {
        capital: '171 920 622.25 €',
        codeGreffe: null,
        dateCessationActivite: null,
        dateClotureExercice: '31 Décembre',
        dateDebutActiv: '1908-01-01',
        dateGreffe: null,
        dateImmatriculation: null,
        dateRadiation: null,
        denomination: 'DANONE',
        dureePersonneMorale: '157 ans',
        greffe: null,
        isPersonneMorale: true,
        libelleNatureJuridique: 'Société anonyme',
        numGestion: '1955B03253',
        numeroRCS: null,
      },
      beneficiaires: [
        {
          dateGreffe: '',
          dateNaissancePartial: '1967-01',
          nationalite: 'Française',
          nom: 'Penchienati Veronique Bianca',
          prenoms: '',
          type: '',
        },
      ],
    });
  });

  it('returns domain error when xml is invalid', () => {
    expect(() => extractIMRFromHtml('yolo<', dummySiren)).toThrowError(Error);
  });
});

export {};
