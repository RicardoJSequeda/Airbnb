'use client'

import { useState, useEffect } from "react";
import { Search, Plus, Minus } from "lucide-react";

type ActiveSection = 'destination' | 'dates' | 'guests' | null;

interface SearchBarProps {
    initialSection?: ActiveSection;
}

const SearchBar = ({ initialSection }: SearchBarProps) => {
    const [activeSection, setActiveSection] = useState<ActiveSection>(initialSection || null);
    const [dateTab, setDateTab] = useState<'dates' | 'months' | 'flexible'>('dates');
    const [flexibility, setFlexibility] = useState<string>('exact');
    const [guests, setGuests] = useState({
        adults: 0,
        children: 0,
        babies: 0,
        pets: 0,
    });

    const suggestedDestinations = [
        {
            name: "Madrid, Madrid",
            description: "Por lugares de interés como este: Parque de El Retiro",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/e9efb4fc-a002-40cf-8811-42ef5ce74518.png"
        },
        {
            name: "Valencia, Comunidad Valenciana",
            description: "Por su impresionante arquitectura",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/7c3c8e23-e8c3-4962-9df2-ed59826b073c.png"
        },
        {
            name: "Barcelona, Cataluña",
            description: "Un destino de playa popular",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/aeba68c0-44ba-4ee6-9835-da23d7fb0a65.png"
        },
        {
            name: "Paris, Francia",
            description: "Por su animada vida nocturna",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/eb63c43e-fd0e-48f2-8cab-ef156da3bc0c.png"
        },
        {
            name: "Sevilla, Andalucía",
            description: "Por lugares de interés como este: Metropol Parasol",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/bac337c4-8528-4941-bca0-0ecfd95f5d82.png"
        },
        {
            name: "Lisboa, Portugal",
            description: "Por su exquisita gastronomía",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/d2d9f652-03f0-4c23-9246-f825ffd1f0d4.png"
        },
        {
            name: "Oporto, Portugal",
            description: "Por su impresionante arquitectura",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/13943162-b620-4595-89af-74f3d557f6ea.png"
        },
        {
            name: "Roma, Italia",
            description: "Por lugares de interés como este: Fontana di Trevi",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/bac96687-79f5-4056-9f47-c10f2e3f1ffc.png"
        },
        {
            name: "Bilbao, País Vasco",
            description: "Por su exquisita gastronomía",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-1/original/b5648dad-1d76-43e4-9bbd-18ebce84ab7f.png"
        },
        {
            name: "San Sebastián, País Vasco",
            description: "Un destino de playa popular",
            image: "https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-1/original/6d1d155d-c7db-49d7-87b2-3864332d1487.png"
        }
    ];

    const updateGuests = (type: keyof typeof guests, increment: boolean) => {
        setGuests(prev => ({
            ...prev,
            [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - 1)
        }));
    };

    return (
        <div className="relative flex items-center justify-center h-16 w-full pb-15 max-w-[850px] mx-auto">
            <div className={`flex items-center w-full border border-gray-300 rounded-full shadow-lg transition-colors ${
                activeSection ? 'bg-[#EBEBEB]' : 'bg-white'
            }`}>
                <button
                    onClick={() => setActiveSection(activeSection === 'destination' ? null : 'destination')}
                    className={`flex-1 py-3 px-8 text-left rounded-full transition-colors ${
                        activeSection === 'destination' 
                            ? 'bg-white shadow-xl' 
                            : activeSection 
                                ? 'hover:bg-[#DDDDDD]' 
                                : 'hover:bg-gray-100'
                    }`}
                >
                    <div className="text-xs font-semibold">Destino</div>
                    <div className="text-sm text-gray-500">Buscar destinos</div>
                </button>

                <div className={`h-8 w-px ${activeSection ? 'bg-transparent' : 'bg-gray-300'}`}></div>

                <button
                    onClick={() => setActiveSection(activeSection === 'dates' ? null : 'dates')}
                    className={`flex-1 py-3 px-8 text-left rounded-full transition-colors ${
                        activeSection === 'dates' 
                            ? 'bg-white shadow-xl' 
                            : activeSection 
                                ? 'hover:bg-[#DDDDDD]' 
                                : 'hover:bg-gray-100'
                    }`}
                >
                    <div className="text-xs font-semibold">Fechas</div>
                    <div className="text-sm text-gray-500">Introduce las fechas</div>
                </button>

                <div className={`h-8 w-px ${activeSection ? 'bg-transparent' : 'bg-gray-300'}`}></div>

                <button
                    onClick={() => setActiveSection(activeSection === 'guests' ? null : 'guests')}
                    className={`flex-1 py-3 px-6 text-left rounded-full transition-colors ${
                        activeSection === 'guests' 
                            ? 'bg-white shadow-xl' 
                            : activeSection 
                                ? 'hover:bg-[#DDDDDD]' 
                                : 'hover:bg-gray-100'
                    }`}
                >
                    <div className="text-xs font-semibold">Viajeros</div>
                    <div className="text-sm text-gray-500">Añade viajeros</div>
                </button>

                <button className="mr-2 p-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full cursor-pointer transition-colors">
                    <Search className="w-4 h-4" />
                </button>
            </div>

            {/* Dropdown Panels - Desktop */}
            {activeSection && (
                <>
                    {activeSection === 'destination' && (
                        <div 
                            className="hidden md:flex md:flex-col absolute top-10 left-0 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50"
                            style={{ width: '425px', maxHeight: '548px', padding: '24px 8px' }}
                        >
                            <h3 className="text-xs font-semibold mb-3 px-6" style={{ color: '#222222' }}>Sugerencias de destinos</h3>
                            <div className="flex flex-col overflow-y-auto flex-1">
                                <button className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100 transition-colors text-left">
                                    <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                                        <img 
                                            src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/ea5e5ee3-e9d8-48a1-b7e9-1003bf6fe850.png" 
                                            alt="Por la zona" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium" style={{ color: '#222222' }}>Por la zona</div>
                                        <div className="text-sm" style={{ color: '#6A6A6A' }}>Descubre qué hay cerca de ti</div>
                                    </div>
                                </button>

                                {suggestedDestinations.map((destination) => (
                                    <button
                                        key={destination.name}
                                        className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100 transition-colors text-left"
                                    >
                                        <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                                            <img 
                                                src={destination.image} 
                                                alt={destination.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium" style={{ color: '#222222' }}>{destination.name}</div>
                                            <div className="text-sm" style={{ color: '#6A6A6A' }}>{destination.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'dates' && (
                        <div 
                            className="hidden md:block absolute top-10 left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-50"
                            style={{ width: '850px', minHeight: '543.67px' }}
                        >
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex items-center bg-[#EBEBEB] rounded-full p-1 relative">
                                    <button 
                                        onClick={() => setDateTab('dates')}
                                        className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ease-in-out relative z-10 ${
                                            dateTab === 'dates' 
                                                ? 'bg-white font-medium shadow-sm' 
                                                : 'text-gray-600 hover:bg-[#DDDDDD]'
                                        }`}
                                    >
                                        Fechas
                                    </button>
                                    <button 
                                        onClick={() => setDateTab('months')}
                                        className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ease-in-out relative z-10 ${
                                            dateTab === 'months' 
                                                ? 'bg-white font-medium shadow-sm' 
                                                : 'text-gray-600 hover:bg-[#DDDDDD]'
                                        }`}
                                    >
                                        Meses
                                    </button>
                                    <button 
                                        onClick={() => setDateTab('flexible')}
                                        className={`px-6 py-2 rounded-full text-sm transition-all duration-300 ease-in-out relative z-10 ${
                                            dateTab === 'flexible' 
                                                ? 'bg-white font-medium shadow-sm' 
                                                : 'text-gray-600 hover:bg-[#DDDDDD]'
                                        }`}
                                    >
                                        Flexible
                                    </button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <div className="text-center font-semibold mb-4">Enero 2026</div>
                                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                                            <div key={day} className="text-gray-500 font-medium p-2">
                                                {day}
                                            </div>
                                        ))}
                                        {Array.from({ length: 31 }, (_, i) => {
                                            const dayNumber = i + 1;
                                            const today = new Date();
                                            const currentDate = new Date(2026, 0, dayNumber);
                                            const isPast = currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                            
                                            return (
                                                <button
                                                    key={i}
                                                    disabled={isPast}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isPast 
                                                            ? 'text-gray-300 cursor-not-allowed line-through' 
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {dayNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-center font-semibold mb-4">Febrero 2026</div>
                                    <div className="grid grid-cols-7 gap-2 text-center text-sm">
                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                                            <div key={day} className="text-gray-500 font-medium p-2">
                                                {day}
                                            </div>
                                        ))}
                                        {Array.from({ length: 28 }, (_, i) => {
                                            const dayNumber = i + 1;
                                            const today = new Date();
                                            const currentDate = new Date(2026, 1, dayNumber);
                                            const isPast = currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                                            
                                            return (
                                                <button
                                                    key={i}
                                                    disabled={isPast}
                                                    className={`p-2 rounded-full transition-colors ${
                                                        isPast 
                                                            ? 'text-gray-300 cursor-not-allowed line-through' 
                                                            : 'hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {dayNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t">
                                <button 
                                    onClick={() => setFlexibility('exact')}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out ${
                                        flexibility === 'exact' 
                                            ? 'bg-gray-900 text-white font-medium' 
                                            : 'bg-white border border-gray-300 hover:border-gray-900'
                                    }`}
                                >
                                    Fechas exactas
                                </button>
                                <button 
                                    onClick={() => setFlexibility('1')}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out ${
                                        flexibility === '1' 
                                            ? 'bg-gray-900 text-white font-medium' 
                                            : 'bg-white border border-gray-300 hover:border-gray-900'
                                    }`}
                                >
                                    ± 1 día
                                </button>
                                <button 
                                    onClick={() => setFlexibility('2')}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out ${
                                        flexibility === '2' 
                                            ? 'bg-gray-900 text-white font-medium' 
                                            : 'bg-white border border-gray-300 hover:border-gray-900'
                                    }`}
                                >
                                    ± 2 días
                                </button>
                                <button 
                                    onClick={() => setFlexibility('3')}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out ${
                                        flexibility === '3' 
                                            ? 'bg-gray-900 text-white font-medium' 
                                            : 'bg-white border border-gray-300 hover:border-gray-900'
                                    }`}
                                >
                                    ± 3 días
                                </button>
                                <button 
                                    onClick={() => setFlexibility('7')}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out ${
                                        flexibility === '7' 
                                            ? 'bg-gray-900 text-white font-medium' 
                                            : 'bg-white border border-gray-300 hover:border-gray-900'
                                    }`}
                                >
                                    ± 7 días
                                </button>
                                <button 
                                    onClick={() => setFlexibility('14')}
                                    className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ease-in-out ${
                                        flexibility === '14' 
                                            ? 'bg-gray-900 text-white font-medium' 
                                            : 'bg-white border border-gray-300 hover:border-gray-900'
                                    }`}
                                >
                                    ± 14 días
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'guests' && (
                        <div 
                            className="hidden md:block absolute top-10 right-0 bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 z-50"
                            style={{ width: '425px', minHeight: '413px' }}
                        >
                            <div className="flex items-center justify-between py-4 border-b">
                                <div>
                                    <div className="font-semibold">Adultos</div>
                                    <div className="text-sm text-gray-500">A partir de 13 años</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => updateGuests('adults', false)}
                                        disabled={guests.adults === 0}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{guests.adults}</span>
                                    <button
                                        onClick={() => updateGuests('adults', true)}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-b">
                                <div>
                                    <div className="font-semibold">Niños</div>
                                    <div className="text-sm text-gray-500">De 2 a 12 años</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => updateGuests('children', false)}
                                        disabled={guests.children === 0}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{guests.children}</span>
                                    <button
                                        onClick={() => updateGuests('children', true)}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4 border-b">
                                <div>
                                    <div className="font-semibold">Bebés</div>
                                    <div className="text-sm text-gray-500">Menos de 2 años</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => updateGuests('babies', false)}
                                        disabled={guests.babies === 0}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{guests.babies}</span>
                                    <button
                                        onClick={() => updateGuests('babies', true)}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between py-4">
                                <div>
                                    <div className="font-semibold">Mascotas</div>
                                    <div className="text-sm text-gray-500 underline cursor-pointer">
                                        ¿Traes un animal de asistencia?
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => updateGuests('pets', false)}
                                        disabled={guests.pets === 0}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center font-medium">{guests.pets}</span>
                                    <button
                                        onClick={() => updateGuests('pets', true)}
                                        className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mobile Full Screen Modal */}
                    <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <button 
                                    onClick={() => setActiveSection(null)}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                                >
                                    <span className="text-lg">&times;</span>
                                </button>
                                <span className="font-semibold">
                                    {activeSection === 'destination' && 'Destino'}
                                    {activeSection === 'dates' && 'Fechas'}
                                    {activeSection === 'guests' && 'Viajeros'}
                                </span>
                                <div className="w-8"></div>
                            </div>

                            {activeSection === 'destination' && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">¿A dónde quieres ir?</h3>
                                    <input 
                                        type="text" 
                                        placeholder="Buscar destinos"
                                        className="w-full p-4 border border-gray-300 rounded-xl mb-6"
                                    />
                                    <h4 className="text-xs font-semibold mb-3" style={{ color: '#222222' }}>Sugerencias de destinos</h4>
                                    <div className="flex flex-col">
                                        <button className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors text-left rounded-xl">
                                            <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                                                <img 
                                                    src="https://a0.muscache.com/im/pictures/airbnb-platform-assets/AirbnbPlatformAssets-hawaii-autosuggest-destination-icons-2/original/ea5e5ee3-e9d8-48a1-b7e9-1003bf6fe850.png" 
                                                    alt="Por la zona" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium" style={{ color: '#222222' }}>Por la zona</div>
                                                <div className="text-sm" style={{ color: '#6A6A6A' }}>Descubre qué hay cerca de ti</div>
                                            </div>
                                        </button>

                                        {suggestedDestinations.map((destination) => (
                                            <button
                                                key={destination.name}
                                                className="flex items-center gap-4 py-3 hover:bg-gray-50 transition-colors text-left rounded-xl"
                                            >
                                                <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden">
                                                    <img 
                                                        src={destination.image} 
                                                        alt={destination.name} 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium" style={{ color: '#222222' }}>{destination.name}</div>
                                                    <div className="text-sm" style={{ color: '#6A6A6A' }}>{destination.description}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fechas Mobile */}
                            {activeSection === 'dates' && (
                                <div>
                                    <div className="flex gap-2 mb-6 overflow-x-auto">
                                        <button className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm whitespace-nowrap">
                                            Fechas
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-full text-sm whitespace-nowrap">
                                            Meses
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-full text-sm whitespace-nowrap">
                                            Flexible
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <div className="text-center font-semibold mb-4">Enero 2026</div>
                                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                                                    <div key={day} className="text-gray-500 font-medium p-2">
                                                        {day}
                                                    </div>
                                                ))}
                                                {Array.from({ length: 31 }, (_, i) => (
                                                    <button
                                                        key={i}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-center font-semibold mb-4">Febrero 2026</div>
                                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                                                    <div key={day} className="text-gray-500 font-medium p-2">
                                                        {day}
                                                    </div>
                                                ))}
                                                {Array.from({ length: 28 }, (_, i) => (
                                                    <button
                                                        key={i}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSection === 'guests' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-4 border-b">
                                        <div>
                                            <div className="font-semibold">Adultos</div>
                                            <div className="text-sm text-gray-500">A partir de 13 años</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => updateGuests('adults', false)}
                                                disabled={guests.adults === 0}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">{guests.adults}</span>
                                            <button
                                                onClick={() => updateGuests('adults', true)}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-4 border-b">
                                        <div>
                                            <div className="font-semibold">Niños</div>
                                            <div className="text-sm text-gray-500">De 2 a 12 años</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => updateGuests('children', false)}
                                                disabled={guests.children === 0}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">{guests.children}</span>
                                            <button
                                                onClick={() => updateGuests('children', true)}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-4 border-b">
                                        <div>
                                            <div className="font-semibold">Bebés</div>
                                            <div className="text-sm text-gray-500">Menos de 2 años</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => updateGuests('babies', false)}
                                                disabled={guests.babies === 0}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">{guests.babies}</span>
                                            <button
                                                onClick={() => updateGuests('babies', true)}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-4">
                                        <div>
                                            <div className="font-semibold">Mascotas</div>
                                            <div className="text-sm text-gray-500 underline cursor-pointer">
                                                ¿Traes un animal de asistencia?
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => updateGuests('pets', false)}
                                                disabled={guests.pets === 0}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="w-8 text-center font-medium">{guests.pets}</span>
                                            <button
                                                onClick={() => updateGuests('pets', true)}
                                                className="w-8 h-8 rounded-full border border-gray-300 hover:border-gray-900 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                                <button className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2">
                                    <Search className="w-5 h-5" />
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeSection && (
                <div
                    className="hidden md:block fixed inset-0 z-[-1]"
                    onClick={() => setActiveSection(null)}
                ></div>
            )}
        </div>
    );
}

export default SearchBar;