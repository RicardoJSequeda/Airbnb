import type { ServiceCategory, ServiceSectionData } from './types'

export const serviceCategories: ServiceCategory[] = [
  { id: 'fotografia', name: 'Fotografía', availability: '1 disponible', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
  { id: 'chefs', name: 'Chefs', availability: '1 disponible', imageUrl: 'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?auto=format&fit=crop&w=600&q=80' },
  { id: 'masaje', name: 'Masaje', availability: 'Próximamente', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80' },
  { id: 'comidas', name: 'Comidas preparadas', availability: 'Próximamente', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80' },
  { id: 'entrenamiento', name: 'Entrenamiento', availability: 'Próximamente', imageUrl: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=600&q=80' },
  { id: 'maquillaje', name: 'Maquillaje', availability: 'Próximamente', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80' },
  { id: 'cabello', name: 'Cabello', availability: 'Próximamente', imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80' },
]

export const servicesSections: ServiceSectionData[] = [
  {
    id: 'entrenamiento',
    title: 'Entrenamiento',
    offers: [
      { id: 'fit-1', title: 'Yoga y elongación con Julia', city: 'Bogotá, Colombia', price: 'Desde $95,000 COP por participante', minimum: 'Mínimo $750,000 COP para reservar', ratingText: '★ 5,0', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80' },
      { id: 'fit-2', title: 'Barre y bienestar con Kimberly', city: 'Medellín, Colombia', price: 'Desde $188,000 COP por participante', ratingText: '★ 5,0', imageUrl: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?auto=format&fit=crop&w=900&q=80' },
      { id: 'fit-3', title: 'Entrenamientos intensos', city: 'Redondo Beach, Estados Unidos', price: 'Desde $601,000 COP por participante', ratingText: '★ 5,0', imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80' },
      { id: 'fit-4', title: 'Entrenamiento reparador', city: 'Los Ángeles, Estados Unidos', price: 'Desde $256,000 COP por participante', ratingText: '★ 5,0', imageUrl: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    id: 'masaje',
    title: 'Masaje',
    offers: [
      { id: 'spa-1', title: 'Ritual relajante corporal', city: 'Bogotá, Colombia', price: 'Desde $220,000 COP por sesión', badge: 'Popular', ratingText: '★ 4,9', imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=900&q=80' },
      { id: 'spa-2', title: 'Masaje de tejido profundo', city: 'Cali, Colombia', price: 'Desde $185,000 COP por sesión', ratingText: '★ 4,8', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=80' },
      { id: 'spa-3', title: 'Spa con piedras calientes', city: 'Cartagena, Colombia', price: 'Desde $260,000 COP por sesión', badge: 'Popular', ratingText: '★ 5,0', imageUrl: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=900&q=80' },
      { id: 'spa-4', title: 'Sesión antiestrés en pareja', city: 'Medellín, Colombia', price: 'Desde $310,000 COP por sesión', ratingText: '★ 4,9', imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=900&q=80' },
    ],
  },
]
