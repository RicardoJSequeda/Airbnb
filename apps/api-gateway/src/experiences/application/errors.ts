/**
 * Errores de aplicación para el módulo de experiencias.
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
