'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    ChefHat,
    ShoppingCart,
    CheckSquare,
    Menu,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/recipes', label: 'Recipes', icon: ChefHat },
    { href: '/shopping', label: 'Shopping Lists', icon: ShoppingCart },
    { href: '/reminders', label: 'Reminders', icon: CheckSquare },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem('sidebarCollapsed');
        if (saved !== null) {
            setIsCollapsed(JSON.parse(saved));
        } else {
            const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
            setIsCollapsed(isTablet);
        }
    }, []);

    const toggleCollapsed = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    };

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    if (!mounted) return null;

    return (
        <>
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <div className="px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm">
                            <Home className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-slate-900">Pandey's Household</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-200 transition-all duration-300
                    lg:sticky lg:h-screen overflow-x-hidden
                    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                    lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
                `}
            >
                <div className="flex flex-col h-full w-full">
                    {/* Logo Section */}
                    <div className={`border-b border-slate-200 transition-all ${isCollapsed ? 'p-4' : 'p-6'}`}>
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-emerald-600 transition-colors shrink-0">
                                <Home className="w-5 h-5 text-white" />
                            </div>
                            <div className={`transition-all duration-300 overflow-hidden min-w-0 ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                                <p className="font-bold text-slate-900 whitespace-nowrap">Pandey's</p>
                                <p className="text-xs text-slate-500 whitespace-nowrap">Household</p>
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Section */}
                    <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'p-3' : 'p-4'}`}>
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`
                                            group relative flex items-center gap-3 rounded-lg transition-all
                                            ${isCollapsed ? 'lg:justify-center p-3' : 'px-3 py-2.5'}
                                            ${active
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-emerald-600' : ''}`} />
                                        <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                                            {item.label}
                                        </span>

                                        {/* Tooltip for collapsed state */}
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap hidden lg:block z-50">
                                                {item.label}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Footer / Toggle Section */}
                    <div className={`border-t border-slate-200 overflow-hidden ${isCollapsed ? 'p-3' : 'p-4'}`}>
                        <button
                            onClick={toggleCollapsed}
                            className={`
                                hidden lg:flex items-center gap-3 w-full rounded-lg transition-all text-slate-500 hover:bg-slate-100 hover:text-slate-700
                                ${isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                            `}
                        >
                            <div className="flex items-center justify-center shrink-0">
                                {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </div>
                            <span className={`font-medium text-sm whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100'}`}>
                                Collapse
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}