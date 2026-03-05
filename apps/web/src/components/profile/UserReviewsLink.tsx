'use client'

import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

export interface UserReviewsLinkProps {
  href?: string
  label?: string
  className?: string
}

export function UserReviewsLink({
  href = '/my-reviews',
  label = 'Reseñas escritas por mí',
  className = '',
}: UserReviewsLinkProps) {
  return (
    <Link
      href={href}
      prefetch
      className={`flex items-center gap-2 text-[15px] font-medium text-neutral-900 hover:underline ${className}`}
    >
      <MessageSquare className="w-[18px] h-[18px] flex-shrink-0 text-neutral-700" strokeWidth={1.5} />
      {label}
    </Link>
  )
}
