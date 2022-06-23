/** COMMON ERRORS */

import { HttpBadRequestError } from '../../http-exceptions';

/**
 * This look like a siren but does not respect Luhn formula
 */
export class NotLuhnValidSirenError extends HttpBadRequestError {
  constructor(public message: string) {
    super(`Not a valid siren : ${message}`);
  }
}

/**
 * This does not even look like a siren
 */
export class NotASirenError extends HttpBadRequestError {
  constructor(public message: string) {
    super(`Not a siren : ${message}`);
  }
}

/**
 * This look like a siret but does not respect Luhn formula
 */
export class NotLuhnValidSiretError extends HttpBadRequestError {
  constructor(public message: string) {
    super(`Not a valid siret : ${message}`);
  }
}

/**
 * This does not even look like a siret
 */
export class NotASiretError extends HttpBadRequestError {
  constructor(public message: string) {
    super(`Not a siret : ${message}`);
  }
}
