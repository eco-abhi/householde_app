'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Loader2, Dumbbell, User, Sparkles, X, Library, Check, ExternalLink, Circle, CheckCircle2 } from 'lucide-react';

type BodyPart = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio' | 'full_body';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface Member {
    _id: string;
    name: string;
    color: string;
}

interface Exercise {
    _id: string;
    member: Member;
    name: string;
    bodyPart: BodyPart;
    dayOfWeek?: DayOfWeek; // Optional - exercises can be in library without a day
    sets?: number;
    reps?: string;
    weight?: string;
    duration?: string;
    notes?: string;
    link?: string;
    completed?: boolean;
    order: number;
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string }[] = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
];

const BODY_PARTS: { value: BodyPart; label: string; icon: string; color: string }[] = [
    { value: 'chest', label: 'Chest', icon: '💪', color: 'from-red-400 to-red-600' },
    { value: 'back', label: 'Back', icon: '🏋️', color: 'from-blue-400 to-blue-600' },
    { value: 'legs', label: 'Legs', icon: '🦵', color: 'from-green-400 to-green-600' },
    { value: 'shoulders', label: 'Shoulders', icon: '🤸', color: 'from-yellow-400 to-yellow-600' },
    { value: 'arms', label: 'Arms', icon: '💪', color: 'from-purple-400 to-purple-600' },
    { value: 'abs', label: 'Abs', icon: '🔥', color: 'from-orange-400 to-orange-600' },
    { value: 'cardio', label: 'Cardio', icon: '❤️', color: 'from-pink-400 to-pink-600' },
    { value: 'full_body', label: 'Full Body', icon: '🎯', color: 'from-indigo-400 to-indigo-600' },
];

