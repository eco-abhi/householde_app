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

    const currentStore = stores.find(s => s._id === activeStore);
    const uncheckedItems = currentStore?.items.filter(i => !i.checked) || [];
    const checkedItems = currentStore?.items.filter(i => i.checked) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Loading shopping lists...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 lg:p-8 max-w-5xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Shopping Lists</h1>
                    <p className="text-gray-500">Organize your shopping by store</p>
                </div>
                <button
                    onClick={() => setShowAddStore(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Store</span>
                </button>
            </div>

            {/* Store Tabs */}
            {stores.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-4 mb-6 no-scrollbar">
                    {stores.map(store => {
                        const pendingCount = store.items.filter(i => !i.checked).length;
                        const isActive = store._id === activeStore;
                        return (
                            <button
                                key={store._id}
                                onClick={() => setActiveStore(store._id)}
                                className={`
                                    relative flex items-center gap-3 px-5 py-3.5 rounded-2xl font-semibold
                                    whitespace-nowrap transition-all active:scale-95
                                    ${isActive
                                        ? 'text-white shadow-lg'
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100'
                                    }
                                `}
                                style={isActive ? { 
                                    background: `linear-gradient(135deg, ${store.color}, ${store.color}dd)`,
                                    boxShadow: `0 8px 24px -4px ${store.color}40`
                                } : {}}
                            >
                                <StoreIcon className="w-5 h-5" />
                                {store.name}
                                {pendingCount > 0 && (
                                    <span className={`
                                        px-2 py-0.5 text-xs font-bold rounded-full
                                        ${isActive ? 'bg-white/25 text-white' : 'bg-red-100 text-red-600'}
                                    `}>
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {stores.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center mx-auto mb-6">
                        <ShoppingCart className="w-10 h-10 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No stores yet</h2>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Add a store like Costco or Walmart to start organizing your shopping lists
                    </p>
                    <button
                        onClick={() => setShowAddStore(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-2xl font-semibold shadow-lg shadow-cyan-200"
                    >
                        <Plus className="w-5 h-5" />
                        Add your first store
                    </button>
                </div>
            ) : currentStore && (
                <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                    {/* Store Header */}
                    <div
                        className="p-5 lg:p-6 text-white flex items-center justify-between"
                        style={{ background: `linear-gradient(135deg, ${currentStore.color}, ${currentStore.color}dd)` }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <StoreIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{currentStore.name}</h2>
                                <p className="text-white/70 text-sm">
                                    {uncheckedItems.length} items remaining
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => deleteStore(currentStore._id)}
                            className="p-3 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Add Item Form */}
                    <div className="p-5 lg:p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                placeholder="Add an item..."
                                className="flex-1 px-5 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-base focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
                            />
                            <input
                                type="text"
                                value={newItemQty}
                                onChange={(e) => setNewItemQty(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                placeholder="Qty"
                                className="w-24 px-4 py-3.5 bg-white border-2 border-gray-100 rounded-2xl text-base focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 transition-all"
                            />
                            <button
                                onClick={addItem}
                                disabled={!newItemName.trim()}
                                className="px-5 py-3.5 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-200 disabled:to-gray-300 text-white rounded-2xl transition-all shadow-md disabled:shadow-none active:scale-95"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-gray-50">
                        {uncheckedItems.length === 0 && checkedItems.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-medium">No items yet</p>
                                <p className="text-gray-300 text-sm mt-1">Add items to your list above</p>
                            </div>
                        ) : (
                            <>
                                {uncheckedItems.map(item => (
                                    <div key={item._id} className="flex items-center gap-4 p-5 hover:bg-gray-50/50 transition-colors group">
                                        <button
                                            onClick={() => toggleItem(item._id, true)}
                                            className="w-7 h-7 rounded-full border-2 border-gray-200 hover:border-cyan-400 transition-all flex items-center justify-center group-hover:scale-110"
                                        >
                                        </button>
                                        <div className="flex-1">
                                            <span className="text-gray-900 font-medium">{item.name}</span>
                                            {item.quantity && (
                                                <span className="text-gray-400 text-sm ml-2">({item.quantity})</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteItem(item._id)}
                                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {checkedItems.length > 0 && (
                                    <>
                                        <div className="px-5 py-3 bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            ✓ Completed ({checkedItems.length})
                                        </div>
                                        {checkedItems.map(item => (
                                            <div key={item._id} className="flex items-center gap-4 p-5 bg-gray-50/30 group">
                                                <button
                                                    onClick={() => toggleItem(item._id, false)}
                                                    className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <div className="flex-1">
                                                    <span className="text-gray-400 line-through">{item.name}</span>
                                                    {item.quantity && (
                                                        <span className="text-gray-300 text-sm ml-2 line-through">({item.quantity})</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => deleteItem(item._id)}
                                                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Add Store Modal */}
            {showAddStore && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 lg:p-8 animate-scale-in shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add Store</h2>
                            <button onClick={() => setShowAddStore(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newStoreName}
                            onChange={(e) => setNewStoreName(e.target.value)}
                            placeholder="Store name (e.g., Costco)"
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mb-5 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-50 text-base"
                        />
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Choose a color</label>
                            <div className="flex gap-3 flex-wrap">
                                {DEFAULT_COLORS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewStoreColor(color)}
                                        className={`w-11 h-11 rounded-2xl transition-all ${newStoreColor === color ? 'ring-4 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                                        style={{ backgroundColor: color, outlineColor: newStoreColor === color ? color : undefined }}
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={createStore}
                            disabled={!newStoreName.trim()}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-200 disabled:to-gray-300 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-cyan-200 disabled:shadow-none"
                        >
                            Create Store
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
