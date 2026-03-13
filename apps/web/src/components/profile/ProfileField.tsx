import React from 'react'

interface ProfileFieldProps {
  icon: React.ReactNode
  label: string
  value?: string
  placeholder?: string
  onClick?: () => void
}

export function ProfileField({ icon, label, value, placeholder, onClick }: ProfileFieldProps) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between py-5 border-b border-neutral-200 cursor-pointer group hover:bg-neutral-50 px-4 -mx-4 rounded-xl transition-all duration-200 ease-in-out"
    >
      <div className="flex items-center gap-4">
        <div className="text-neutral-500">
          {icon}
        </div>
        <span className="text-base text-neutral-900 font-normal">
          {value ? `${label}: ${value}` : label}
        </span>
      </div>
    </div>
  )
}
