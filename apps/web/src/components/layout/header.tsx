'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Menu, Search, ArrowLeft } from "lucide-react";
import Logo from "../shared/logo";
import LoginModal from "../shared/LoginModal";
import { ShareHostModal } from "../shared/ShareHostModal";
import RegisterModal from "../shared/RegisterModal";
import { SearchBar, getVariantFromPathname } from "@/components/search/SearchBar";
import { detectSearchSection } from "@/lib/search/search-config";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useLoginModalStore } from "@/lib/stores/login-modal-store";
import { useRegisterModalStore } from "@/lib/stores/register-modal-store";

/** Header compacto para páginas de listado/detalle (sin nav expandible) */
const isListingPage = (path: string) => 
  path.startsWith('/properties/') || 
  path.startsWith('/search') || 
  path.startsWith('/experiences/') ||
  path.startsWith('/services/');

/** Solo logo, sin menú ni búsqueda (p. ej. Confirma y paga) */
const isLogoOnlyPage = (path: string) => /^\/experiences\/[^/]+\/book\/?$/.test(path ?? '');

const Header = () => {
    const pathname = usePathname();
    const compactMode = isListingPage(pathname ?? '');
    const { isAuthenticated, user, logout } = useAuthStore();
    const [isScrolled, setIsScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { isOpen: loginModalOpen, close: setLoginModalOpen, open: openLoginModal, redirect: loginRedirect } = useLoginModalStore();
    const { isOpen: registerModalOpen, close: setRegisterModalOpen, open: openRegisterModal, redirect: registerRedirect } = useRegisterModalStore();
    const [shareHostModalOpen, setShareHostModalOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [compactSearchOpen, setCompactSearchOpen] = useState(false);
    const [initialSearchSection, setInitialSearchSection] = useState<'destination' | 'dates' | 'guests' | 'participants' | null>(null);

    // Derivar la pestaña activa desde la ruta para que al navegar se refleje
    const activeTab = pathname?.startsWith('/experiences')
        ? 'Experiencias'
        : pathname?.startsWith('/services')
        ? 'Servicios'
        : 'Alojamientos';

    const navItems = [
        { videoSrc: "/videos/house.webm", label: "Alojamientos", href: "/" },
        { videoSrc: "/videos/balloon.webm", label: "Experiencias", href: "/experiences" },
        { videoSrc: "/videos/consierge.webm", label: "Servicios", href: "/services" },
    ]

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 80;
            setIsScrolled(scrolled);
            if (!scrolled) {
                setIsExpanded(false);
                if (compactMode) setCompactSearchOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [compactMode]);

    const showExpanded = compactMode ? compactSearchOpen : (!isScrolled || isExpanded);

    const handleBackdropClick = () => {
        setIsExpanded(false);
        setCompactSearchOpen(false);
        setInitialSearchSection(null);
    };

    const logoOnly = isLogoOnlyPage(pathname ?? '');

    return (
        <>
            {!logoOnly && ((isScrolled && isExpanded) || compactSearchOpen) ? (
                <div 
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
                    onClick={handleBackdropClick}
                />
            ) : null}
            
            <header className={`fixed top-0 left-0 right-0 z-50 flex flex-col bg-white w-full border-b border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
                logoOnly ? 'h-20' : showExpanded ? 'h-[200px]' : 'h-20'
            }`}>
                <nav className="h-20 flex-shrink-0 flex items-center justify-between w-full max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12">
                    <div className="flex items-center gap-4">
                        {!logoOnly && compactMode && (
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors lg:hidden"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                        )}
                        <div className="cursor-pointer transition-transform duration-200 hover:scale-105">
                            <Logo />
                        </div>
                    </div>
                    
                    {!logoOnly && (
                    <>
                    <div className={`hidden lg:flex items-center gap-6 transition-all duration-300 ${
                        !compactMode && showExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'
                    }`}>
                        {navItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href}
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
                            </Link>
                        ))}
                    </div>

                    <div className={`hidden lg:flex items-center gap-4 flex-1 max-w-[478px] mx-4 h-12 transition-all duration-300 ${
                        compactMode || !showExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none absolute'
                    }`}>
                        {compactMode ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setCompactSearchOpen(true);
                                    setInitialSearchSection('destination');
                                }}
                                className="flex items-center justify-center bg-white border border-gray-300 rounded-full hover:shadow-lg transition-all duration-200 w-full h-full text-left"
                            >
                                <span className="flex-1 px-4 py-2.5 text-sm text-gray-500 truncate">
                                    {detectSearchSection(pathname ?? '') === 'experiences' ? 'Dónde' : 'En cualquier lugar del mundo'}
                                </span>
                                <div className="h-5 w-px bg-gray-300" />
                                <span className="flex-1 px-3 py-2.5 text-sm text-gray-500 truncate">
                                    {detectSearchSection(pathname ?? '') === 'experiences' ? 'Fechas' : 'Cualquier semana'}
                                </span>
                                <div className="h-5 w-px bg-gray-300" />
                                <span className="flex-1 px-3 py-2.5 text-sm text-gray-500 truncate">
                                    {detectSearchSection(pathname ?? '') === 'experiences' ? '¿Cuántos?' : '¿Cuántos?'}
                                </span>
                                <div className="bg-primary text-white p-2 rounded-full mr-1 flex-shrink-0">
                                    <Search className="w-4 h-4" />
                                </div>
                            </button>
                        ) : (
                            <div className="flex items-center justify-center bg-white border border-gray-300 rounded-full hover:shadow-lg transition-all duration-200 w-full h-full">
                                <video
                                    src={detectSearchSection(pathname ?? '') === 'experiences' ? '/videos/balloon.webm' : '/videos/house.webm'}
                                    autoPlay
                                    muted
                                    playsInline
                                    loop
                                    className="w-7 h-7 ml-4"
                                />
                                <button
                                    onClick={() => {
                                        setInitialSearchSection('destination');
                                        setIsExpanded(true);
                                    }}
                                    className="flex-1 px-3 py-2.5 text-sm font-medium hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-left"
                                >
                                    {detectSearchSection(pathname ?? '') === 'experiences' ? '¿Dónde?' : 'Cualquier lugar'}
                                </button>
                                <div className="h-5 w-px bg-gray-300" />
                                <button
                                    onClick={() => {
                                        setInitialSearchSection(detectSearchSection(pathname ?? '') === 'experiences' ? 'dates' : 'dates');
                                        setIsExpanded(true);
                                    }}
                                    className="flex-1 px-3 py-2.5 text-sm font-medium hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-left"
                                >
                                    {detectSearchSection(pathname ?? '') === 'experiences' ? 'Fechas' : 'Cualquier fecha'}
                                </button>
                                <div className="h-5 w-px bg-gray-300" />
                                <button
                                    onClick={() => {
                                        setInitialSearchSection(detectSearchSection(pathname ?? '') === 'experiences' ? 'participants' : 'guests');
                                        setIsExpanded(true);
                                    }}
                                    className="flex-1 px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-full transition-colors cursor-pointer text-left"
                                >
                                    {detectSearchSection(pathname ?? '') === 'experiences' ? 'Participantes' : 'Añade viajeros'}
                                </button>
                                <div className="bg-primary text-white p-2 rounded-full mr-1">
                                    <Search className="w-4 h-4" />
                                </div>
                            </div>
                        )}
                    </div>
                    </>
                    )}
                    
                    {!logoOnly && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShareHostModalOpen(true)}
                            className="hidden md:block text-sm font-medium px-4 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                          >
                            Conviértete en anfitrión
                          </button>
                        
                        <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer" aria-label="Idioma">
                            <Globe className="w-5 h-5 text-gray-700" />
                        </button>
                        
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen((v) => !v)}
                                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:shadow-md transition-all duration-200 cursor-pointer"
                                aria-label="Menú"
                            >
                                <Menu className="w-5 h-5 text-gray-700" />
                                {isAuthenticated && (
                                    <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                                    </div>
                                )}
                            </button>
                            {userMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden />
                                    <div className="absolute right-0 top-full mt-1 py-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[280px] max-w-[320px]">
                                        <Link href="/help" className="block px-4 py-3 text-sm font-medium text-secondary hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                                            Centro de ayuda
                                        </Link>
                                        <div className="border-t border-gray-100">
                                            <button
                                            type="button"
                                            className="block w-full text-left px-4 py-3 hover:bg-gray-50"
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                setShareHostModalOpen(true);
                                            }}
                                          >
                                            <p className="text-sm font-medium text-secondary">Conviértete en anfitrión</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Empieza a anfitrionar y genera ingresos adicionales, ¡es muy sencillo!</p>
                                          </button>
                                        </div>
                                        <Link href="/invite" className="block px-4 py-3 text-sm font-medium text-secondary hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                                            Invita a un anfitrión
                                        </Link>
                                        <Link href="/cohost" className="block px-4 py-3 text-sm font-medium text-secondary hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                                            Encuentra un coanfitrión
                                        </Link>
                                        <div className="border-t border-gray-100">
                                            {isAuthenticated ? (
                                                <>
                                                    <Link href="/my-bookings" className="block px-4 py-3 text-sm font-medium text-secondary hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mis reservas</Link>
                                                    <Link href="/my-reviews" className="block px-4 py-3 text-sm font-medium text-secondary hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Mis reseñas</Link>
                                                    <button type="button" onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-gray-50">
                                                        Cerrar sesión
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="block w-full text-left px-4 py-3 text-sm font-semibold text-secondary hover:bg-gray-50"
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        openLoginModal(pathname ?? '/');
                                                    }}
                                                >
                                                    Iniciar sesión o registrarse
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    )}
                </nav>
                
                {!logoOnly && (
                <div className={`flex-1 flex items-center justify-center w-full max-w-[1824px] mx-auto px-6 md:px-10 lg:px-12 transition-all duration-300 ease-out ${
                    showExpanded 
                        ? 'opacity-100 translate-y-0 visible min-h-0' 
                        : 'opacity-0 translate-y-4 pointer-events-none invisible h-0 overflow-hidden'
                } ${showExpanded ? 'py-4' : ''}`}>
                    <SearchBar
                        variant={getVariantFromPathname(pathname ?? '')}
                        initialSection={
                            initialSearchSection === 'participants'
                                ? 'guests'
                                : (initialSearchSection === 'destination' || initialSearchSection === 'dates' || initialSearchSection === 'guests'
                                    ? initialSearchSection
                                    : undefined)
                        }
                        onClose={compactMode ? () => setCompactSearchOpen(false) : undefined}
                    />
                </div>
                )}
            </header>

            <LoginModal
                open={loginModalOpen}
                onClose={() => setLoginModalOpen()}
                redirect={loginRedirect}
            />
            <ShareHostModal
                open={shareHostModalOpen}
                onClose={() => setShareHostModalOpen(false)}
            />
            <RegisterModal
                open={registerModalOpen}
                onClose={() => setRegisterModalOpen()}
                redirect={registerRedirect}
            />
        </>
    );
}

export default Header;