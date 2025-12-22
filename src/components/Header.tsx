'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChefHat, Plus, Menu, X } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Home' },
    { href: '/recipes', label: 'Recipes' },
];

export default function Header() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 glass border-b border-gray-200/60 safe-top">
            <div className="section">
                <div className="container-xl">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-700 transition-colors">
                                <ChefHat className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-gray-900 hidden sm:block">
                                House Recipes
                            </span>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <Link
                                href="/recipes/new"
                                className="ml-2 btn btn-primary btn-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Recipe
                            </Link>
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-2 md:hidden">
                            <Link
                                href="/recipes/new"
                                className="btn btn-primary btn-sm"
                            >
                                <Plus className="w-4 h-4" />
                            </Link>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="icon-btn"
                                aria-label="Toggle menu"
                            >
                                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Nav */}
                    {isMenuOpen && (
                        <nav className="md:hidden py-3 border-t border-gray-100 animate-slide-down">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === item.href
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}
