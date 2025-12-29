'use client';

import { useState, useEffect } from 'react';
import {
    Plus, Trash2, Check, Clock, RefreshCw,
    Loader2, X, Calendar, Bell, Pencil, User
} from 'lucide-react';

type RecurrenceType = 'none' | 'daily' | 'every_other_day' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
type Category = 'replace' | 'maintenance' | 'general';
type Priority = 'low' | 'medium' | 'high';

interface Member {
    _id: string;
    name: string;
    email?: string;
    color: string;
}

interface Reminder {
    _id: string;
    title: string;
    description?: string;
    dueDate: string;
    completed: boolean;
    completedAt?: string;
    recurrence: RecurrenceType;
    category: Category;
    priority: Priority;
    points: number;
    assignee?: Member;
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
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
    const [selectedMember, setSelectedMember] = useState<string>('all'); // 'all' or member _id

    // Swipe/Drag State
    const [swipedItem, setSwipedItem] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(true); // Start as true to enable touch handlers

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        recurrence: 'none' as RecurrenceType,
        category: 'general' as Category,
        priority: 'medium' as Priority,
        points: 5,
        assignee: '' as string,
    });

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
        fetchReminders();
        fetchMembers();
    }, []);

    const fetchReminders = async () => {
        try {
            const response = await fetch('/api/reminders');
            const data = await response.json();
            if (data.success) setReminders(data.data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/members');
            const data = await response.json();
            if (data.success) setMembers(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !formData.dueDate) return;
        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `/api/reminders/${editingId}` : '/api/reminders';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (data.success && data.data) {
                if (editingId) {
                    setReminders(prevReminders => prevReminders.map(r => r._id === editingId ? data.data : r));
                } else {
                    setReminders(prevReminders => [...prevReminders, data.data]);
                }
                closeModal();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const openEditModal = (reminder: Reminder) => {
        setEditingId(reminder._id);
        setFormData({
            title: reminder.title,
            description: reminder.description || '',
            dueDate: reminder.dueDate.split('T')[0],
            recurrence: reminder.recurrence,
            category: reminder.category,
            priority: reminder.priority,
            points: reminder.points || 5,
            assignee: reminder.assignee?._id || '',
        });
        setSwipedItem(null);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        resetForm();
    };

    const toggleComplete = async (reminder: Reminder) => {
        try {
            const response = await fetch(`/api/reminders/${reminder._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !reminder.completed }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                if (reminder.recurrence !== 'none' && !reminder.completed) {
                    // For recurring reminders being completed:
                    // 1. Mark the old one as completed
                    // 2. Add the new cloned reminder
                    setReminders(prevReminders => {
                        const updated = prevReminders.map(r =>
                            r._id === reminder._id
                                ? { ...r, completed: true, completedAt: new Date().toISOString() }
                                : r
                        );
                        // Add the new cloned reminder
                        return [...updated, data.data];
                    });
                } else {
                    // For non-recurring or uncompleting, just update
                    setReminders(prevReminders => prevReminders.map(r => r._id === reminder._id ? data.data : r));
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteReminder = async (id: string) => {
        if (!confirm('Delete this reminder?')) return;
        try {
            await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
            setReminders(prevReminders => prevReminders.filter(r => r._id !== id));
            setSwipedItem(null);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '', dueDate: '',
            recurrence: 'none', category: 'general', priority: 'medium', points: 5, assignee: '',
        });
    };

    // Swipe/Drag Logic triggers
    const onStart = (clientX: number) => {
        setDragStart(clientX);
        setIsDragging(true);
    };

    const onMove = (clientX: number, itemId: string) => {
        if (!isDragging) return;
        const diff = dragStart - clientX;
        if (diff > 70) {
            setSwipedItem(itemId);
        } else if (diff < -70) {
            setSwipedItem(null);
        }
    };

    const onEnd = () => {
        setIsDragging(false);
    };

    const getDueDateStatus = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-100 text-red-700' };
        if (diffDays === 0) return { label: 'Today', color: 'bg-amber-100 text-amber-700' };
        if (diffDays === 1) return { label: 'Tomorrow', color: 'bg-blue-100 text-blue-700' };
        return {
            label: new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            color: 'bg-gray-100 text-gray-600'
        };
    };

    const filteredReminders = reminders.filter(r => {
        // Calculate days until due
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(r.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Only show if due within 15 days or overdue
        const isWithinRange = daysUntilDue <= 15;

        // Filter by completion status
        let statusMatch = true;
        if (filter === 'pending') statusMatch = !r.completed && isWithinRange;
        else if (filter === 'completed') statusMatch = r.completed && isWithinRange;
        else statusMatch = isWithinRange;

        // Filter by member
        let memberMatch = true;
        if (selectedMember !== 'all') {
            if (selectedMember === 'unassigned') {
                memberMatch = !r.assignee;
            } else {
                memberMatch = r.assignee?._id === selectedMember;
            }
        }

        return statusMatch && memberMatch;
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
        </div>
    );

    return (
        <div className="p-3 sm:p-5 lg:p-8 max-w-4xl mx-auto animate-fade-in pb-20 sm:pb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
                <div>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reminders</h1>
                    <p className="text-xs sm:text-sm text-gray-500">
                        {filteredReminders.filter(r => !r.completed).length} pending
                        {reminders.filter(r => !r.completed).length > filteredReminders.filter(r => !r.completed).length && (
                            <span className="text-xs ml-1">
                                (showing due within 15 days)
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-purple-600 text-white rounded-lg sm:rounded-xl lg:rounded-2xl font-semibold shadow-md sm:shadow-lg active:scale-95 text-xs sm:text-sm lg:text-base shrink-0 touch-manipulation"
                >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> <span>Add</span>
                </button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
                {(['pending', 'completed', 'all'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl lg:rounded-2xl font-semibold transition-all capitalize active:scale-95 text-xs sm:text-sm shrink-0 touch-manipulation ${filter === f ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-100'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Member Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 sm:mb-6 scrollbar-hide scroll-container-x" style={{ marginLeft: '-0.75rem', marginRight: '-0.75rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
                <button
                    onClick={() => setSelectedMember('all')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-sm shrink-0 touch-manipulation ${selectedMember === 'all'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-gray-500 border border-gray-100'
                        }`}
                >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    All Members
                </button>
                <button
                    onClick={() => setSelectedMember('unassigned')}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-sm shrink-0 touch-manipulation ${selectedMember === 'unassigned'
                        ? 'bg-gray-600 text-white shadow-md'
                        : 'bg-white text-gray-500 border border-gray-100'
                        }`}
                >
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Unassigned
                </button>
                {members.map(member => (
                    <button
                        key={member._id}
                        onClick={() => setSelectedMember(member._id)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-sm shrink-0 touch-manipulation ${selectedMember === member._id
                            ? 'text-white shadow-md'
                            : 'bg-white text-gray-500 border border-gray-100'
                            }`}
                        style={selectedMember === member._id ? { backgroundColor: member.color } : {}}
                    >
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {member.name}
                    </button>
                ))}
            </div>

            {/* Info Banner */}
            {reminders.length > filteredReminders.length && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl flex items-start gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div className="text-xs sm:text-sm">
                        <p className="font-semibold text-blue-900 mb-1">
                            Showing reminders due within 15 days or overdue
                        </p>
                        <p className="text-blue-700">
                            {reminders.length - filteredReminders.length} reminder{reminders.length - filteredReminders.length !== 1 ? 's are' : ' is'} hidden (due more than 15 days away)
                        </p>
                    </div>
                </div>
            )}

            {/* Reminders List */}
            <div className="space-y-3 sm:space-y-4">
                {filteredReminders.map(reminder => {
                    const status = getDueDateStatus(reminder.dueDate);
                    const category = CATEGORY_OPTIONS.find(c => c.value === reminder.category);
                    const priorityStyle = PRIORITY_STYLES[reminder.priority];

                    return (
                        <div
                            key={reminder._id}
                            className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-100 bg-white group shadow-sm"
                        >
                            {/* Swipe Actions (Mobile/Tablet) */}
                            {isMobileOrTablet && (
                                <div className={`absolute inset-y-0 right-0 flex transition-transform duration-200 ${swipedItem === reminder._id ? 'z-20 translate-x-0' : 'z-0 translate-x-full'}`}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(reminder);
                                            setSwipedItem(null);
                                        }}
                                        className="h-full px-5 sm:px-6 bg-blue-500 text-white font-bold flex items-center gap-2 active:bg-blue-600"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteReminder(reminder._id);
                                            setSwipedItem(null);
                                        }}
                                        className="h-full px-5 sm:px-6 bg-red-500 text-white font-bold flex items-center gap-2 active:bg-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            )}

                            {/* Main Item Content */}
                            <div
                                className={`relative z-10 p-4 sm:p-5 lg:p-6 transition-transform duration-300 flex items-start gap-3 sm:gap-4 select-none ${isMobileOrTablet && swipedItem === reminder._id ? '-translate-x-[180px]' : 'translate-x-0'}`}
                                style={{ touchAction: 'pan-y' }}
                                onTouchStart={(e) => {
                                    onStart(e.touches[0].clientX);
                                }}
                                onTouchMove={(e) => {
                                    onMove(e.touches[0].clientX, reminder._id);
                                }}
                                onTouchEnd={() => {
                                    onEnd();
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleComplete(reminder);
                                    }}
                                    className={`mt-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors touch-manipulation ${reminder.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200 hover:border-purple-400'}`}
                                >
                                    {reminder.completed && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-bold text-sm sm:text-base lg:text-lg truncate ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{reminder.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${priorityStyle.bg} ${priorityStyle.text} shrink-0`}>{reminder.priority}</span>
                                    </div>
                                    {reminder.description && (
                                        <p className={`text-xs sm:text-sm mt-1 ${reminder.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {reminder.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                                        <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${status.color}`}>
                                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {status.label}
                                        </span>
                                        <span className="bg-gray-100 text-gray-600 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">
                                            {category?.icon} {category?.label}
                                        </span>
                                        <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
                                            ⭐ {reminder.points} pts
                                        </span>
                                        {reminder.recurrence !== 'none' && (
                                            <span className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold inline-flex items-center gap-1">
                                                <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                <span className="hidden xs:inline">{RECURRENCE_OPTIONS.find(r => r.value === reminder.recurrence)?.label}</span>
                                                <span className="xs:hidden">Repeat</span>
                                            </span>
                                        )}
                                        {reminder.assignee && (
                                            <span
                                                className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white inline-flex items-center gap-1.5"
                                                style={{ backgroundColor: reminder.assignee.color }}
                                            >
                                                <div
                                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/30 flex items-center justify-center text-[9px] sm:text-[10px] font-bold"
                                                >
                                                    {reminder.assignee.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="hidden xs:inline">{reminder.assignee.name}</span>
                                            </span>
                                        )}
                                    </div>
                                    {reminder.completed && reminder.completedAt && (
                                        <p className="text-[10px] sm:text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Check className="w-3 h-3 shrink-0" />
                                            <span className="truncate">
                                                Completed on {new Date(reminder.completedAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Desktop Buttons (Hidden when screen <= 1024px) */}
                                {!isMobileOrTablet && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditModal(reminder);
                                            }}
                                            className="p-2.5 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                            title="Edit"
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteReminder(reminder._id);
                                            }}
                                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {filteredReminders.length === 0 && reminders.length > 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                            No reminders due soon
                        </h3>
                        <p className="text-gray-500 text-sm">
                            All your reminders are due more than 15 days away
                        </p>
                    </div>
                )}

                {filteredReminders.length === 0 && reminders.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">
                            No reminders yet
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Click the + button to add your first reminder
                        </p>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-lg p-6 lg:p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit' : 'Add'} Reminder</h2>
                            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-5">
                            <input
                                placeholder="Task Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-purple-400 transition-all"
                            />
                            <textarea
                                placeholder="Description (Optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-purple-400 resize-none h-24"
                            />
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none"
                            />
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Recurrence</label>
                                <select
                                    value={formData.recurrence}
                                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value as RecurrenceType })}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-purple-400 transition-all"
                                >
                                    {RECURRENCE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                                {formData.recurrence !== 'none' && (
                                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                        <RefreshCw className="w-3 h-3" />
                                        This reminder will automatically renew when completed
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })} className="px-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none">
                                    {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                                </select>
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })} className="px-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none">
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Points (1-10)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    step="1"
                                    value={formData.points}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value) || 5;
                                        setFormData({ ...formData, points: Math.min(Math.max(value, 1), 10) });
                                    }}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-purple-400 transition-all"
                                    placeholder="Enter points (1-10, default: 5)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To</label>
                                <select
                                    value={formData.assignee}
                                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                    className="w-full px-4 py-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-purple-400 transition-colors"
                                >
                                    <option value="">Unassigned</option>
                                    {members.map(member => (
                                        <option key={member._id} value={member._id}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={!formData.title.trim() || !formData.dueDate}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-bold mt-4 shadow-lg disabled:from-gray-300 disabled:shadow-none transition-all active:scale-95"
                            >
                                {editingId ? 'Update Reminder' : 'Create Reminder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}