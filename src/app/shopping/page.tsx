'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Check, ShoppingCart, Store as StoreIcon,
    Loader2, X, ArrowRight
} from 'lucide-react';

interface ShoppingItem {
    _id: string;
    name: string;
    quantity?: string;
    checked: boolean;
}

interface Store {
    _id: string;
    name: string;
    color: string;
    items: ShoppingItem[];
}

const DEFAULT_COLORS = [
    '#10b981', // emerald
    '#0891b2', // cyan
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f97316', // orange
    '#eab308', // yellow
];

export default function ShoppingPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [activeStore, setActiveStore] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [showAddStore, setShowAddStore] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreColor, setNewStoreColor] = useState(DEFAULT_COLORS[0]);
    const [swipedItem, setSwipedItem] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
    const [moveItemId, setMoveItemId] = useState<string | null>(null);
    const [moveItemName, setMoveItemName] = useState('');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editQty, setEditQty] = useState('');

    // Detect screen size for threshold 1024px
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileOrTablet(window.innerWidth <= 1024);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const response = await fetch('/api/stores');
            const data = await response.json();
            if (data.success) {
                setStores(data.data);
                if (data.data.length > 0 && !activeStore) {
                    setActiveStore(data.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching stores:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createStore = async () => {
        if (!newStoreName.trim()) return;
        try {
            const response = await fetch('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStoreName, color: newStoreColor }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                setStores(prevStores => [...prevStores, data.data]);
                setActiveStore(data.data._id);
                setNewStoreName('');
                setShowAddStore(false);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteStore = async (storeId: string) => {
        if (!confirm('Delete this store and all its items?')) return;
        try {
            await fetch(`/api/stores/${storeId}`, { method: 'DELETE' });
            setStores(prevStores => {
                const remaining = prevStores.filter(s => s._id !== storeId);
                return remaining;
            });
            if (activeStore === storeId) {
                const remaining = stores.filter(s => s._id !== storeId);
                setActiveStore(remaining.length > 0 ? remaining[0]._id : null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addItem = async () => {
        if (!newItemName.trim() || !activeStore) return;
        try {
            const response = await fetch(`/api/stores/${activeStore}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newItemName, quantity: newItemQty }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                // Update the specific store with the fresh data from API
                setStores(prevStores => prevStores.map(s =>
                    s._id === activeStore ? data.data : s
                ));
                setNewItemName('');
                setNewItemQty('');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleItem = async (itemId: string, checked: boolean) => {
        if (!activeStore) return;
        try {
            const response = await fetch(`/api/stores/${activeStore}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, checked }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                // Update the specific store with the fresh data from API
                setStores(prevStores => prevStores.map(s =>
                    s._id === activeStore ? data.data : s
                ));
            } else if (response.status === 404) {
                // Item not found - data is stale, refetch everything
                await fetchStores();
            }
        } catch (error) {
            console.error('Error:', error);
            // Refetch on error to recover
            await fetchStores();
        }
    };

    const deleteItem = async (itemId: string) => {
        if (!activeStore) return;
        try {
            const response = await fetch(`/api/stores/${activeStore}/items`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                // Update the specific store with the fresh data from API
                setStores(prevStores => prevStores.map(s =>
                    s._id === activeStore ? data.data : s
                ));
                setSwipedItem(null);
            } else if (response.status === 404) {
                // Item not found - data is stale, refetch everything
                await fetchStores();
                setSwipedItem(null);
            }
        } catch (error) {
            console.error('Error:', error);
            // Refetch on error to recover
            await fetchStores();
        }
    };

    const startEdit = (item: ShoppingItem) => {
        setEditingItem(item._id);
        setEditName(item.name);
        setEditQty(item.quantity || '');
        setSwipedItem(null);
    };

    const saveEdit = async (itemId: string) => {
        if (!editName.trim() || !activeStore) return;
        try {
            const response = await fetch(`/api/stores/${activeStore}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, name: editName, quantity: editQty }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                // Update the specific store with the fresh data from API
                setStores(prevStores => prevStores.map(s =>
                    s._id === activeStore ? data.data : s
                ));
                setEditingItem(null);
            } else if (response.status === 404) {
                // Item not found - data is stale, refetch everything
                await fetchStores();
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error:', error);
            // Refetch on error to recover
            await fetchStores();
        }
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setEditName('');
        setEditQty('');
    };

    const startMove = (item: ShoppingItem) => {
        setMoveItemId(item._id);
        setMoveItemName(item.name);
        setSwipedItem(null);
    };

    // Touch/Drag handlers for swipe (matches reminders page)
    const onStart = (clientX: number) => {
        if (!isMobileOrTablet) return;
        setDragStart(clientX);
        setIsDragging(true);
    };

    const onMove = (clientX: number, itemId: string) => {
        if (!isDragging || !isMobileOrTablet) return;
        const diff = dragStart - clientX;
        if (diff > 70) setSwipedItem(itemId);
        if (diff < -70) setSwipedItem(null);
    };

    const onEnd = () => setIsDragging(false);

    const moveItemToStore = async (targetStoreId: string) => {
        if (!moveItemId || !activeStore || !targetStoreId) return;

        try {
            const response = await fetch(`/api/stores/${activeStore}/items/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: moveItemId, targetStoreId }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                // Update both source and target stores with fresh data from API
                setStores(prevStores => prevStores.map(s => {
                    if (s._id === activeStore) return data.data.sourceStore;
                    if (s._id === targetStoreId) return data.data.targetStore;
                    return s;
                }));
                setMoveItemId(null);
                setMoveItemName('');
                setSwipedItem(null);
            } else if (response.status === 404) {
                // Item not found - data is stale, refetch everything
                await fetchStores();
                setMoveItemId(null);
                setMoveItemName('');
                setSwipedItem(null);
            }
        } catch (error) {
            console.error('Error moving item:', error);
            // Refetch on error to recover
            await fetchStores();
        }
    };

    const currentStore = stores.find(s => s._id === activeStore);
    const uncheckedItems = currentStore?.items.filter(i => !i.checked) || [];
    const checkedItems = currentStore?.items.filter(i => i.checked) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">Loading shopping lists...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-safe">
            <div className="max-w-2xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-4 md:mb-6">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 truncate">Shopping Lists</h1>
                        <p className="text-slate-500 text-xs sm:text-sm">Organize by store</p>
                    </div>
                    <button
                        onClick={() => setShowAddStore(true)}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-xl font-semibold shadow-lg shadow-cyan-200/50 transition-all active:scale-95 text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden xs:inline">Store</span>
                    </button>
                </div>

                {/* Store Tabs */}
                {stores.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                        {stores.map(store => {
                            const pendingCount = store.items.filter(i => !i.checked).length;
                            const isActive = store._id === activeStore;
                            return (
                                <button
                                    key={store._id}
                                    onClick={() => setActiveStore(store._id)}
                                    className={`
                                        relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm
                                        transition-all active:scale-95 shrink-0 whitespace-nowrap
                                        ${isActive ? 'text-white shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}
                                    `}
                                    style={isActive ? {
                                        background: `linear-gradient(135deg, ${store.color}, ${store.color}dd)`,
                                        boxShadow: `0 4px 12px -2px ${store.color}40`
                                    } : {}}
                                >
                                    <StoreIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="max-w-[120px] sm:max-w-none truncate">{store.name}</span>
                                    {pendingCount > 0 && (
                                        <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full ${isActive ? 'bg-white/25' : 'bg-red-100 text-red-600'}`}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {stores.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-white/80 rounded-2xl border border-slate-200 shadow-lg">
                        <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mx-auto mb-3" />
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">No Stores Yet</h2>
                        <button
                            onClick={() => setShowAddStore(true)}
                            className="px-5 py-2.5 bg-cyan-500 text-white rounded-xl font-semibold text-sm"
                        >
                            Add your first store
                        </button>
                    </div>
                ) : currentStore && (
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
                        {/* Store Header */}
                        <div
                            className="px-3 sm:px-4 py-3 sm:py-4 text-white flex items-center justify-between"
                            style={{ background: `linear-gradient(135deg, ${currentStore.color}, ${currentStore.color}dd)` }}
                        >
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    <StoreIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base sm:text-lg font-bold truncate">{currentStore.name}</h2>
                                    <p className="text-white/70 text-xs sm:text-sm">{uncheckedItems.length} item{uncheckedItems.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteStore(currentStore._id)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                            >
                                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Add Item Form */}
                        <div className="p-3 sm:p-4 border-b bg-slate-50/50 flex gap-2">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                placeholder="Add item..."
                                className="flex-1 min-w-0 px-3 py-2.5 text-sm bg-white border-2 border-slate-200 rounded-xl focus:border-cyan-400 focus:outline-none"
                            />
                            <input
                                type="text"
                                value={newItemQty}
                                onChange={(e) => setNewItemQty(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                placeholder="Qty"
                                className="w-14 sm:w-16 px-2 py-2.5 text-sm text-center bg-white border-2 border-slate-200 rounded-xl focus:outline-none"
                            />
                            <button
                                onClick={addItem}
                                className="px-3 py-2.5 bg-cyan-500 text-white rounded-xl font-bold active:scale-95 transition-transform"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="divide-y divide-slate-100">
                            {[...uncheckedItems, ...checkedItems].map(item => (
                                <div key={item._id} className="relative overflow-hidden bg-white">
                                    {/* Swipe Actions Background */}
                                    <div className={`absolute inset-y-0 right-0 flex transition-transform duration-200 z-0 pointer-events-auto ${swipedItem === item._id ? 'translate-x-0' : 'translate-x-full'}`}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEdit(item);
                                            }}
                                            className="h-full px-3 bg-emerald-500 text-white font-semibold flex items-center justify-center pointer-events-auto shrink-0"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startMove(item);
                                            }}
                                            className="h-full px-3 bg-blue-500 text-white font-semibold flex items-center justify-center pointer-events-auto shrink-0"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteItem(item._id);
                                            }}
                                            className="h-full px-3 bg-red-500 text-white font-semibold flex items-center justify-center pointer-events-auto shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Item Content or Edit Form */}
                                    {editingItem === item._id ? (
                                        <div className="relative z-10 flex items-center gap-2 px-3 sm:px-4 py-3 bg-emerald-50 border-l-4 border-emerald-500">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(item._id)}
                                                className="flex-1 px-3 py-2 text-sm rounded-lg border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                                            />
                                            <input
                                                type="text"
                                                value={editQty}
                                                onChange={(e) => setEditQty(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(item._id)}
                                                placeholder="Qty"
                                                className="w-14 sm:w-16 px-2 py-2 text-sm text-center rounded-lg border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none"
                                            />
                                            <button
                                                onClick={() => saveEdit(item._id)}
                                                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={`relative z-10 flex items-center gap-3 px-3 sm:px-4 py-3.5 bg-white transition-transform duration-200 touch-pan-y select-none ${isMobileOrTablet ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'} ${swipedItem === item._id ? '-translate-x-[120px]' : 'translate-x-0'}`}
                                            onClick={() => {
                                                // Desktop: Click anywhere on row to toggle actions
                                                if (!isMobileOrTablet) {
                                                    setSwipedItem(swipedItem === item._id ? null : item._id);
                                                }
                                            }}
                                            onTouchStart={isMobileOrTablet ? (e) => onStart(e.touches[0].clientX) : undefined}
                                            onTouchMove={isMobileOrTablet ? (e) => onMove(e.touches[0].clientX, item._id) : undefined}
                                            onTouchEnd={isMobileOrTablet ? onEnd : undefined}
                                            onMouseLeave={() => {
                                                if (isMobileOrTablet) onEnd();
                                            }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleItem(item._id, !item.checked);
                                                }}
                                                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-400'
                                                    }`}
                                            >
                                                {item.checked && <Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <span className={`block truncate text-sm sm:text-base font-medium ${item.checked ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                    {item.name}
                                                </span>
                                                {item.quantity && (
                                                    <span className="text-slate-400 text-xs sm:text-sm">({item.quantity})</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Store Modal */}
                {showAddStore && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-xl font-bold text-slate-900">Add Store</h2>
                                <button
                                    onClick={() => setShowAddStore(false)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={newStoreName}
                                    onChange={(e) => setNewStoreName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createStore()}
                                    placeholder="Store name..."
                                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-cyan-400 text-sm"
                                />
                                <div className="grid grid-cols-6 gap-2">
                                    {DEFAULT_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setNewStoreColor(color)}
                                            className={`aspect-square rounded-lg border-3 transition-transform ${newStoreColor === color ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setShowAddStore(false)}
                                        className="flex-1 py-2.5 bg-slate-100 rounded-xl font-semibold text-slate-700 text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createStore}
                                        className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-200/50 text-sm"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Move Item Modal */}
                {moveItemId && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Move Item</h2>
                                    {moveItemName && (
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">"{moveItemName}"</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setMoveItemId(null);
                                        setMoveItemName('');
                                    }}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            {stores.filter(s => s._id !== activeStore).length === 0 ? (
                                <p className="text-center py-8 text-slate-500 text-sm">No other stores available</p>
                            ) : (
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {stores
                                        .filter(s => s._id !== activeStore)
                                        .map(store => (
                                            <button
                                                key={store._id}
                                                onClick={() => moveItemToStore(store._id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all text-left border border-slate-100"
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full shrink-0"
                                                    style={{ backgroundColor: store.color }}
                                                />
                                                <span className="font-semibold text-slate-900 flex-1 min-w-0 truncate">{store.name}</span>
                                                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
