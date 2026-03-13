'use client'

import Link from 'next/link'
import {
  UserInfoCard,
  CompleteProfilePrompt,
  UserReviewsLink,
  useProfileUser,
} from '@/components/profile'
import {
  Briefcase,
  Clock,
  Sparkles,
  Globe,
  PawPrint,
  GraduationCap,
  Music,
  Lightbulb,
  BookOpen,
  Languages,
  Mountain,
  Camera,
  Coffee as CoffeeIcon,
  Landmark,
  Soup,
  Building,
  Footprints,
  ChefHat,
  Wine,
  ShoppingBag,
  Activity,
  Binoculars,
} from 'lucide-react'

function hasProfileDetails(user: any) {
  const detailKeys = [
    'occupation',
    'timeDedication',
    'birthDecade',
    'favoriteSong',
    'curiousFact',
    'biographyTitle',
    'destination',
    'pets',
    'whereIStudied',
    'uselessSkill',
    'love',
    'languages',
    'bio',
  ]

  if (detailKeys.some((key) => user?.[key])) return true
  if (Array.isArray(user?.interests) && user.interests.length > 0) return true

  return false
}

const INTEREST_ICON_MAP: Record<string, React.ReactNode> = {
  'la naturaleza': <Mountain size={20} />,
  Fotografía: <Camera size={20} />,
  'Música en vivo': <Music size={20} />,
  Café: <CoffeeIcon size={20} />,
  Museos: <Landmark size={20} />,
  'Escenas gastronómicas': <Soup size={20} />,
  Historia: <Globe size={20} />,
  Lectura: <BookOpen size={20} />,
  Animales: <PawPrint size={20} />,
  Arquitectura: <Building size={20} />,
  Caminata: <Footprints size={20} />,
  Cocina: <ChefHat size={20} />,
  Vino: <Wine size={20} />,
  Compras: <ShoppingBag size={20} />,
  Baile: <Activity size={20} />,
  'Cultura local': <Binoculars size={20} />,
}

export default function ProfileAboutPage() {
  const user = useProfileUser()

  if (!user) return null

  const profileHasDetails = hasProfileDetails(user)

  return (
    <>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
          Información sobre mí
        </h1>
        <Link
          href="/users/profile/edit"
          prefetch
          className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-normal text-neutral-900 hover:bg-neutral-200 transition-colors duration-150"
        >
          Editar
        </Link>
      </div>

      <div className="space-y-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <UserInfoCard
            user={user}
            className="w-full md:w-[320px] flex-shrink-0"
          />

          {profileHasDetails ? (
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col gap-2 text-sm text-neutral-900">
                <ProfileDetailRow
                  icon={<Briefcase size={18} />}
                  label="A qué me dedico"
                  value={user.occupation}
                />
                <ProfileDetailRow
                  icon={<Globe size={18} />}
                  label="A dónde siempre quise ir"
                  value={user.destination}
                />
                <ProfileDetailRow
                  icon={<PawPrint size={18} />}
                  label="Mascotas"
                  value={user.pets}
                />
                <ProfileDetailRow
                  icon={<Music size={18} />}
                  label="Mi canción favorita en la secundaria"
                  value={user.favoriteSong}
                />
                <ProfileDetailRow
                  icon={<Clock size={18} />}
                  label="A qué dedico demasiado tiempo"
                  value={user.timeDedication}
                />
                <ProfileDetailRow
                  icon={<Sparkles size={18} />}
                  label="Década en la que nací"
                  value={user.birthDecade}
                />
                <ProfileDetailRow
                  icon={<Lightbulb size={18} />}
                  label="Dato curioso sobre mí"
                  value={user.curiousFact}
                />
                <ProfileDetailRow
                  icon={<BookOpen size={18} />}
                  label="El título de mi biografía sería"
                  value={user.biographyTitle}
                />
                <ProfileDetailRow
                  icon={<GraduationCap size={18} />}
                  label="Dónde estudié"
                  value={user.whereIStudied}
                />
                <ProfileDetailRow
                  icon={<HeartIcon />}
                  label="Amo"
                  value={user.love}
                />
                <ProfileDetailRow
                  icon={<Languages size={18} />}
                  label="Idiomas que hablo"
                  value={user.languages}
                />
              </div>
            </div>
          ) : (
            <CompleteProfilePrompt className="flex-1 min-w-0 w-full" />
          )}
        </div>

        {profileHasDetails && user.bio && (
          <section className="space-y-3 pt-4 border-t border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">
              Información sobre mí
            </h2>
            <p className="text-sm text-neutral-800 leading-relaxed">
              {user.bio}
            </p>
          </section>
        )}

        {profileHasDetails && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Mis intereses
            </h2>
            {user.interests && user.interests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                {user.interests.map((interest: string, index: number) => (
                  <div
                    key={`${interest}-${index}`}
                    className="flex items-center gap-3 text-neutral-900"
                  >
                    <span className="text-neutral-800">
                      {INTEREST_ICON_MAP[interest] ?? <Sparkles size={20} />}
                    </span>
                    <span className="text-sm font-normal">{interest}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 italic">
                No has seleccionado intereses todavía.
              </p>
            )}
          </section>
        )}

        <UserReviewsLink href="/my-reviews" />
      </div>
    </>
  )
}

function ProfileDetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
}) {
  if (!value) return null

  return (
    <div className="flex items-center gap-3">
      <span className="text-neutral-700">{icon}</span>
      <p className="text-sm text-neutral-900">
        <span className="text-xs font-medium text-neutral-500 mr-1 whitespace-nowrap">
          {label}:
        </span>
        {value}
      </p>
    </div>
  )
}

function HeartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-[18px] h-[18px] text-neutral-700"
      aria-hidden="true"
    >
      <path
        d="M12 21s-5.052-3.026-8.04-6.014C1.86 12.886 1 11.552 1 9.913 1 7.374 3.03 5.5 5.5 5.5c1.54 0 2.878.813 3.7 2.044C9.622 6.313 10.96 5.5 12.5 5.5 14.97 5.5 17 7.374 17 9.913c0 1.639-.86 2.973-2.96 5.073C17.052 17.974 12 21 12 21z"
        fill="currentColor"
      />
    </svg>
  )
}
