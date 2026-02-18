/**
 * Escalar: añade o quita entradas. El tipo LoginModalCountryCode se actualiza solo.
 * Para otro idioma/tenant, inyecta lista por prop en LoginModalPhoneForm (countries).
 */
export const LOGIN_MODAL_COUNTRIES = [
  { value: 'co', label: 'Colombia (+57)' },
  { value: 'es', label: 'España (+34)' },
  { value: 'mx', label: 'México (+52)' },
  { value: 'us', label: 'Estados Unidos (+1)' },
  { value: 'ar', label: 'Argentina (+54)' },
  { value: 'cl', label: 'Chile (+56)' },
  { value: 'pe', label: 'Perú (+51)' },
] as const

export type LoginModalCountryCode = (typeof LOGIN_MODAL_COUNTRIES)[number]['value']

/**
 * Escalar: añade id + label; luego registra el icono en SocialLoginIcons (iconMap).
 * Para mostrar solo algunos: pasa providerIds al LoginModal (ej. ['google', 'apple']).
 */
export const LOGIN_MODAL_SOCIAL_PROVIDERS = [
  { id: 'google', label: 'Continúa con Google', icon: 'google' },
  { id: 'apple', label: 'Continúa con Apple', icon: 'apple' },
  { id: 'email', label: 'Continúa con el correo electrónico', icon: 'email' },
  { id: 'facebook', label: 'Continúa con Facebook', icon: 'facebook' },
] as const

export type LoginModalSocialId = (typeof LOGIN_MODAL_SOCIAL_PROVIDERS)[number]['id']