export default function ExercisesPage() {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<string>('');
    const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showLibraryModal, setShowLibraryModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [applyToAllInstances, setApplyToAllInstances] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [librarySearchQuery, setLibrarySearchQuery] = useState('');
    const [allExercises, setAllExercises] = useState<Exercise[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set());

    // Swipe/Drag State
    const [swipedItem, setSwipedItem] = useState<string | null>(null);
    const [dragStart, setDragStart] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        bodyPart: 'chest' as BodyPart,
        sets: '',
        reps: '',
        weight: '',
        duration: '',
        notes: '',
        link: '',
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
        fetchMembers();
    }, []);

    useEffect(() => {
        if (selectedMember) {
            setIsLoading(true);
            fetchExercises();
            fetchAllExercises(); // Also fetch for library
        }
    }, [selectedMember, selectedDay]);

    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/members');
            const data = await response.json();
            if (data.success && data.data.length > 0) {
                setMembers(data.data);
                if (!selectedMember) {
                    setSelectedMember(data.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchExercises = async () => {
        if (!selectedMember) return;
        try {
            const response = await fetch(`/api/exercises?memberId=${selectedMember}&dayOfWeek=${selectedDay}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            const data = await response.json();
            if (data.success) {
                setExercises(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching exercises:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllExercises = async () => {
        if (!selectedMember) return;
        try {
            const response = await fetch(`/api/exercises?memberId=${selectedMember}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            const data = await response.json();
            if (data.success) setAllExercises(data.data);
        } catch (error) {
            console.error('Error fetching all exercises:', error);
        }
    };

    // Swipe/Drag handlers
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

    const handleSave = async () => {
        if (!formData.name.trim()) return;
        
        try {
            // If editing and applying to all instances, use bulk update
            if (editingId && applyToAllInstances && editingExercise) {
                const response = await fetch('/api/exercises/bulk-update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filter: {
                            name: editingExercise.name,
                            bodyPart: editingExercise.bodyPart,
                            member: selectedMember,
                        },
                        updates: {
                            name: formData.name,
                            bodyPart: formData.bodyPart,
                            sets: formData.sets ? parseInt(formData.sets) : undefined,
                            reps: formData.reps,
                            weight: formData.weight,
                            duration: formData.duration,
                            notes: formData.notes,
                            link: formData.link,
                        },
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    fetchExercises();
                    fetchAllExercises();
                    closeModal();
                    alert(`✅ Updated ${data.modifiedCount} instance(s) of "${editingExercise.name}"`);
                    return;
                }
            }

            // Regular single exercise save
            const url = editingId ? `/api/exercises/${editingId}` : '/api/exercises';
            const method = editingId ? 'PUT' : 'POST';

            const exerciseData = {
                ...formData,
                member: selectedMember,
                dayOfWeek: selectedDay,
                sets: formData.sets ? parseInt(formData.sets) : undefined,
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(exerciseData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                alert(`Failed to save exercise: ${errorData.error || 'Unknown error'}`);
                return;
            }
            
            const data = await response.json();
            
            if (data.success && data.data) {
                if (editingId) {
                    setExercises(prevExercises => prevExercises.map(e => e._id === editingId ? data.data : e));
                    setAllExercises(prevAllExercises => prevAllExercises.map(e => e._id === editingId ? data.data : e));
                } else {
                    setExercises(prevExercises => [...prevExercises, data.data]);
                }
                closeModal();
            } else {
                console.error('Invalid response:', data);
                alert('Failed to save exercise. Please try again.');
            }
        } catch (error) {
            console.error('Error saving exercise:', error);
            alert('An error occurred. Please try again.');
        }
    };

    const openEditModal = (exercise: Exercise) => {
        setEditingId(exercise._id);
        setEditingExercise(exercise);
        setApplyToAllInstances(false);
        setFormData({
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            sets: exercise.sets?.toString() || '',
            reps: exercise.reps || '',
            weight: exercise.weight || '',
            duration: exercise.duration || '',
            notes: exercise.notes || '',
            link: exercise.link || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setEditingExercise(null);
        setApplyToAllInstances(false);
        setFormData({
            name: '',
            bodyPart: 'chest',
            sets: '',
            reps: '',
            weight: '',
            duration: '',
            notes: '',
            link: '',
        });
    };

    const deleteExercise = async (id: string) => {
        if (!confirm('Delete this exercise from this day only?')) return;
        try {
            const response = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
            const data = await response.json();
            
            if (data.success) {
                // Only remove from current day's exercises, not from library
                setExercises(prevExercises => prevExercises.filter(e => e._id !== id));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const bulkDeleteExercise = async (exercise: Exercise) => {
        const confirmMsg = `Delete "${exercise.name}" from ALL days?\n\nThis will remove:\n- The library version\n- All scheduled instances\n\nThis cannot be undone.`;
        if (!confirm(confirmMsg)) return;
        
        try {
            const response = await fetch('/api/exercises/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: exercise.name,
                    bodyPart: exercise.bodyPart,
                    member: selectedMember,
                }),
            });
            const data = await response.json();
            
            if (data.success) {
                // Refresh both lists
                fetchExercises();
                fetchAllExercises();
                alert(`✅ Deleted ${data.data.deletedCount} instance(s) of "${exercise.name}"`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete exercises');
        }
    };

    const editLibraryExercise = (exercise: Exercise) => {
        setEditingId(exercise._id);
        setEditingExercise(exercise);
        setApplyToAllInstances(true); // Default to true when editing from library
        setFormData({
            name: exercise.name,
            bodyPart: exercise.bodyPart,
            sets: exercise.sets?.toString() || '',
            reps: exercise.reps || '',
            weight: exercise.weight || '',
            duration: exercise.duration || '',
            notes: exercise.notes || '',
            link: exercise.link || '',
        });
        setShowLibraryModal(false);
        setShowModal(true);
    };

    const toggleComplete = async (exercise: Exercise) => {
        try {
            const response = await fetch(`/api/exercises/${exercise._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !exercise.completed }),
            });
            const data = await response.json();
            if (data.success && data.data) {
                setExercises(prevExercises => prevExercises.map(e => e._id === exercise._id ? data.data : e));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const generateExercises = async () => {
        if (!aiPrompt.trim() || !selectedMember) return;
        setIsGenerating(true);
        try {
            // Generate exercises with AI
            const aiResponse = await fetch('/api/ai/generate-exercises', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: aiPrompt,
                    memberId: selectedMember,
                    dayOfWeek: selectedDay,
                }),
            });
            const aiData = await aiResponse.json();
            
            if (aiData.success && aiData.data) {
                // Save each exercise to the library (without dayOfWeek)
                const savedExercises: Exercise[] = [];
                for (const exerciseData of aiData.data) {
                    // Remove dayOfWeek to save to library
                    const { dayOfWeek, ...libraryExercise } = exerciseData;
                    
                    const response = await fetch('/api/exercises', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...libraryExercise,
                            member: selectedMember,
                        }),
                    });
                    const data = await response.json();
                    if (data.success && data.data) {
                        savedExercises.push(data.data);
                    }
                }
                
                // Add to library (allExercises) instead of current day
                setAllExercises(prevExercises => [...prevExercises, ...savedExercises]);
                
                // Close modal and show success
                setShowAIModal(false);
                setAiPrompt('');
                
                // Show success message and open library
                alert(`✅ Generated ${savedExercises.length} exercises! They've been added to your library. You can now add them to any day.`);
                openLibraryModal();
            }
        } catch (error) {
            console.error('Error generating exercises:', error);
            alert('Failed to generate exercises. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const openLibraryModal = () => {
        fetchAllExercises();
        setSelectedExercises(new Set());
        setLibrarySearchQuery('');
        setShowLibraryModal(true);
    };

    const toggleExerciseSelection = (exerciseId: string) => {
        setSelectedExercises(prev => {
            const newSet = new Set(prev);
            if (newSet.has(exerciseId)) {
                newSet.delete(exerciseId);
            } else {
                newSet.add(exerciseId);
            }
            return newSet;
        });
    };

    const addSelectedExercises = async () => {
        const exercisesToAdd = allExercises.filter(ex => selectedExercises.has(ex._id));
        if (exercisesToAdd.length === 0) return;
        
        const savedExercises: Exercise[] = [];
        
        try {
            for (const exercise of exercisesToAdd) {
                const response = await fetch('/api/exercises', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        member: selectedMember,
                        dayOfWeek: selectedDay,
                        name: exercise.name,
                        bodyPart: exercise.bodyPart,
                        sets: exercise.sets,
                        reps: exercise.reps,
                        weight: exercise.weight,
                        duration: exercise.duration,
                        notes: exercise.notes,
                        link: exercise.link,
                    }),
                });
                
                if (!response.ok) {
                    console.error('Failed to add exercise:', exercise.name);
                    continue;
                }
                
                const data = await response.json();
                if (data.success && data.data) {
                    savedExercises.push(data.data);
                }
            }
            
            if (savedExercises.length > 0) {
                setExercises(prevExercises => [...prevExercises, ...savedExercises]);
            }
            
            setShowLibraryModal(false);
            setSelectedExercises(new Set());
        } catch (error) {
            console.error('Error adding exercises:', error);
            alert('Failed to add some exercises. Please try again.');
        }
    };

    const currentMember = members.find(m => m._id === selectedMember);

    const exercisesByBodyPart = exercises.reduce((acc, exercise) => {
        if (!acc[exercise.bodyPart]) {
            acc[exercise.bodyPart] = [];
        }
        acc[exercise.bodyPart].push(exercise);
        return acc;
    }, {} as Record<BodyPart, Exercise[]>);

    if (isLoading && members.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-20 sm:pb-6 w-full">
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                            Exercises
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm lg:text-base hidden sm:block">Plan and track workouts for your household</p>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
                    <button
                        onClick={openLibraryModal}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-md hover:bg-emerald-700 active:scale-95 transition-all text-xs sm:text-sm whitespace-nowrap shrink-0"
                    >
                        <Library className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Library
                    </button>
                    <button
                        onClick={() => setShowAIModal(true)}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-purple-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-md hover:bg-purple-700 active:scale-95 transition-all text-xs sm:text-sm whitespace-nowrap shrink-0"
                    >
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden xs:inline">AI</span> Generate
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold shadow-md hover:bg-blue-700 active:scale-95 transition-all text-xs sm:text-sm whitespace-nowrap shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add
                    </button>
                </div>
            </div>

            {/* Member Selector */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100 mb-4 sm:mb-6">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Select Member</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-container-x" style={{ marginLeft: '-0.75rem', marginRight: '-0.75rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
                    {members.map(member => (
                        <button
                            key={member._id}
                            onClick={() => setSelectedMember(member._id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-sm shrink-0 touch-manipulation ${
                                selectedMember === member._id
                                    ? 'text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            style={selectedMember === member._id ? { backgroundColor: member.color } : {}}
                        >
                            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {member.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex gap-2 overflow-x-auto mb-4 sm:mb-6 pb-2 scrollbar-hide scroll-container-x" style={{ marginLeft: '-0.75rem', marginRight: '-0.75rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }}>
                {DAYS_OF_WEEK.map(day => (
                    <button
                        key={day.value}
                        onClick={() => setSelectedDay(day.value)}
                        className={`px-4 sm:px-5 py-2 rounded-lg sm:rounded-xl font-semibold transition-all whitespace-nowrap text-xs sm:text-sm shrink-0 touch-manipulation ${
                            selectedDay === day.value
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span className="hidden sm:inline">{day.label}</span>
                        <span className="sm:hidden">{day.label.slice(0, 3)}</span>
                    </button>
                ))}
            </div>

            {/* Exercises by Body Part */}
            {Object.keys(exercisesByBodyPart).length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
                    <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base mb-2 px-4">No exercises for {DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label}</p>
                    <button onClick={() => setShowModal(true)} className="text-blue-600 font-semibold hover:underline text-xs sm:text-sm">
                        Add your first exercise →
                    </button>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {BODY_PARTS.map(bodyPart => {
                        const bodyPartExercises = exercisesByBodyPart[bodyPart.value];
                        if (!bodyPartExercises || bodyPartExercises.length === 0) return null;

                        return (
                            <div key={bodyPart.value} className="mb-4">
                                <div className="flex items-center gap-2 mb-3 px-1">
                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br ${bodyPart.color} rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm shrink-0`}>
                                        {bodyPart.icon}
                                    </div>
                                    <h2 className="text-base sm:text-lg font-bold text-gray-900">{bodyPart.label}</h2>
                                    <span className="ml-auto px-2.5 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold shrink-0">
                                        {bodyPartExercises.length}
                                    </span>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    {bodyPartExercises.map(exercise => (
                                        <div key={exercise._id} className="relative overflow-hidden bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm group">
                                            {/* Swipe Actions (Mobile/Tablet) */}
                                            {isMobileOrTablet && (
                                                <div className={`absolute inset-y-0 right-0 flex transition-transform duration-200 ${swipedItem === exercise._id ? 'z-20 translate-x-0' : 'z-0 translate-x-full'}`}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditModal(exercise);
                                                            setSwipedItem(null);
                                                        }}
                                                        className="h-full px-4 sm:px-5 bg-blue-500 text-white font-bold flex items-center gap-1.5 sm:gap-2 active:bg-blue-600 text-xs sm:text-sm"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteExercise(exercise._id);
                                                            setSwipedItem(null);
                                                        }}
                                                        className="h-full px-4 sm:px-5 bg-red-500 text-white font-bold flex items-center gap-1.5 sm:gap-2 active:bg-red-600 text-xs sm:text-sm"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Delete
                                                    </button>
                                                </div>
                                            )}

                                            <div 
                                                className={`relative z-10 flex items-start gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 transition-all duration-300 select-none ${isMobileOrTablet && swipedItem === exercise._id ? '-translate-x-[180px]' : 'translate-x-0'}`}
                                                style={{ touchAction: 'pan-y' }}
                                                onTouchStart={(e) => {
                                                    onStart(e.touches[0].clientX);
                                                }}
                                                onTouchMove={(e) => {
                                                    onMove(e.touches[0].clientX, exercise._id);
                                                }}
                                                onTouchEnd={() => {
                                                    onEnd();
                                                }}
                                            >
                                            <button
                                                onClick={() => toggleComplete(exercise)}
                                                className="shrink-0 mt-1 touch-manipulation"
                                            >
                                                {exercise.completed ? (
                                                    <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
                                                ) : (
                                                    <Circle className="w-6 h-6 sm:w-7 sm:h-7 text-gray-300 hover:text-gray-400" />
                                                )}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2 mb-2">
                                                    <h3 className={`font-bold text-sm sm:text-base lg:text-lg flex-1 ${exercise.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                        {exercise.name}
                                                    </h3>
                                                    {exercise.link && (
                                                        <a
                                                            href={exercise.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-all shrink-0 touch-manipulation"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                                                    {exercise.sets && <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full font-semibold ${exercise.completed ? 'opacity-60' : ''}`}>{exercise.sets} sets</span>}
                                                    {exercise.reps && <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full font-semibold ${exercise.completed ? 'opacity-60' : ''}`}>{exercise.reps} reps</span>}
                                                    {exercise.weight && <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full font-semibold ${exercise.completed ? 'opacity-60' : ''}`}>{exercise.weight}</span>}
                                                    {exercise.duration && <span className={`inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full font-semibold ${exercise.completed ? 'opacity-60' : ''}`}>{exercise.duration}</span>}
                                                </div>
                                                {exercise.notes && <p className={`text-xs sm:text-sm text-gray-500 mt-2 ${exercise.completed ? 'opacity-60' : ''}`}>{exercise.notes}</p>}
                                            </div>

                                            {/* Desktop Actions */}
                                            {!isMobileOrTablet && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <button
                                                        onClick={() => openEditModal(exercise)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteExercise(exercise._id)}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">{editingId ? 'Edit Exercise' : 'Add Exercise'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g., Bench Press"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Body Part</label>
                                <select
                                    value={formData.bodyPart}
                                    onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value as BodyPart })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    {BODY_PARTS.map(bp => (
                                        <option key={bp.value} value={bp.value}>{bp.icon} {bp.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sets</label>
                                    <input
                                        type="number"
                                        value={formData.sets}
                                        onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reps</label>
                                    <input
                                        type="text"
                                        value={formData.reps}
                                        onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="10-12"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight</label>
                                    <input
                                        type="text"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="50 lbs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                                    <input
                                        type="text"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="30 min"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Additional notes..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Video Link (Optional)</label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="https://youtube.com/watch?v=..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    🎥 Add YouTube or instructional video link
                                </p>
                            </div>
                        </div>

                        {/* Bulk update option */}
                        {editingId && editingExercise && (
                            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={applyToAllInstances}
                                        onChange={(e) => setApplyToAllInstances(e.target.checked)}
                                        className="mt-1 w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-amber-900">
                                            Apply changes to all instances
                                        </div>
                                        <div className="text-xs text-amber-700 mt-1">
                                            Update all exercises named "{editingExercise.name}" ({editingExercise.bodyPart}) across all days
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name.trim()}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                            >
                                {editingId ? 'Update' : 'Add'} Exercise
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Generate Modal */}
            {showAIModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">AI Workout Generator</h2>
                                    <p className="text-sm text-gray-500">Generate exercises and add them to your library 📚</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowAIModal(false);
                                    setAiPrompt('');
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Workout Description
                            </label>
                            <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Examples:&#10;• Beginner chest workout&#10;• Full body workout with dumbbells&#10;• 30 minute HIIT cardio session&#10;• Upper body strength training for intermediate&#10;• Leg day workout with squats and lunges"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                💡 Tip: Be specific about experience level, equipment, and focus areas for best results
                            </p>
                        </div>

                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-semibold text-purple-900 mb-1">Generating for:</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-white rounded-full text-purple-700 font-medium">
                                            {currentMember?.name}
                                        </span>
                                        <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-700 font-medium">
                                            📚 Library
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowAIModal(false);
                                    setAiPrompt('');
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                disabled={isGenerating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={generateExercises}
                                disabled={!aiPrompt.trim() || isGenerating}
                                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Generate Workout
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exercise Library Modal */}
            {showLibraryModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                                    <Library className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Exercise Library</h2>
                                    <p className="text-sm text-gray-500">Select exercises to add to {DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowLibraryModal(false);
                                    setSelectedExercises(new Set());
                                    setLibrarySearchQuery('');
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search input */}
                        <div className="mb-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={librarySearchQuery}
                                    onChange={(e) => setLibrarySearchQuery(e.target.value)}
                                    placeholder="Search exercises by name..."
                                    className="w-full px-4 py-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {librarySearchQuery && (
                                    <button
                                        onClick={() => setLibrarySearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            {librarySearchQuery && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Showing {allExercises.filter(ex => ex.name.toLowerCase().includes(librarySearchQuery.toLowerCase())).length} of {allExercises.length} exercises
                                </p>
                            )}
                        </div>

                        {/* Selected count */}
                        {selectedExercises.size > 0 && (
                            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                                <span className="text-sm font-semibold text-emerald-700">
                                    {selectedExercises.size} exercise{selectedExercises.size !== 1 ? 's' : ''} selected
                                </span>
                                <button
                                    onClick={() => setSelectedExercises(new Set())}
                                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                                >
                                    Clear selection
                                </button>
                            </div>
                        )}

                        {/* Exercises grouped by body part */}
                        <div className="space-y-4 mb-6">
                            {BODY_PARTS.map(bodyPart => {
                                const bodyPartExercises = allExercises.filter(ex => {
                                    const matchesBodyPart = ex.bodyPart === bodyPart.value;
                                    const matchesSearch = !librarySearchQuery || 
                                        ex.name.toLowerCase().includes(librarySearchQuery.toLowerCase());
                                    return matchesBodyPart && matchesSearch;
                                });
                                if (bodyPartExercises.length === 0) return null;

                                return (
                                    <div key={bodyPart.value} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-2xl">{bodyPart.icon}</span>
                                            <h3 className="font-bold text-gray-900">{bodyPart.label}</h3>
                                            <span className="ml-auto text-xs text-gray-500">{bodyPartExercises.length} exercises</span>
                                        </div>

                                        <div className="space-y-2">
                                            {bodyPartExercises.map(exercise => {
                                                const isSelected = selectedExercises.has(exercise._id);
                                                const isAlreadyInDay = exercises.some(e => 
                                                    e.name === exercise.name && 
                                                    e.bodyPart === exercise.bodyPart
                                                );

                                                return (
                                                    <div
                                                        key={exercise._id}
                                                        onClick={() => !isAlreadyInDay && toggleExerciseSelection(exercise._id)}
                                                        className={`flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                                                            isAlreadyInDay 
                                                                ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                                                                : isSelected 
                                                                    ? 'bg-emerald-50 border-2 border-emerald-500' 
                                                                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                                                        }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                                            isAlreadyInDay
                                                                ? 'border-gray-300 bg-gray-200'
                                                                : isSelected 
                                                                    ? 'border-emerald-500 bg-emerald-500' 
                                                                    : 'border-gray-300'
                                                        }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                            {isAlreadyInDay && <Check className="w-3 h-3 text-gray-400" />}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                                                                {!exercise.dayOfWeek && (
                                                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                                                        📚 Library
                                                                    </span>
                                                                )}
                                                                {exercise.dayOfWeek && exercise.dayOfWeek !== selectedDay && (
                                                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
                                                                        📅 {exercise.dayOfWeek}
                                                                    </span>
                                                                )}
                                                                {exercise.link && (
                                                                    <a
                                                                        href={exercise.link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-0.5 text-blue-500 hover:text-blue-700"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                                    </a>
                                                                )}
                                                                {isAlreadyInDay && (
                                                                    <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                                                                        Already added
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                                                                {exercise.sets && <span className="px-2 py-0.5 bg-white rounded-md">{exercise.sets} sets</span>}
                                                                {exercise.reps && <span className="px-2 py-0.5 bg-white rounded-md">{exercise.reps} reps</span>}
                                                                {exercise.weight && <span className="px-2 py-0.5 bg-white rounded-md">{exercise.weight}</span>}
                                                                {exercise.duration && <span className="px-2 py-0.5 bg-white rounded-md">{exercise.duration}</span>}
                                                            </div>
                                                        </div>

                                                        {/* Action buttons */}
                                                        <div className="flex gap-1 ml-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    editLibraryExercise(exercise);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Edit"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    bulkDeleteExercise(exercise);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                title="Delete from all days"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {allExercises.length === 0 ? (
                                <div className="text-center py-12">
                                    <Library className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-2">No exercises in your library yet</p>
                                    <p className="text-sm text-gray-400">Add exercises to build your library</p>
                                </div>
                            ) : librarySearchQuery && !BODY_PARTS.some(bp => 
                                allExercises.some(ex => ex.bodyPart === bp.value && 
                                    ex.name.toLowerCase().includes(librarySearchQuery.toLowerCase()))
                            ) ? (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <p className="text-gray-500 mb-2">No exercises found for "{librarySearchQuery}"</p>
                                    <button
                                        onClick={() => setLibrarySearchQuery('')}
                                        className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                                    >
                                        Clear search
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowLibraryModal(false);
                                    setSelectedExercises(new Set());
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addSelectedExercises}
                                disabled={selectedExercises.size === 0}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add {selectedExercises.size > 0 && `(${selectedExercises.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

