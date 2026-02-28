/**
 * Errores de aplicación para el módulo de reservas.
 * El adaptador HTTP los mapea a excepciones NestJS.
 */

export class ApplicationNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationNotFoundError';
  }
}

export class ApplicationForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationForbiddenError';
  }
}

export class ApplicationBadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApplicationBadRequestError';
  }
}
