'use client'

import React from 'react'
import { 
  Activity,
  Binoculars,
  BookOpen,
  Briefcase,
  Building,
  Camera,
  Check,
  ChefHat,
  ChevronRight,
  Clock,
  Coffee as CoffeeIcon,
  Footprints,
  Globe,
  GraduationCap,
  Heart,
  Landmark,
  Languages,
  Lightbulb,
  Mountain,
  Music,
  PawPrint,
  ShoppingBag,
  Soup,
  Sparkles,
  Wand2,
  Wine
} from 'lucide-react'
import { ProfileField } from './ProfileField'
import { useRouter, usePathname } from 'next/navigation'
import { userApi } from '@/lib/api/user'
import { toast } from 'sonner'
import { ProfileEditModal } from './ProfileEditModal'
import { InterestsModal } from './InterestsModal'
import { useAuthStore } from '@/lib/stores/auth-store'

interface DetailedProfileViewProps {
  user: any
}

export function DetailedProfileView({ user: initialUser }: DetailedProfileViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [user, setUser] = React.useState(initialUser)
  const setGlobalUser = useAuthStore((s) => s.setUser)
  const [isUploading, setIsUploading] = React.useState(false)
  const [activeField, setActiveField] = React.useState<any>(null)
  const [isInterestsModalOpen, setIsInterestsModalOpen] = React.useState(false)

  const handleEditClick = () => {
    fileInputRef.current?.click()
  }

  const handleFieldClick = (field: any) => {
    setActiveField(field)
  }

  const handleSaveField = async (value: string) => {
    if (!activeField) return
    try {
      let dataToUpdate: any = {}
      if (activeField.key === 'interests') {
        const currentInterests = user.interests || []
        dataToUpdate = { interests: [...currentInterests, value] }
      } else {
        dataToUpdate = { [activeField.key]: value }
      }
      
      const updatedUser = await userApi.updateProfile(dataToUpdate)
      setUser(updatedUser)
      setGlobalUser(updatedUser)
      toast.success('Perfil actualizado')
    } catch (error) {
      toast.error('Error al guardar')
      console.error(error)
    }
  }

  const handleSaveInterests = async (interests: string[]) => {
    try {
      const updatedUser = await userApi.updateProfile({ interests })
      setUser(updatedUser)
      setGlobalUser(updatedUser)
      toast.success('Intereses actualizados')
    } catch (error) {
      toast.error('Error al guardar intereses')
      throw error
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const imageUrl = `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=300&q=80`
      
      const updatedUser = await userApi.updateProfile({ avatar: imageUrl })
      setUser(updatedUser)
      setGlobalUser(updatedUser)
      toast.success('Foto de perfil actualizada')
    } catch (error) {
      toast.error('Error al actualizar la foto')
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const fieldsLeft = [
    { 
      icon: <Briefcase size={22} />, 
      label: 'A qué me dedico', 
      key: 'occupation',
      title: '¿A qué te dedicas?',
      description: 'Cuéntanos cuál es tu profesión. Si no tienes un trabajo tradicional, háblanos acerca de lo que haces en la vida. Ejemplo: enfermera, tengo cuatro hijos o surfista jubilada.',
      labelModal: 'A qué me dedico:',
      limit: 20
    },
    { 
      icon: <Clock size={22} />, 
      label: 'A qué dedico demasiado tiempo', 
      key: 'timeDedication',
      title: '¿A qué dedicas demasiado tiempo?',
      description: 'Comparte una actividad o pasatiempo al que dedicas mucho de tu tiempo libre. Ejemplo: ver videos de gatitos o jugar al ajedrez.',
      labelModal: 'A qué dedico demasiado tiempo:',
      limit: 40
    },
    { 
      icon: <Sparkles size={22} />, 
      label: 'Década en la que nací', 
      key: 'birthDecade',
      title: '¿En qué década naciste?',
      description: 'No te preocupes, no diremos tu edad exacta. Solo queremos que la comunidad sepa un poco más sobre tu experiencia de vida.',
      labelModal: 'Década en la que nací:',
      limit: 20
    },
    { 
      icon: <Music size={22} />, 
      label: 'Mi canción favorita en la secundaria', 
      key: 'favoriteSong',
      title: '¿Cuál era tu canción favorita?',
      description: 'Esa que no dejabas de escuchar en la secundaria y que hoy te trae buenos recuerdos.',
      labelModal: 'Mi canción favorita en la secundaria:',
      limit: 50 
    },
    { 
      icon: <Lightbulb size={22} />, 
      label: 'Dato curioso sobre mí', 
      key: 'curiousFact',
      title: '¿Algún dato curioso?',
      description: 'Cuéntanos algo sorprendente o inesperado sobre ti que pueda ser un buen tema de conversación.',
      labelModal: 'Dato curioso sobre mí:',
      limit: 100
    },
    { 
      icon: <BookOpen size={22} />, 
      label: 'El título de mi biografía sería', 
      key: 'biographyTitle',
      title: '¿Cuál sería el título de tu biografía?',
      description: 'Si alguien escribiera un libro sobre tu vida, ¿cuál sería el título? Ejemplo: Nací para recorrer el mundo o Crónicas de la mamá de un perrito.',
      labelModal: 'El título de mi biografía sería:',
      limit: 40
    },
  ]

  const fieldsRight = [
    { 
      icon: <Globe size={22} />, 
      label: 'A dónde siempre quise ir', 
      key: 'destination',
      title: '¿A dónde siempre has querido ir?',
      description: 'Ese lugar que está en el primer lugar de tu lista de viajes pendientes.',
      labelModal: 'A dónde siempre quise ir:',
      limit: 50
    },
    { 
      icon: <PawPrint size={22} />, 
      label: 'Mascotas', 
      key: 'pets',
      title: '¿Tienes mascotas?',
      description: 'Gatos, perros, iguanas... ¡queremos saber quién es tu compañero de vida!',
      labelModal: 'Mascotas:',
      limit: 50
    },
    { 
      icon: <GraduationCap size={22} />, 
      label: 'Dónde estudié', 
      key: 'whereIStudied',
      title: '¿Dónde estudiaste?',
      description: 'Comparte tu paso por la universidad, escuela o cualquier institución educativa.',
      labelModal: 'Dónde estudié:',
      limit: 100
    },
    { 
      icon: <Wand2 size={22} />, 
      label: 'Mi habilidad menos útil', 
      key: 'uselessSkill',
      title: '¿Cuál es tu habilidad menos útil?',
      description: 'Ese talento oculto que no sirve para mucho pero que siempre saca una sonrisa.',
      labelModal: 'Mi habilidad menos útil:',
      limit: 50
    },
    { 
      icon: <Heart size={22} />, 
      label: 'Amo', 
      key: 'love',
      title: '¿Qué es lo que más amas?',
      description: 'Tu pasión, tu pasatiempo favorito o aquello por lo que te levantas cada mañana.',
      labelModal: 'Amo:',
      limit: 50
    },
    { 
      icon: <Languages size={22} />, 
      label: 'Idiomas que hablo', 
      key: 'languages',
      title: '¿Qué idiomas hablas?',
      description: 'Esto ayuda a que los huéspedes se sientan más cómodos al comunicarse contigo.',
      labelModal: 'Idiomas que hablo:',
      limit: 100
    },
  ]

  return (
    <div className="relative pb-32"> {/* Increased padding for bottom banner */}
      <div className="flex flex-col md:flex-row gap-16 lg:gap-24 items-start">
        {/* Left: Avatar Section - Sticky */}
        <div className="w-full md:w-auto md:sticky md:top-32 flex flex-col items-center">
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            <div className="w-full h-full rounded-full overflow-hidden border border-neutral-200 shadow-sm relative group bg-neutral-100 flex items-center justify-center">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white text-7xl font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Overlay with Year/Motto like in screens - only if no avatar or as semi-transparent overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none">
                {/* Overlay removed as requested */}
              </div>

              {/* Shading overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              
              {isUploading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />

            {/* Edit Button overlay on avatar */}
            <button 
              onClick={handleEditClick}
              disabled={isUploading}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-neutral-300 rounded-full px-5 py-2 flex items-center gap-2 shadow-md hover:shadow-lg hover:bg-neutral-50 transition-all active:scale-95 group z-10"
            >
              <Camera size={16} className="text-neutral-600 group-hover:text-neutral-900" />
              <span className="text-sm font-semibold text-neutral-900">Editar</span>
            </button>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-4xl font-semibold text-neutral-900 mb-4 tracking-tight">
            Mi perfil
          </h1>
          <p className="text-base text-neutral-600 mb-10 max-w-[580px] leading-relaxed">
            Los anfitriones y huéspedes pueden ver tu perfil y es posible que aparezca en Airbnb para ayudarnos a fomentar la confianza en nuestra comunidad. <span className="underline font-medium cursor-pointer text-neutral-900">Más información</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20">
            {/* Left Column Fields */}
            <div className="flex flex-col">
              {fieldsLeft.map((field, idx) => (
                <ProfileField 
                  key={idx}
                  icon={field.icon}
                  label={field.label}
                  value={(user as any)[field.key]}
                  placeholder="Añadir"
                  onClick={() => handleFieldClick(field)}
                />
              ))}
            </div>
            {/* Right Column Fields */}
            <div className="flex flex-col">
              {fieldsRight.map((field, idx) => (
                <ProfileField 
                  key={idx}
                  icon={field.icon}
                  label={field.label}
                  value={(user as any)[field.key]}
                  onClick={() => handleFieldClick(field)}
                />
              ))}
            </div>
          </div>

          <div className="mt-20 space-y-16">
            {/* Información sobre mí */}
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-neutral-900">Información sobre mí</h2>
              <div 
                onClick={() => handleFieldClick({
                  key: 'bio',
                  title: 'Información sobre mí',
                  description: 'Cuéntanos un poco sobre ti para que los anfitriones y huéspedes puedan conocerte mejor.',
                  labelModal: 'Bio:',
                  limit: 450
                })}
                className="border-2 border-dashed border-neutral-300 rounded-xl p-8 cursor-pointer hover:border-neutral-400 hover:bg-neutral-50 transition-all group"
              >
                {user.bio ? (
                  <p className="text-neutral-700 leading-relaxed italic">"{user.bio}"</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-neutral-500 font-normal">Escribe algo divertido e ingenioso.</p>
                    <span className="text-neutral-900 font-semibold underline group-hover:text-black">Preséntate</span>
                  </div>
                )}
              </div>
            </section>

            {/* Lugares donde estuve */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-neutral-900">Lugares donde estuve</h2>
                  <p className="text-neutral-500 text-sm mt-1">Elige los sellos que quieres que otras personas vean en tu perfil.</p>
                </div>
                <button 
                  onClick={async () => {
                    const newValue = !user.showTravelStamps;
                    const updated = await userApi.updateProfile({ showTravelStamps: newValue });
                    setUser(updated);
                    setGlobalUser(updated);
                  }}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none ${user.showTravelStamps ? 'bg-neutral-800' : 'bg-neutral-200'}`}
                >
                  <span className={`flex items-center justify-center h-6 w-6 transform rounded-full bg-white transition-all shadow-sm duration-300 ease-in-out ${user.showTravelStamps ? 'translate-x-7' : 'translate-x-1'}`}>
                    {user.showTravelStamps && <Check size={14} className="text-neutral-900" />}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: <Globe size={40} strokeWidth={1} />, label: 'Siguiente destinación', shape: 'rounded-[16px]' },
                  { icon: <Sparkles size={40} strokeWidth={1} />, label: 'Siguiente destinación', shape: 'rounded-full' },
                  { icon: <Briefcase size={40} strokeWidth={1} />, label: 'Siguiente destinación', shape: 'rounded-[12px]' },
                  { icon: <PawPrint size={40} strokeWidth={1} />, label: 'Siguiente destinación', shape: 'polygon' },
                ].map((stamp, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className={`w-full aspect-[4/3] flex items-center justify-center border transition-all duration-500 bg-white ${
                      user.showTravelStamps 
                        ? 'border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'border-neutral-200 text-neutral-300 grayscale opacity-60'
                    } ${
                      stamp.shape === 'polygon' ? 'clip-path-hexagon border-2' : stamp.shape
                    }`}>
                      {stamp.icon}
                    </div>
                    <span className={`text-[12px] font-normal transition-colors duration-500 ${user.showTravelStamps ? 'text-neutral-700' : 'text-neutral-400'}`}>
                      {stamp.label}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                user.showTravelStamps ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-900' : 'bg-neutral-50 text-neutral-300 cursor-not-allowed opacity-50'
              }`}>
                Editar sellos de viaje
              </button>
            </section>

            {/* Mis intereses */}
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">Mis intereses</h2>
                <p className="text-neutral-500 text-sm mt-1">Para encontrar puntos en común con otros huéspedes y anfitriones, agrega intereses a tu perfil.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
                {user.interests && user.interests.length > 0 ? (
                  user.interests.map((interest: string, i: number) => {
                    const iconMap: Record<string, React.ReactNode> = {
                      'la naturaleza': <Mountain size={24} />,
                      'Fotografía': <Camera size={24} />,
                      'Música en vivo': <Music size={24} />,
                      'Café': <CoffeeIcon size={24} />,
                      'Museos': <Landmark size={24} />,
                      'Escenas gastronómicas': <Soup size={24} />,
                      'Historia': <Globe size={24} />,
                      'Lectura': <BookOpen size={24} />,
                      'Animales': <PawPrint size={24} />,
                      'Arquitectura': <Building size={24} />,
                      'Caminata': <Footprints size={24} />,
                      'Cocina': <ChefHat size={24} />,
                      'Vino': <Wine size={24} />,
                      'Compras': <ShoppingBag size={24} />,
                      'Baile': <Activity size={24} />,
                      'Cultura local': <Binoculars size={24} />,
                    }
                    return (
                      <div key={i} className="flex items-center gap-4 text-neutral-900">
                        <div className="text-neutral-800">
                          {iconMap[interest] || <Sparkles size={24} />}
                        </div>
                        <span className="text-lg font-normal">{interest}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="col-span-full">
                    <p className="text-neutral-500 italic">No has seleccionado intereses todavía.</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsInterestsModalOpen(true)}
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 px-6 py-2.5 rounded-lg text-base font-semibold transition-colors active:scale-95"
              >
                Edita tus intereses
              </button>
            </section>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-neutral-200 p-4 z-50 animate-in slide-in-from-bottom duration-500">
        <div className={`mx-auto flex justify-end items-center px-6 md:px-10 lg:px-12 ${pathname === '/users/profile/edit' ? 'max-w-[1030px]' : 'max-w-[1120px]'}`}>
          <button 
            onClick={() => router.push('/users/profile/about')}
            className="bg-neutral-900 hover:bg-black text-white px-8 py-3 rounded-lg font-semibold transition-all active:scale-95 shadow-sm"
          >
            Listo
          </button>
        </div>
      </div>

      {/* Legacy Footer Actions (hidden if banner is visible or used as fallback) */}
      <div className="hidden mt-16 pt-8 border-t border-neutral-200 flex justify-end">
        <button 
          onClick={() => router.push('/users/profile/about')}
          className="bg-neutral-900 hover:bg-black text-white px-8 py-3 rounded-lg font-semibold transition-colors active:scale-95 shadow-sm"
        >
          Listo
        </button>
      </div>

      {/* Profile Edit Modal */}
      {activeField && (
        <ProfileEditModal
          isOpen={!!activeField}
          onClose={() => setActiveField(null)}
          onSave={handleSaveField}
          title={activeField.title}
          description={activeField.description}
          label={activeField.labelModal}
          initialValue={(user as any)[activeField.key] || ''}
          charLimit={activeField.limit}
        />
      )}

      {/* Interests Modal */}
      <InterestsModal
        isOpen={isInterestsModalOpen}
        onClose={() => setIsInterestsModalOpen(false)}
        onSave={handleSaveInterests}
        initialInterests={user.interests || []}
      />
    </div>
  )
}
