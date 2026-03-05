import Link from 'next/link'

export default function ProfileEditPage() {
  return (
    <div className="space-y-10">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Editar perfil
        </h2>
      </header>
      <p className="text-neutral-600 text-[15px] leading-relaxed mb-4">
        Formulario de edición de perfil (próximamente).
      </p>
      <Link
        href="/users/profile/about"
        className="text-sm font-medium underline text-neutral-900 hover:opacity-70 transition-opacity duration-150"
      >
        Volver al perfil
      </Link>
    </div>
  )
}
