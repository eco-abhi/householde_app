'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Check, Clock, RefreshCw,
    Loader2, X, Calendar, Bell
} from 'lucide-react';

type RecurrenceType = 'none' | 'daily' | 'every_other_day' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
type Category = 'replace' | 'maintenance' | 'general';
type Priority = 'low' | 'medium' | 'high';

interface Reminder {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    completed: boolean;
    recurrence: RecurrenceType;
    category: Category;
    priority: Priority;
}

const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
    { value: 'none', label: 'No repeat' },
    { value: 'daily', label: 'Every day' },
    { value: 'every_other_day', label: 'Every other day' },
    { value: 'weekly', label: 'Every week' },
    { value: 'biweekly', label: 'Every 2 weeks' },
    { value: 'monthly', label: 'Every month' },
    { value: 'quarterly', label: 'Every 3 months' },
    { value: 'yearly', label: 'Every year' },
];

const CATEGORY_OPTIONS: { value: Category; label: string; icon: string; color: string }[] = [
    { value: 'replace', label: 'Replace', icon: '🔄', color: 'from-orange-400 to-orange-600' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'from-blue-400 to-blue-600' },
    { value: 'general', label: 'General', icon: '📋', color: 'from-gray-400 to-gray-600' },
];

const PRIORITY_STYLES = {
    low: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    high: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function RemindersPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        recurrence: 'none' as RecurrenceType,
        category: 'general' as Category,
        priority: 'medium' as Priority,
    });

    useEffect(() => {
        fetchReminders();
    }, []);

    const fetchReminders = async () => {
        try {
            const response = await fetch('/api/reminders');
            const data = await response.json();
            if (data.success) {
                setReminders(data.data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createReminder = async () => {
        if (!formData.title.trim() || !formData.dueDate) return;
        try {
            const response = await fetch('/api/reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success) {
                setReminders([...reminders, data.data]);
                setShowAddModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const toggleComplete = async (reminder: Reminder) => {
        try {
            const response = await fetch(`/api/reminders/${reminder._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !reminder.completed }),
            });
            const data = await response.json();
            if (data.success) {
                setReminders(reminders.map(r => r._id === reminder._id ? data.data : r));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteReminder = async (id: string) => {
        if (!confirm('Delete this reminder?')) return;
        try {
            await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
            setReminders(reminders.filter(r => r._id !== id));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            recurrence: 'none',
            category: 'general',
            priority: 'medium',
        });
    };

    const getDueDateStatus = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-700', urgent: true };
        if (diffDays === 0) return { label: 'Today', color: 'bg-amber-100 text-amber-700', urgent: true };
        if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-blue-100 text-blue-700', urgent: false };
        if (diffDays <= 7) return { label: `In ${diffDays} days`, color: 'bg-emerald-100 text-emerald-700', urgent: false };
        return { 
            label: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
            color: 'bg-gray-100 text-gray-600',
            urgent: false 
        };
    };

    const filteredReminders = reminders.filter(r => {
        if (filter === 'pending') return !r.completed;
        if (filter === 'completed') return r.completed;
        return true;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const pendingCount = reminders.filter(r => !r.completed).length;
    const overdueCount = reminders.filter(r => !r.completed && new Date(r.dueDate) < new Date()).length;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">Loading reminders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 lg:p-8 max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">To-do / Replace</h1>
                    <p className="text-gray-500">
                        {pendingCount} pending
                        {overdueCount > 0 && (
                            <span className="text-red-500 font-semibold ml-1">• {overdueCount} overdue</span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Add Reminder</span>
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-8">
                {(['pending', 'completed', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-5 py-2.5 rounded-2xl font-semibold transition-all capitalize active:scale-95 ${filter === f
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border-2 border-gray-100'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Reminders List */}
            {filteredReminders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mx-auto mb-6">
                        {filter === 'pending' ? (
                            <Check className="w-10 h-10 text-emerald-400" />
                        ) : (
                            <Bell className="w-10 h-10 text-purple-400" />
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {filter === 'pending' ? 'All caught up! 🎉' : 'No reminders yet'}
                    </h2>
                    <p className="text-gray-500 mb-6">
                        {filter === 'pending' ? 'No pending reminders' : 'Add a reminder to get started'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4 stagger">
                    {filteredReminders.map(reminder => {
                        const status = getDueDateStatus(reminder.dueDate);
                        const category = CATEGORY_OPTIONS.find(c => c.value === reminder.category);
                        const priorityStyle = PRIORITY_STYLES[reminder.priority];

                        return (
                            <div
                                key={reminder._id}
                                className={`bg-white rounded-3xl border border-gray-100 p-5 lg:p-6 transition-all hover:shadow-lg hover:border-transparent group ${reminder.completed ? 'opacity-60' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <button
                                        onClick={() => toggleComplete(reminder)}
                                        className={`mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${reminder.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-gray-200 hover:border-purple-400 hover:scale-110'
                                            }`}
                                    >
                                        {reminder.completed && <Check className="w-4 h-4" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className={`text-lg font-semibold ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                {reminder.title}
                                            </h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${priorityStyle.bg} ${priorityStyle.text}`}>
                                                {reminder.priority}
                                            </span>
                                        </div>

                                        {reminder.description && (
                                            <p className={`text-sm mb-3 ${reminder.completed ? 'text-gray-300 line-through' : 'text-gray-500'}`}>
                                                {reminder.description}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
                                                <Calendar className="w-3.5 h-3.5" />
                                                {status.label}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                {category?.icon} {category?.label}
                                            </span>
                                            {reminder.recurrence !== 'none' && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    {RECURRENCE_OPTIONS.find(r => r.value === reminder.recurrence)?.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => deleteReminder(reminder._id)}
                                        className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Reminder Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 lg:p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add Reminder</h2>
                            <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Replace fire alarm batteries"
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Optional details..."
                                    rows={2}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 resize-none text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date *</label>
                                <input
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Repeat</label>
                                <select
                                    value={formData.recurrence}
                                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as RecurrenceType })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 text-base appearance-none"
                                >
                                    {RECURRENCE_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 text-base appearance-none"
                                    >
                                        {CATEGORY_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 text-base appearance-none"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={createReminder}
                            disabled={!formData.title.trim() || !formData.dueDate}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-200 disabled:to-gray-300 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-purple-200 disabled:shadow-none"
                        >
                            Create Reminder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
