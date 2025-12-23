'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Check, ShoppingCart, Store as StoreIcon,
    Loader2, X
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

    // Swipe/Drag State
    const [swipedItem, setSwipedItem] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);

    // Edit State
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editQty, setEditQty] = useState('');

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
            console.error('Error:', error);
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
            if (data.success) {
                setStores([...stores, data.data]);
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
            const remaining = stores.filter(s => s._id !== storeId);
            setStores(remaining);
            if (activeStore === storeId) {
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
            if (data.success) {
                setStores(stores.map(s => s._id === activeStore ? data.data : s));
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
            if (data.success) {
                setStores(stores.map(s => s._id === activeStore ? data.data : s));
            }
        } catch (error) {
            console.error('Error:', error);
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
            if (data.success) {
                setStores(stores.map(s => s._id === activeStore ? data.data : s));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Swipe/Drag Handlers
    const onDragStart = (clientX: number) => {
        setDragStart(clientX);
        setIsDragging(true);
    };

    const onDragMove = (clientX: number, itemId: string) => {
        if (!isDragging) return;
        const diff = dragStart - clientX;
        if (diff > 70) setSwipedItem(itemId);
        if (diff < -70) setSwipedItem(null);
    };

    const onDragEnd = () => setIsDragging(false);

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
            if (data.success) {
                setStores(stores.map(s => s._id === activeStore ? data.data : s));
                setEditingItem(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const cancelEdit = () => {
        setEditingItem(null);
        setEditName('');
        setEditQty('');
    };

    const currentStore = stores.find(s => s._id === activeStore);
    const uncheckedItems = currentStore?.items.filter(i => !i.checked) || [];
    const checkedItems = currentStore?.items.filter(i => i.checked) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Loading shopping lists...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 truncate">Shopping Lists</h1>
                    <p className="text-gray-500 text-sm md:text-lg">Organize by store</p>
                </div>
                <button
                    onClick={() => setShowAddStore(true)}
                    className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-200/50 transition-all active:scale-95 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Store</span>
                </button>
            </div>

            {/* Store Tabs */}
            {stores.length > 0 && (
                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 mb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    {stores.map(store => {
                        const pendingCount = store.items.filter(i => !i.checked).length;
                        const isActive = store._id === activeStore;
                        return (
                            <button
                                key={store._id}
                                onClick={() => setActiveStore(store._id)}
                                className={`
                                    relative flex items-center gap-2 md:gap-3 px-4 md:px-5 py-3 rounded-2xl font-semibold text-sm md:text-base
                                    transition-all active:scale-95 shrink-0
                                    ${isActive ? 'text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-100'}
                                `}
                                style={isActive ? {
                                    background: `linear-gradient(135deg, ${store.color}, ${store.color}dd)`,
                                    boxShadow: `0 8px 24px -4px ${store.color}40`
                                } : {}}
                            >
                                <StoreIcon className="w-4 h-4 md:w-5 md:h-5" />
                                {store.name}
                                {pendingCount > 0 && (
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${isActive ? 'bg-white/25' : 'bg-red-100 text-red-600'}`}>
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {stores.length === 0 ? (
                <div className="text-center py-16 bg-white/80 rounded-3xl border border-gray-100 shadow-lg">
                    <ShoppingCart className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900">No Stores Yet</h2>
                    <button onClick={() => setShowAddStore(true)} className="mt-4 px-6 py-3 bg-cyan-500 text-white rounded-2xl font-bold">
                        Add your first store
                    </button>
                </div>
            ) : currentStore && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 overflow-hidden shadow-lg">
                    {/* Store Header */}
                    <div className="p-4 md:p-6 text-white flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${currentStore.color}, ${currentStore.color}dd)` }}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <StoreIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{currentStore.name}</h2>
                                <p className="text-white/70 text-sm">{uncheckedItems.length} items remaining</p>
                            </div>
                        </div>
                        <button onClick={() => deleteStore(currentStore._id)} className="p-2 hover:bg-white/20 rounded-xl">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Add Item Form */}
                    <div className="p-4 md:p-6 border-b bg-gray-50/50 flex gap-3">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            placeholder="Add item..."
                            className="flex-1 px-4 py-3 bg-white border-2 rounded-2xl focus:border-cyan-400 outline-none"
                        />
                        <input
                            type="text"
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(e.target.value)}
                            placeholder="Qty"
                            className="w-20 px-4 py-3 bg-white border-2 rounded-2xl outline-none"
                        />
                        <button onClick={addItem} className="px-5 py-3 bg-cyan-500 text-white rounded-2xl font-bold">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-50">
                        {[...uncheckedItems, ...checkedItems].map(item => (
                            <div
                                key={item._id}
                                className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                                onTouchStart={(e) => onDragStart(e.targetTouches[0].clientX)}
                                onTouchMove={(e) => onDragMove(e.targetTouches[0].clientX, item._id)}
                                onTouchEnd={onDragEnd}
                                onMouseDown={(e) => onDragStart(e.clientX)}
                                onMouseMove={(e) => onDragMove(e.clientX, item._id)}
                                onMouseUp={onDragEnd}
                                onMouseLeave={onDragEnd}
                            >
                                {/* Swipe Buttons */}
                                <div className={`absolute inset-y-0 right-0 flex transition-transform ${swipedItem === item._id ? 'translate-x-0' : 'translate-x-full'}`}>
                                    <button onClick={() => startEdit(item)} className="h-full px-6 bg-blue-500 text-white font-bold">Edit</button>
                                    <button onClick={() => deleteItem(item._id)} className="h-full px-6 bg-red-500 text-white font-bold">Delete</button>
                                </div>

                                {/* Item Row Content */}
                                {editingItem === item._id ? (
                                    <div className="flex items-center gap-2 p-4 bg-blue-50 border-l-4 border-blue-500">
                                        <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 p-2 rounded-lg border" />
                                        <input value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-16 p-2 rounded-lg border" />
                                        <button onClick={() => saveEdit(item._id)} className="p-2 bg-blue-500 text-white rounded-lg"><Check className="w-4 h-4" /></button>
                                        <button onClick={cancelEdit} className="p-2 bg-gray-200 rounded-lg"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <div
                                        className={`flex items-center gap-4 p-4 md:p-5 bg-white transition-transform ${swipedItem === item._id ? '-translate-x-[160px]' : 'translate-x-0'}`}
                                        style={{ transition: 'transform 0.3s ease', touchAction: 'pan-y' }}
                                    >
                                        <button
                                            onClick={() => toggleItem(item._id, !item.checked)}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}
                                        >
                                            {item.checked && <Check className="w-4 h-4" />}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <span className={`block truncate font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.name}</span>
                                            {item.quantity && <span className="text-gray-400 text-sm">({item.quantity})</span>}
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
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Add Store</h2>
                            <button onClick={() => setShowAddStore(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X /></button>
                        </div>
                        <div className="space-y-6">
                            <input
                                autoFocus
                                value={newStoreName}
                                onChange={(e) => setNewStoreName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && createStore()}
                                placeholder="Store name..."
                                className="w-full px-4 py-3 bg-gray-50 border-2 rounded-2xl outline-none focus:border-cyan-400"
                            />
                            <div className="flex flex-wrap gap-3">
                                {DEFAULT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewStoreColor(color)}
                                        className={`w-10 h-10 rounded-xl border-4 ${newStoreColor === color ? 'border-gray-300 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddStore(false)} className="flex-1 py-3 bg-gray-100 rounded-2xl font-bold">Cancel</button>
                                <button onClick={createStore} className="flex-1 py-3 bg-cyan-500 text-white rounded-2xl font-bold shadow-lg shadow-cyan-200">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}