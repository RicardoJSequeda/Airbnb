import {
  Building2,
  Castle,
  Circle,
  DoorOpen,
  House,
  HousePlus,
  Hotel,
  Landmark,
  Leaf,
  Sailboat,
  Store,
  Tent,
  Tractor,
  TreePine,
  UserRound,
  Warehouse,
  Waves,
  Wind,
} from 'lucide-react'
import {
  Bell,
  Car,
  CircleDollarSign,
  ChefHat,
  Cross,
  Droplets,
  Dumbbell,
  Flame,
  LampDesk,
  LayoutGrid,
  Mountain,
  Music,
  Shirt,
  Shield,
  Snowflake,
  Sun,
  Tv,
  Wifi,
} from 'lucide-react'
import type { AmenityOption, GuestAccessOption, PropertyTypeOption } from './types'

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
  // Tipos adicionales
  { id: 'dammuso', label: 'Dammuso', icon: Building2 },
  { id: 'domo', label: 'Domo', icon: Circle },
  { id: 'casa-ecologica', label: 'Casa ecológica', icon: Leaf },
  { id: 'granja', label: 'Granja', icon: Warehouse },
  { id: 'casa-huespedes', label: 'Casa de huéspedes', icon: HousePlus },
  { id: 'hotel', label: 'Hotel', icon: Hotel },
  { id: 'casa-flotante', label: 'Casa flotante', icon: Waves },
  { id: 'minsu', label: 'Minsu', icon: Building2 },
  { id: 'riad', label: 'Riad', icon: Landmark },
  { id: 'ryokan', label: 'Ryokan', icon: Building2 },
  { id: 'casa-pastor', label: 'Casa de pastor', icon: Tent },
  { id: 'tienda-campo', label: 'Tienda de campo', icon: Tent },
  { id: 'minicasa', label: 'Minicasa', icon: House },
  { id: 'torre', label: 'Torre', icon: Castle },
  { id: 'casa-arbol', label: 'Casa del árbol', icon: TreePine },
  { id: 'trullo', label: 'Trullo', icon: Building2 },
  { id: 'molino-viento', label: 'Molino de viento', icon: Wind },
  { id: 'yurta', label: 'Yurta', icon: Circle },
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

export const preferredAmenityOptions: AmenityOption[] = [
  { id: 'wifi', label: 'Wifi', icon: Wifi },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'cocina', label: 'Cocina', icon: ChefHat },
  { id: 'lavadora', label: 'Lavadora', icon: Shirt },
  { id: 'estacionamiento-gratis', label: 'Estacionamiento gratuito en las instalaciones', icon: Car },
  { id: 'estacionamiento-pago', label: 'Estacionamiento de pago en las instalaciones', icon: CircleDollarSign },
  { id: 'aire-acondicionado', label: 'Aire acondicionado', icon: Snowflake },
  { id: 'zona-trabajo', label: 'Zona de trabajo', icon: LampDesk },
]

export const outstandingAmenityOptions: AmenityOption[] = [
  { id: 'piscina', label: 'Piscina', icon: Waves },
  { id: 'jacuzzi', label: 'Jacuzzi', icon: Droplets },
  { id: 'terraza', label: 'Terraza', icon: Sun },
  { id: 'parrilla', label: 'Parrilla', icon: Flame },
  { id: 'zona-comida-aire-libre', label: 'Zona de comida al aire libre', icon: ChefHat },
  { id: 'lugar-fogata', label: 'Lugar para hacer fogata', icon: Flame },
  { id: 'mesa-billar', label: 'Mesa de billar', icon: LayoutGrid },
  { id: 'chimenea-interior', label: 'Chimenea interior', icon: Flame },
  { id: 'piano', label: 'Piano', icon: Music },
  { id: 'equipo-ejercicio', label: 'Equipo para hacer ejercicio', icon: Dumbbell },
  { id: 'acceso-lago', label: 'Acceso al lago', icon: Waves },
  { id: 'acceso-playa', label: 'Acceso a la playa', icon: Waves },
  { id: 'ski-in-ski-out', label: 'Accesos de entrada y salida a pistas de esquí', icon: Mountain },
  { id: 'ducha-exterior', label: 'Ducha exterior', icon: Droplets },
]

export const securityElementOptions: AmenityOption[] = [
  { id: 'detector-humo', label: 'Detector de humo', icon: Bell },
  { id: 'botiquin', label: 'Botiquín de primeros auxilios', icon: Cross },
  { id: 'extintor', label: 'Extintor de incendios', icon: Shield },
  { id: 'detector-co', label: 'Detector de monóxido de carbono', icon: Bell },
]
