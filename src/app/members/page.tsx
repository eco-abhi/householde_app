'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, Loader2, X, Check, Pencil } from 'lucide-react';

interface Member {
    _id: string;
    name: string;
    email?: string;
    color: string;
    avatar?: string;
}

const DEFAULT_COLORS = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#06b6d4', // cyan
    '#ef4444', // red
    '#14b8a6', // teal
];

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        color: DEFAULT_COLORS[0],
    });

    useEffect(() => {
        fetchMembers();

        // Refetch when page becomes visible (user navigates back)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchMembers();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchMembers = async () => {
        try {
            const timestamp = Date.now();
            const response = await fetch(`/api/members?_=${timestamp}`, { cache: 'no-store' });
            const data = await response.json();
            if (data.success) setMembers(data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openModal = () => {
        setShowModal(true);
        setEditingId(null);
        setFormData({ name: '', email: '', color: DEFAULT_COLORS[0] });
    };

    const openEditModal = (member: Member) => {
        setShowModal(true);
        setEditingId(member._id);
        setFormData({
            name: member.name,
            email: member.email || '',
            color: member.color,
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({ name: '', email: '', color: DEFAULT_COLORS[0] });
    };

    const handleSave = async () => {
        if (!formData.name.trim()) return;

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/members/${editingId}` : '/api/members';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                if (editingId) {
                    setMembers(members.map(m => m._id === editingId ? data.data : m));
                } else {
                    setMembers([...members, data.data]);
                }
                closeModal();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteMember = async (id: string) => {
        if (!confirm('Delete this member?')) return;
        try {
            await fetch(`/api/members/${id}`, { method: 'DELETE' });
            setMembers(members.filter(m => m._id !== id));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading members...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-safe">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Members</h1>
                        <p className="text-slate-600">Manage household members for task assignments</p>
                    </div>
                    <button
                        onClick={openModal}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-200/50 transition-all active:scale-95 self-start sm:self-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Add Member
                    </button>
                </div>

                {/* Members Grid */}
                {members.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                        <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">No Members Yet</h2>
                        <p className="text-slate-500 mb-6">Add members to assign them to reminders</p>
                        <button
                            onClick={openModal}
                            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                        >
                            Add Your First Member
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map(member => (
                            <div
                                key={member._id}
                                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg"
                                        style={{ backgroundColor: member.color }}
                                    >
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => openEditModal(member)}
                                            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteMember(member._id)}
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                                {member.email && (
                                    <p className="text-sm text-slate-500 truncate">{member.email}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Add/Edit Member Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {editingId ? 'Edit Member' : 'Add Member'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Name Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter member name"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
                                    />
                                </div>

                                {/* Email Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="member@email.com"
                                        className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-400 transition-colors"
                                    />
                                </div>

                                {/* Color Picker */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Avatar Color
                                    </label>
                                    <div className="grid grid-cols-8 gap-2">
                                        {DEFAULT_COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-10 h-10 rounded-lg transition-all ${formData.color === color
                                                    ? 'ring-4 ring-slate-300 scale-110'
                                                    : 'hover:scale-105'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="pt-4 border-t border-slate-200">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Preview</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg"
                                            style={{ backgroundColor: formData.color }}
                                        >
                                            {formData.name.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900">{formData.name || 'Member Name'}</p>
                                            {formData.email && <p className="text-sm text-slate-500">{formData.email}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={!formData.name.trim()}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-5 h-5" />
                                        {editingId ? 'Update' : 'Create'}
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

