'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChefHat, ShoppingCart, Bell, ArrowRight,
  Loader2, AlertCircle, Check, Plus, TrendingUp, Activity, Trophy, Award
} from 'lucide-react';

interface DashboardStats {
  recipes: number;
  pendingItems: number;
  pendingReminders: number;
  overdueReminders: number;
}

interface Store {
  _id: string;
  name: string;
  color: string;
  items: { checked: boolean }[];
}

interface Reminder {
  _id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: string;
}

interface MemberStats {
  memberId: string;
  memberName: string;
  memberColor: string;
  totalPoints: number;
  completedCount: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    recipes: 0,
    pendingItems: 0,
    pendingReminders: 0,
    overdueReminders: 0,
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pointsStats, setPointsStats] = useState<MemberStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [recipesRes, storesRes, remindersRes, statsRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/stores'),
        fetch('/api/reminders'),
        fetch('/api/reminders/stats'),
      ]);

      const [recipesData, storesData, remindersData, statsData] = await Promise.all([
        recipesRes.json(),
        storesRes.json(),
        remindersRes.json(),
        statsRes.json(),
      ]);

      const storesList: Store[] = storesData.success ? storesData.data : [];
      const remindersList: Reminder[] = remindersData.success ? remindersData.data : [];

      const pendingItems = storesList.reduce(
        (acc, store) => acc + store.items.filter(i => !i.checked).length,
        0
      );

      const pendingReminders = remindersList.filter(r => !r.completed);
      const overdueReminders = pendingReminders.filter(
        r => new Date(r.dueDate) < new Date()
      );

      setStats({
        recipes: recipesData.success ? recipesData.data.length : 0,
        pendingItems,
        pendingReminders: pendingReminders.length,
        overdueReminders: overdueReminders.length,
      });

      setStores(storesList);
      setReminders(remindersList.filter(r => !r.completed).slice(0, 5));
      setPointsStats(statsData.success ? statsData.data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
            {getGreeting()}, Welcome Back
          </h1>
          <p className="text-slate-500">Here's your household overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Link
            href="/recipes"
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-emerald-200 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <ChefHat className="w-6 h-6 text-emerald-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.recipes}</p>
            <p className="text-sm text-slate-600 font-medium">Recipes</p>
          </Link>

          <Link
            href="/shopping"
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-cyan-200 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center group-hover:bg-cyan-200 transition-colors">
                <ShoppingCart className="w-6 h-6 text-cyan-600" />
              </div>
              {stats.pendingItems > 0 && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  {stats.pendingItems}
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.pendingItems}</p>
            <p className="text-sm text-slate-600 font-medium">Items to Buy</p>
          </Link>

          <Link
            href="/reminders"
            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-purple-200 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <Activity className="w-4 h-4 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.pendingReminders}</p>
            <p className="text-sm text-slate-600 font-medium">Reminders</p>
          </Link>

          <div className={`relative rounded-2xl p-6 shadow-sm border transition-all duration-200 ${stats.overdueReminders > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-emerald-50 border-emerald-200'
            }`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.overdueReminders > 0 ? 'bg-red-100' : 'bg-emerald-100'
                }`}>
                {stats.overdueReminders > 0 ? (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <Check className="w-6 h-6 text-emerald-600" />
                )}
              </div>
            </div>
            <p className={`text-3xl font-bold mb-1 ${stats.overdueReminders > 0 ? 'text-red-700' : 'text-emerald-700'
              }`}>
              {stats.overdueReminders > 0 ? stats.overdueReminders : '✓'}
            </p>
            <p className={`text-sm font-medium ${stats.overdueReminders > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
              {stats.overdueReminders > 0 ? 'Overdue' : 'All Clear'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Shopping Lists */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Shopping Lists</h2>
                  <p className="text-xs text-slate-500">{stores.length} stores</p>
                </div>
              </div>
              <Link
                href="/shopping"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
              >
                View all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="p-6">
              {stores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-2">No stores yet</p>
                  <Link
                    href="/shopping"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1"
                  >
                    Create your first store
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stores.slice(0, 4).map(store => {
                    const pending = store.items.filter(i => !i.checked).length;
                    const total = store.items.length;
                    const progress = total > 0 ? ((total - pending) / total) * 100 : 0;

                    return (
                      <Link
                        key={store._id}
                        href="/shopping"
                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div
                          className="w-3 h-3 rounded-full shadow-sm shrink-0"
                          style={{ backgroundColor: store.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 mb-2 truncate">{store.name}</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                              {total - pending}/{total}
                            </span>
                          </div>
                        </div>
                        {pending > 0 && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg">
                            {pending}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Reminders */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Upcoming</h2>
                  <p className="text-xs text-slate-500">{reminders.length} tasks</p>
                </div>
              </div>
              <Link
                href="/reminders"
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 group"
              >
                View all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="p-6">
              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="text-slate-600 font-medium mb-1">All caught up!</p>
                  <p className="text-sm text-slate-500">No pending reminders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.slice(0, 4).map(reminder => {
                    const isOverdue = new Date(reminder.dueDate) < new Date();
                    const isToday = new Date(reminder.dueDate).toDateString() === new Date().toDateString();

                    return (
                      <Link
                        key={reminder._id}
                        href="/reminders"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isOverdue ? 'bg-red-500' : isToday ? 'bg-amber-500' : 'bg-slate-300'
                          }`} />
                        <span className="flex-1 text-sm font-medium text-slate-700 truncate">
                          {reminder.title}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isOverdue ? 'bg-red-100 text-red-700' :
                          isToday ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                          {isOverdue ? 'Overdue' : isToday ? 'Today' :
                            new Date(reminder.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Points Leaderboard */}
        {pointsStats.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-sm border border-amber-200/60 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Points Leaderboard</h2>
                <p className="text-xs text-slate-600">Completed reminders tracked</p>
              </div>
            </div>
            <div className="space-y-3">
              {pointsStats.slice(0, 5).map((member, index) => (
                <div
                  key={member.memberId}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-amber-100 hover:border-amber-200 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                        style={{ backgroundColor: member.memberColor }}
                      >
                        {member.memberName.charAt(0).toUpperCase()}
                      </div>
                      {index < 3 && (
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                            index === 1 ? 'bg-gray-300 text-gray-700' :
                              'bg-amber-600 text-white'
                          }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{member.memberName}</p>
                      <p className="text-xs text-slate-500">{member.completedCount} tasks completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="text-xl font-bold text-amber-600">{member.totalPoints}</span>
                    <span className="text-xs text-slate-500 font-semibold">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/recipes/new"
              className="flex flex-col items-center gap-3 p-6 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors group border border-emerald-100"
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-emerald-700">New Recipe</span>
            </Link>

            <Link
              href="/shopping"
              className="flex flex-col items-center gap-3 p-6 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-colors group border border-cyan-100"
            >
              <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-cyan-700">Shopping</span>
            </Link>

            <Link
              href="/reminders"
              className="flex flex-col items-center gap-3 p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group border border-purple-100"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-purple-700">Reminder</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
