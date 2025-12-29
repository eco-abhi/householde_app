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
    event: string;
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
    const [selectedEvent, setSelectedEvent] = useState<string>('all');
    const [activeStore, setActiveStore] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('');
    const [showAddStore, setShowAddStore] = useState(false);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [newStoreName, setNewStoreName] = useState('');
    const [newStoreColor, setNewStoreColor] = useState(DEFAULT_COLORS[0]);
    const [newStoreEvent, setNewStoreEvent] = useState('General');
    const [newEventName, setNewEventName] = useState('');
    const [swipedItem, setSwipedItem] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(true); // Start as true to enable touch handlers
    const [moveItemId, setMoveItemId] = useState<string | null>(null);
    const [moveItemName, setMoveItemName] = useState('');
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editQty, setEditQty] = useState('');

    // Detect screen size for threshold 1024px
    useEffect(() => {
        const checkScreenSize = () => {
            const isMobile = window.innerWidth <= 1024;
            setIsMobileOrTablet(isMobile);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    useEffect(() => {
        fetchStores();

        // Refetch when page becomes visible (user navigates back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchStores();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Auto-select first store when event changes
    useEffect(() => {
        const filteredStores = selectedEvent === 'all'
            ? stores
            : stores.filter(s => (s.event || 'General') === selectedEvent);

        if (filteredStores.length > 0 && !activeStore) {
            setActiveStore(filteredStores[0]._id);
        } else if (filteredStores.length > 0 && !filteredStores.find(s => s._id === activeStore)) {
            // If current active store is not in filtered list, select first one
            setActiveStore(filteredStores[0]._id);
        }
    }, [selectedEvent, stores, activeStore]);

    const fetchStores = async () => {
        try {
            const timestamp = Date.now();
            const response = await fetch(`/api/stores?_=${timestamp}`, { cache: 'no-store' });
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

    const createEvent = () => {
        if (!newEventName.trim()) return;
        setSelectedEvent(newEventName);
        setNewStoreEvent(newEventName);
        setNewEventName('');
        setShowAddEvent(false);
        setActiveStore(null);
        // Open add store modal immediately so user can add a store to this event
        setShowAddStore(true);
    };

    const createStore = async () => {
        if (!newStoreName.trim()) return;
        try {
            const response = await fetch('/api/stores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStoreName, color: newStoreColor, event: newStoreEvent }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                setStores(prevStores => [...prevStores, data.data]);
                setActiveStore(data.data._id);
                setNewStoreName('');
                setNewStoreEvent('General');
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
        setDragStart(clientX);
        setIsDragging(true);
    };

    const onMove = (clientX: number, itemId: string) => {
        if (!isDragging) return;
        const diff = dragStart - clientX;
        if (diff > 70) setSwipedItem(itemId);
        if (diff < -70) setSwipedItem(null);
    };

    const onEnd = () => {
        setIsDragging(false);
    };

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

    // Get unique events from stores
    const uniqueEvents = Array.from(new Set(stores.map(s => s.event || 'General')));

    // Filter stores by selected event
    const filteredStores = selectedEvent === 'all'
        ? stores
        : stores.filter(s => (s.event || 'General') === selectedEvent);

    const currentStore = filteredStores.find(s => s._id === activeStore);
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
        <div className="min-h-screen bg-slate-50 pb-20 sm:pb-6">
            <div className="max-w-2xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6 w-full">
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 lg:mb-6">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-slate-900 truncate">Shopping Lists</h1>
                        <p className="text-slate-500 text-xs sm:text-sm hidden sm:block">Organize by event & store</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setShowAddEvent(true)}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-md shadow-purple-200/50 transition-all active:scale-95 text-xs sm:text-sm touch-manipulation"
                        >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Add Event</span>
                        </button>
                        <button
                            onClick={() => {
                                // Set the event to current selection (or General if 'all')
                                if (selectedEvent !== 'all') {
                                    setNewStoreEvent(selectedEvent);
                                } else {
                                    setNewStoreEvent('General');
                                }
                                setShowAddStore(true);
                            }}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-lg sm:rounded-xl font-semibold shadow-md shadow-cyan-200/50 transition-all active:scale-95 text-xs sm:text-sm touch-manipulation"
                        >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Add Store</span>
                        </button>
                    </div>
                </div>

                {/* Event Filter Tabs */}
                {uniqueEvents.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-3 sm:mb-4 scrollbar-hide scroll-container-x" style={{ marginLeft: '-0.75rem', marginRight: '-0.75rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
                        <button
                            onClick={() => {
                                setSelectedEvent('all');
                                setActiveStore(null);
                            }}
                            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all active:scale-95 shrink-0 whitespace-nowrap touch-manipulation ${selectedEvent === 'all'
                                ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200'
                                }`}
                        >
                            All Events
                        </button>
                        {uniqueEvents.map(event => {
                            const eventStores = stores.filter(s => (s.event || 'General') === event);
                            const pendingCount = eventStores.reduce((sum, store) =>
                                sum + store.items.filter(i => !i.checked).length, 0
                            );
                            const isGeneral = event === 'General';
                            return (
                                <button
                                    key={event}
                                    onClick={() => {
                                        setSelectedEvent(event);
                                        setActiveStore(null);
                                    }}
                                    className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all active:scale-95 shrink-0 whitespace-nowrap touch-manipulation ${selectedEvent === event
                                        ? isGeneral
                                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                        : 'bg-white text-slate-600 border border-slate-200'
                                        }`}
                                >
                                    <span>{event}</span>
                                    {pendingCount > 0 && (
                                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${selectedEvent === event ? 'bg-white/25' : isGeneral ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Store Tabs */}
                {filteredStores.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-3 sm:mb-4 scrollbar-hide scroll-container-x" style={{ marginLeft: '-0.75rem', marginRight: '-0.75rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
                        {filteredStores.map(store => {
                            const pendingCount = store.items.filter(i => !i.checked).length;
                            const isActive = store._id === activeStore;
                            return (
                                <button
                                    key={store._id}
                                    onClick={() => setActiveStore(store._id)}
                                    className={`
                                        relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm
                                        transition-all active:scale-95 shrink-0 whitespace-nowrap touch-manipulation
                                        ${isActive ? 'text-white shadow-md sm:shadow-lg' : 'bg-white text-slate-600 border border-slate-200'}
                                    `}
                                    style={isActive ? {
                                        background: `linear-gradient(135deg, ${store.color}, ${store.color}dd)`,
                                        boxShadow: `0 4px 12px -2px ${store.color}40`
                                    } : {}}
                                >
                                    <StoreIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="max-w-[100px] sm:max-w-[120px] lg:max-w-none truncate">{store.name}</span>
                                    {pendingCount > 0 && (
                                        <span className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-full shrink-0 ${isActive ? 'bg-white/25' : 'bg-red-100 text-red-600'}`}>
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {stores.length === 0 ? (
                    <div className="text-center py-10 sm:py-12 lg:py-16 bg-white/80 rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg">
                        <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mx-auto mb-3" />
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-2 sm:mb-3 px-4">No Stores Yet</h2>
                        <button
                            onClick={() => setShowAddStore(true)}
                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-cyan-500 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm touch-manipulation"
                        >
                            Add your first store
                        </button>
                    </div>
                ) : filteredStores.length === 0 ? (
                    <div className="text-center py-10 sm:py-12 lg:py-16 bg-white/80 rounded-xl sm:rounded-2xl border border-slate-200 shadow-lg">
                        <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mx-auto mb-3" />
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 mb-2 sm:mb-3 px-4">No Stores for {selectedEvent}</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mb-4">Create a store for this event</p>
                        <button
                            onClick={() => setShowAddStore(true)}
                            className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-500 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm touch-manipulation"
                        >
                            Add Store
                        </button>
                    </div>
                ) : currentStore && (
                    <>
                        {/* Store Header Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md mb-5">
                            <div
                                className="px-4 sm:px-5 py-4 sm:py-5 text-white flex items-center justify-between"
                                style={{ background: `linear-gradient(135deg, ${currentStore.color}, ${currentStore.color}dd)` }}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                        <StoreIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base sm:text-lg font-bold truncate">{currentStore.name}</h2>
                                        <p className="text-white/80 text-xs sm:text-sm">{uncheckedItems.length} item{uncheckedItems.length !== 1 ? 's' : ''} remaining</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteStore(currentStore._id)}
                                    className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0 touch-manipulation"
                                >
                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>

                            {/* Add Item Form */}
                            <div className="p-4 sm:p-5 bg-slate-50/50 flex gap-2 sm:gap-3">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                    placeholder="Add item..."
                                    className="flex-1 min-w-0 px-4 py-3 text-sm sm:text-base bg-white border-2 border-slate-200 rounded-xl focus:border-cyan-400 focus:outline-none touch-manipulation"
                                />
                                <input
                                    type="text"
                                    value={newItemQty}
                                    onChange={(e) => setNewItemQty(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                    placeholder="Qty"
                                    className="w-16 sm:w-20 px-2 py-3 text-sm sm:text-base text-center bg-white border-2 border-slate-200 rounded-xl focus:outline-none touch-manipulation shrink-0"
                                />
                                <button
                                    onClick={addItem}
                                    className="px-4 py-3 bg-cyan-500 text-white rounded-xl font-bold active:scale-95 transition-transform touch-manipulation shrink-0"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-4">
                            {[...uncheckedItems, ...checkedItems].map(item => (
                                <div key={item._id} className={`relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm transition-all group ${item.checked ? 'opacity-60' : ''}`}>
                                    {/* Swipe Actions (Mobile/Tablet) */}
                                    {isMobileOrTablet && (
                                        <div className={`absolute inset-y-0 right-0 flex transition-transform duration-200 ${swipedItem === item._id ? 'z-20 translate-x-0' : 'z-0 translate-x-full'}`}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEdit(item);
                                                    setSwipedItem(null);
                                                }}
                                                className="h-full px-4 sm:px-5 bg-emerald-500 text-white font-bold flex items-center gap-1.5 sm:gap-2 active:bg-emerald-600 text-xs sm:text-sm"
                                            >
                                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startMove(item);
                                                    setSwipedItem(null);
                                                }}
                                                className="h-full px-4 sm:px-5 bg-blue-500 text-white font-bold flex items-center gap-1.5 sm:gap-2 active:bg-blue-600 text-xs sm:text-sm"
                                            >
                                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                Move
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteItem(item._id);
                                                    setSwipedItem(null);
                                                }}
                                                className="h-full px-4 sm:px-5 bg-red-500 text-white font-bold flex items-center gap-1.5 sm:gap-2 active:bg-red-600 text-xs sm:text-sm"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                    {/* Item Content or Edit Form */}
                                    {editingItem === item._id ? (
                                        <div className="relative z-10 flex items-center gap-3 p-5 sm:p-6 bg-emerald-50 border-l-4 border-emerald-500">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(item._id)}
                                                className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm rounded-lg border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none touch-manipulation"
                                            />
                                            <input
                                                type="text"
                                                value={editQty}
                                                onChange={(e) => setEditQty(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && saveEdit(item._id)}
                                                placeholder="Qty"
                                                className="w-14 sm:w-16 px-2 py-2 text-xs sm:text-sm text-center rounded-lg border-2 border-emerald-300 focus:border-emerald-500 focus:outline-none touch-manipulation shrink-0"
                                            />
                                            <button
                                                onClick={() => saveEdit(item._id)}
                                                className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors touch-manipulation shrink-0"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors touch-manipulation shrink-0"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className={`relative z-10 p-5 sm:p-6 transition-transform duration-300 flex items-center gap-4 select-none ${isMobileOrTablet && swipedItem === item._id ? '-translate-x-[180px]' : 'translate-x-0'}`}
                                            style={{ touchAction: 'pan-y' }}
                                            onTouchStart={(e) => {
                                                onStart(e.touches[0].clientX);
                                            }}
                                            onTouchMove={(e) => {
                                                onMove(e.touches[0].clientX, item._id);
                                            }}
                                            onTouchEnd={() => {
                                                onEnd();
                                            }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleItem(item._id, !item.checked);
                                                }}
                                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors touch-manipulation ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300 hover:border-cyan-400'
                                                    }`}
                                            >
                                                {item.checked && <Check className="w-4 h-4 sm:w-5 sm:h-5" />}
                                            </button>
                                            <div className="flex-1 min-w-0">
                                                <span className={`block text-base sm:text-lg lg:text-xl font-bold ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                    {item.name}
                                                </span>
                                                {item.quantity && (
                                                    <span className={`inline-block px-3 py-1 rounded-full bg-gray-100 text-xs sm:text-sm mt-2 font-semibold ${item.checked ? 'text-gray-400' : 'text-gray-600'}`}>Qty: {item.quantity}</span>
                                                )}
                                            </div>

                                            {/* Desktop Actions */}
                                            {!isMobileOrTablet && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startEdit(item);
                                                        }}
                                                        className="p-2.5 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startMove(item);
                                                        }}
                                                        className="p-2.5 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                        title="Move"
                                                    >
                                                        <ArrowRight className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteItem(item._id);
                                                        }}
                                                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Add Store Modal */}
                {showAddStore && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                        <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm p-4 sm:p-5 lg:p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-4 sm:mb-5">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Add Store</h2>
                                <button
                                    onClick={() => setShowAddStore(false)}
                                    className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <input
                                    type="text"
                                    value={newStoreName}
                                    onChange={(e) => setNewStoreName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createStore()}
                                    placeholder="Store name..."
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-lg sm:rounded-xl outline-none focus:border-cyan-400 text-xs sm:text-sm touch-manipulation"
                                />
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Event/Occasion</label>
                                    <input
                                        type="text"
                                        value={newStoreEvent}
                                        onChange={(e) => setNewStoreEvent(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && createStore()}
                                        placeholder="e.g., Weekly Groceries, Birthday Party..."
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-lg sm:rounded-xl outline-none focus:border-cyan-400 text-xs sm:text-sm touch-manipulation"
                                        list="events"
                                    />
                                    <datalist id="events">
                                        {uniqueEvents.map(event => (
                                            <option key={event} value={event} />
                                        ))}
                                    </datalist>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">Color</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {DEFAULT_COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewStoreColor(color)}
                                                className={`aspect-square rounded-lg border-2 sm:border-3 transition-transform touch-manipulation ${newStoreColor === color ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setShowAddStore(false)}
                                        className="flex-1 py-2 sm:py-2.5 bg-slate-100 rounded-lg sm:rounded-xl font-semibold text-slate-700 text-xs sm:text-sm touch-manipulation"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createStore}
                                        className="flex-1 py-2 sm:py-2.5 bg-cyan-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-md sm:shadow-lg shadow-cyan-200/50 text-xs sm:text-sm touch-manipulation"
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
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                        <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm p-4 sm:p-5 shadow-2xl border border-slate-100">
                            <div className="flex justify-between items-start gap-3 mb-4">
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900">Move Item</h2>
                                    {moveItemName && (
                                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">"{moveItemName}"</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setMoveItemId(null);
                                        setMoveItemName('');
                                    }}
                                    className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0 touch-manipulation"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            {stores.filter(s => s._id !== activeStore && s.event === currentStore?.event).length === 0 ? (
                                <p className="text-center py-6 sm:py-8 text-slate-500 text-xs sm:text-sm">No other stores in this event</p>
                            ) : (
                                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                                    {stores
                                        .filter(s => s._id !== activeStore && s.event === currentStore?.event)
                                        .map(store => (
                                            <button
                                                key={store._id}
                                                onClick={() => moveItemToStore(store._id)}
                                                className="w-full flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all text-left border border-slate-100 touch-manipulation"
                                            >
                                                <div
                                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shrink-0"
                                                    style={{ backgroundColor: store.color }}
                                                />
                                                <span className="font-semibold text-slate-900 flex-1 min-w-0 truncate text-xs sm:text-sm">{store.name}</span>
                                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Add Event Modal */}
                {showAddEvent && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                        <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-sm p-4 sm:p-5 lg:p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-4 sm:mb-5">
                                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Add Event</h2>
                                <button
                                    onClick={() => setShowAddEvent(false)}
                                    className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation"
                                >
                                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <input
                                    type="text"
                                    value={newEventName}
                                    onChange={(e) => setNewEventName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createEvent()}
                                    placeholder="Event name (e.g., Birthday Party, Weekly Groceries)..."
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-lg sm:rounded-xl outline-none focus:border-purple-400 text-xs sm:text-sm touch-manipulation"
                                    autoFocus
                                />
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => setShowAddEvent(false)}
                                        className="flex-1 py-2 sm:py-2.5 bg-slate-100 rounded-lg sm:rounded-xl font-semibold text-slate-700 text-xs sm:text-sm touch-manipulation"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createEvent}
                                        disabled={!newEventName.trim()}
                                        className="flex-1 py-2 sm:py-2.5 bg-purple-500 text-white rounded-lg sm:rounded-xl font-semibold shadow-md sm:shadow-lg shadow-purple-200/50 text-xs sm:text-sm touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
