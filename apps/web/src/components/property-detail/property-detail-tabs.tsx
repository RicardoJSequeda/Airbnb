'use client'

import { useState } from 'react'

export type PropertyTabId = 'overview' | 'amenities' | 'reviews' | 'location'

interface Tab {
  id: PropertyTabId
  label: string
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Fotos' },
  { id: 'amenities', label: 'Servicios' },
  { id: 'reviews', label: 'Reseñas' },
  { id: 'location', label: 'Ubicación' },
]

interface PropertyDetailTabsProps {
  activeTab: PropertyTabId
  onTabChange: (tab: PropertyTabId) => void
}

export default function PropertyDetailTabs({
  activeTab,
  onTabChange,
}: PropertyDetailTabsProps) {
  return (
    <nav className="sticky top-20 z-30 bg-white border-b border-gray-200 -mx-6 px-6">
      <div className="flex gap-8">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export { TABS, type PropertyTabId }
