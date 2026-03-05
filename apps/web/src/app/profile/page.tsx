import { redirect } from 'next/navigation'

/** Redirección para compatibilidad: /profile → /users/profile/about */
export default function ProfileLegacyPage() {
  redirect('/users/profile/about')
}
