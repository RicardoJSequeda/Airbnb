'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Menu, Search } from "lucide-react";
import Logo from "../shared/logo";
import SearchBar from "./searchBar";
import { useAuthStore } from "@/lib/stores/auth-store";

const Header = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState("Alojamientos");
    const [initialSearchSection, setInitialSearchSection] = useState<'destination' | 'dates' | 'guests' | null>(null);

    const navItems = [
        { videoSrc: "/videos/house.webm", label: "Alojamientos" },
        { videoSrc: "/videos/balloon.webm", label: "Experiencias" },
        { videoSrc: "/videos/consierge.webm", label: "Servicios" },
    ]

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 80;
            setIsScrolled(scrolled);
            if (!scrolled) {
                setIsExpanded(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const showExpanded = !isScrolled || isExpanded;

    const handleBackdropClick = () => {
        setIsExpanded(false);
        setInitialSearchSection(null);
    };

    return (
        <>
            {isScrolled && isExpanded && (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
                    onClick={handleBackdropClick}
                />
            )}
            
            <header className={`fixed top-0 left-0 right-0 z-50 flex justify-center bg-navbar w-full border-b border-border-primary shadow-sm transition-all duration-300 ease-in-out ${
                showExpanded ? 'h-[200px]' : 'h-20'
            }`}>
                <nav className="h-20 flex items-center justify-between w-full max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12">
                    <div className="cursor-pointer transition-transform duration-200 hover:scale-105">
                        <Logo />
                    </div>
                    
                    <div className={`hidden lg:flex items-center gap-6 transition-all duration-300 ${
                        showExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'
                    }`}>
                        {navItems.map((item, index) => (
                            <button 
                                key={index} 
                                onClick={() => setActiveTab(item.label)}
                                className={`flex items-center border-b-2 pr-4 transition-all duration-200 cursor-pointer group ${
                                    activeTab === item.label 
                                        ? 'border-gray-800' 
                                        : 'border-transparent hover:border-gray-400'
                                }`}
                            >
                                <video src={item.videoSrc} autoPlay muted playsInline loop className="w-14 h-14 transition-transform duration-200 group-hover:scale-110" />
                                <span className={`text-sm font-semibold transition-colors duration-200 ${
                                    activeTab === item.label 
                                        ? 'text-gray-800' 
                                        : 'text-gray-600 group-hover:text-gray-800'
                                }`}>
                                    {item.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className={`hidden lg:flex items-center gap-4 flex-1 max-w-[478px] h-12 transition-all duration-300 ${
                        !showExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'
                    }`}>
                        <div className="flex items-center justify-center bg-white border border-gray-300 rounded-full hover:shadow-lg transition-all duration-200 w-full h-full">
                            <video src="/videos/house.webm" autoPlay muted playsInline loop className="w-7 h-7 ml-4" />
                            <button 
                                onClick={() => {
                                    setInitialSearchSection('destination');
                                    setIsExpanded(true);
                                }}
                                className="flex-1 px-3 py-2.5 text-sm font-medium hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                            >
                                Cualquier lugar
                            </button>
                            <div className="h-5 w-px bg-gray-300"></div>
                            <button 
                                onClick={() => {
                                    setInitialSearchSection('dates');
                                    setIsExpanded(true);
                                }}
                                className="flex-1 px-3 py-2.5 text-sm font-medium hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                            >
                                Cualquier fecha
                            </button>
                            <div className="h-5 w-px bg-gray-300"></div>
                            <button 
                                onClick={() => {
                                    setInitialSearchSection('guests');
                                    setIsExpanded(true);
                                }}
                                className="flex-1 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                            >
                                Añade viajeros
                            </button>
                            <div className="bg-primary text-white p-2 rounded-full mr-1">
                                <Search className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button className="hidden md:block text-sm font-medium px-4 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                            Hazte anfitrión
                        </button>
                        
                        <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer">
                            <Globe className="w-5 h-5 text-gray-700" />
                        </button>
                        
                        {isAuthenticated ? (
                            <div className="relative">
                                <Link href="/my-bookings" className="hidden md:block text-sm font-medium px-4 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 mr-2">
                                    Mis reservas
                                </Link>
                                <button
                                    onClick={() => setUserMenuOpen((v) => !v)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                    <Menu className="w-4 h-4 text-gray-700" />
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                                    </div>
                                </button>
                                {userMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden />
                                        <div className="absolute right-0 top-full mt-1 py-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[160px]">
                                            <Link href="/my-bookings" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mis reservas</Link>
                                            <button type="button" onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
                                                Cerrar sesión
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium px-4 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200">
                                    Iniciar sesión
                                </Link>
                                <Link href="/register" className="text-sm font-medium px-4 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-200">
                                    Regístrate
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
                
                <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
                    showExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                    <SearchBar key={initialSearchSection} initialSection={initialSearchSection} />
                </div>
            </header>
        </>
    );
}

export default Header;