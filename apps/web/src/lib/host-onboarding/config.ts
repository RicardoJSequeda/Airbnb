import type { ShareHostOption } from '@/components/shared/ShareHostModal'

export interface OnboardingStep {
  number: number
  title: string
  description: string
  /** Ruta a imagen isométrica (ej. en public/images/onboarding/) */
  imageSrc?: string
}

export interface OnboardingContent {
  /** Título principal de la vista (columna izquierda) */
  mainTitle: string
  /** Los 3 pasos (columna derecha) */
  steps: [OnboardingStep, OnboardingStep, OnboardingStep]
}

const ALOJAMIENTO: OnboardingContent = {
  mainTitle: 'Empezar a utilizar Airbnb es muy sencillo',
  steps: [
    {
      number: 1,
      title: 'Describe tu espacio',
      description:
        'Comparte algunos datos básicos, como la ubicación y cuántos huéspedes pueden quedarse en el lugar.',
      imageSrc: '/images/onboarding/step1-alojamiento.png',
    },
    {
      number: 2,
      title: 'Haz que destaque',
      description:
        'Agrega al menos cinco fotos, un título y una descripción. Nosotros te ayudaremos.',
      imageSrc: '/images/onboarding/step2-alojamiento.png',
    },
    {
      number: 3,
      title: 'Terminar y publicar',
      description:
        'Elige un precio inicial, verifica algunos detalles y publica tu anuncio.',
      imageSrc: '/images/onboarding/step3-alojamiento.png',
    },
  ],
}

const EXPERIENCIA: OnboardingContent = {
  mainTitle: 'Compartir una experiencia es muy sencillo',
  steps: [
    {
      number: 1,
      title: 'Describe tu experiencia',
      description:
        'Cuéntanos de qué se trata, dónde será y cuántas personas pueden participar.',
      imageSrc: '/images/onboarding/step1-experiencia.png',
    },
    {
      number: 2,
      title: 'Haz que destaque',
      description:
        'Añade fotos, un título atractivo y los detalles que la hacen única.',
      imageSrc: '/images/onboarding/step2-experiencia.png',
    },
    {
      number: 3,
      title: 'Terminar y publicar',
      description:
        'Define el precio por persona, revisa la información y publica.',
      imageSrc: '/images/onboarding/step3-experiencia.png',
    },
  ],
}

const SERVICIO: OnboardingContent = {
  mainTitle: 'Ofrecer un servicio es muy sencillo',
  steps: [
    {
      number: 1,
      title: 'Describe tu servicio',
      description:
        'Indica qué ofreces, en qué zona y cómo se contrata.',
      imageSrc: '/images/onboarding/step1-servicio.png',
    },
    {
      number: 2,
      title: 'Haz que destaque',
      description:
        'Añade imágenes y una descripción clara para que los usuarios te encuentren.',
      imageSrc: '/images/onboarding/step2-servicio.png',
    },
    {
      number: 3,
      title: 'Terminar y publicar',
      description:
        'Configura precios o disponibilidad y publica tu servicio.',
      imageSrc: '/images/onboarding/step3-servicio.png',
    },
  ],
}

export const HOST_ONBOARDING_CONTENT: Record<ShareHostOption, OnboardingContent> = {
  alojamiento: ALOJAMIENTO,
  experiencia: EXPERIENCIA,
  servicio: SERVICIO,
}

export const DEFAULT_ONBOARDING_TYPE: ShareHostOption = 'alojamiento'
