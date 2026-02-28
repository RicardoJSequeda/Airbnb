import type {
  SearchFormState,
  AccommodationState,
  ExperienceState,
  ServicesState,
  ValidationResult,
} from './search.types'

function validateAccommodation(state: AccommodationState): ValidationResult {
  const errors: Record<string, string> = {}
  if (!state.destination?.city && !state.destination?.isNearby) {
    errors.destination = 'Elige un destino'
  }
  return { valid: Object.keys(errors).length === 0, errors: Object.keys(errors).length ? errors : undefined }
}

function validateExperience(state: ExperienceState): ValidationResult {
  const errors: Record<string, string> = {}
  if (!state.destination?.city) {
    errors.destination = 'Elige una ciudad o interés'
  }
  return { valid: Object.keys(errors).length === 0, errors: Object.keys(errors).length ? errors : undefined }
}

function validateServices(state: ServicesState): ValidationResult {
  const errors: Record<string, string> = {}
  if (!state.destination?.city) {
    errors.destination = 'Indica qué servicio buscas'
  }
  return { valid: Object.keys(errors).length === 0, errors: Object.keys(errors).length ? errors : undefined }
}

export function validateSearchState(state: SearchFormState): ValidationResult {
  switch (state.variant) {
    case 'accommodation':
      return validateAccommodation(state)
    case 'experience':
      return validateExperience(state)
    case 'services':
      return validateServices(state)
  }
}
