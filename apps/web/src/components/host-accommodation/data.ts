import {
  Building2,
  Castle,
  DoorOpen,
  House,
  HousePlus,
  Hotel,
  Landmark,
  Sailboat,
  Store,
  Tent,
  Tractor,
  UserRound,
  Warehouse,
} from 'lucide-react'
import type { GuestAccessOption, PropertyTypeOption } from './types'

export const propertyTypeOptions: PropertyTypeOption[] = [
  { id: 'casa', label: 'Casa', icon: House },
  { id: 'apartamento', label: 'Apartamento', icon: Building2 },
  { id: 'granero', label: 'Granero', icon: Warehouse },
  { id: 'bed-breakfast', label: 'Bed & breakfast', icon: Hotel },
  { id: 'barco', label: 'Barco', icon: Sailboat },
  { id: 'cabanas', label: 'Cabañas', icon: Tent },
  { id: 'casa-rodante', label: 'Casa rodante', icon: Tractor },
  { id: 'casa-particular', label: 'Casa particular', icon: HousePlus },
  { id: 'castillo', label: 'Castillo', icon: Castle },
  { id: 'casa-campo', label: 'Casa de campo', icon: Landmark },
  { id: 'loft', label: 'Loft', icon: Store },
  { id: 'estudio', label: 'Estudio', icon: Building2 },
]

export const guestAccessOptions: GuestAccessOption[] = [
  {
    id: 'entero',
    title: 'Un alojamiento entero',
    description: 'Los huéspedes disponen del alojamiento entero para ellos.',
    icon: House,
  },
  {
    id: 'habitacion',
    title: 'Una habitación',
    description:
      'Los huéspedes tienen su propia habitación en un alojamiento, más acceso a espacios compartidos.',
    icon: DoorOpen,
  },
  {
    id: 'habitacion-compartida',
    title: 'Una habitación compartida en un hostal',
    description:
      'Los huéspedes duermen en una habitación compartida en un hostal administrado por profesionales y con personal disponible 24/7.',
    icon: UserRound,
  },
]
