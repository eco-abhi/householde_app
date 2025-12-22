"use client";

import { useState } from "react";

const navItems = [
  "Overview",
  "Budgets",
  "Households",
  "Tasks",
  "Schedules",
  "Insights",
  "Support",
];

const quickStats = [
  {
    title: "Monthly spend",
    value: "$4,820",
    change: "+12%",
  },
  {
    title: "Active plans",
    value: "18",
    change: "+3 new",
  },
  {
    title: "Upcoming tasks",
    value: "7",
    change: "2 due today",
  },
];

const tasks = [
  {
    title: "Restock pantry",
    due: "Today · 4:00 PM",
    owner: "Jamie",
  },
  {
    title: "Schedule HVAC service",
    due: "Tomorrow · 10:30 AM",
    owner: "Taylor",
  },
  {
    title: "Review utilities",
    due: "Fri · 2:00 PM",
    owner: "Alex",
  },
];

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white px-6 py-8 lg:flex">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-base font-semibold text-white">
              HH
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Household
              </p>
              <p className="text-lg font-semibold">Householde</p>
            </div>
          </div>

          <nav className="mt-12 flex flex-1 flex-col gap-2">
            {navItems.map((item, index) => (
              <button
                key={item}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-slate-100 ${
                  index === 0
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600"
                }`}
              >
                <span>{item}</span>
                <span className="text-xs text-slate-400">›</span>
              </button>
            ))}
          </nav>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">
              Household score
            </p>
            <p className="mt-3 text-3xl font-semibold">92</p>
            <p className="mt-2 text-xs text-slate-500">
              Your routines are on track this week.
            </p>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur lg:px-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Dashboard
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">
                  Welcome back, Jamie
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-200/40">
                  Share update
                </button>
                <button className="hidden h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 lg:flex">
                  J
                </button>
                <button
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-200/40 lg:hidden"
                  onClick={() => setIsMenuOpen((open) => !open)}
                >
                  Menu
                  <span className="text-base">▾</span>
                </button>
              </div>
            </div>

            {isMenuOpen && (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/40 lg:hidden">
                <nav className="flex flex-col gap-2">
                  {navItems.map((item, index) => (
                    <button
                      key={item}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-slate-100 ${
                        index === 0
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>{item}</span>
                      <span className="text-xs text-slate-400">›</span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </header>

          <main className="flex-1 px-6 pb-16 pt-8 lg:px-12">
            <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
              <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">This week</p>
                    <h2 className="mt-2 text-2xl font-semibold">
                      Household highlights
                    </h2>
                  </div>
                  <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
                    View report
                  </button>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {quickStats.map((stat) => (
                    <div
                      key={stat.title}
                      className="rounded-3xl bg-slate-50 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {stat.title}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs font-medium text-emerald-600">
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6 text-white">
                  <p className="text-sm text-slate-200">Upcoming focus</p>
                  <h3 className="mt-3 text-2xl font-semibold">
                    Plan the household wellness day
                  </h3>
                  <p className="mt-2 text-sm text-slate-200">
                    Create a shared schedule and track errands with the family
                    insights bundle.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
                      Create plan
                    </button>
                    <button className="rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white">
                      Invite members
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Today</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      3 priorities
                    </span>
                  </div>
                  <div className="mt-6 flex flex-col gap-4">
                    {tasks.map((task) => (
                      <div
                        key={task.title}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-900">
                          {task.title}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <span>{task.due}</span>
                          <span>Owner · {task.owner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                  <h3 className="text-lg font-semibold">Upcoming payments</h3>
                  <div className="mt-5 space-y-4">
                    {[
                      { label: "Utilities", amount: "$380", date: "Oct 17" },
                      { label: "Groceries", amount: "$520", date: "Oct 19" },
                      { label: "Childcare", amount: "$1,200", date: "Oct 22" },
                    ].map((bill) => (
                      <div
                        key={bill.label}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {bill.label}
                          </p>
                          <p className="text-xs text-slate-500">Due {bill.date}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {bill.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
