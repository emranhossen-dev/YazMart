import React from "react";

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8 animate-pulse">
      {/* Breadcrumb / Title Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-[var(--border)] rounded-md"></div>
        <div className="h-8 w-64 bg-[var(--border)] rounded-lg"></div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Filters Skeleton */}
        <div className="space-y-6 hidden lg:block">
          <div className="h-6 w-24 bg-[var(--border)] rounded-md"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-[var(--border)] rounded-md"></div>
            <div className="h-4 w-5/6 bg-[var(--border)] rounded-md"></div>
            <div className="h-4 w-4/5 bg-[var(--border)] rounded-md"></div>
          </div>
          <div className="h-px bg-[var(--border)]"></div>
          <div className="h-6 w-32 bg-[var(--border)] rounded-md"></div>
          <div className="h-10 w-full bg-[var(--border)] rounded-lg"></div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="lg:col-span-3 space-y-6">
          {/* Toolbar */}
          <div className="flex justify-between items-center bg-[var(--card)] p-4 rounded-xl border border-[var(--border)]">
            <div className="h-4 w-28 bg-[var(--border)] rounded-md"></div>
            <div className="h-8 w-44 bg-[var(--border)] rounded-lg"></div>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
                <div className="h-48 w-full bg-[var(--border)] rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-[var(--border)] rounded-md"></div>
                  <div className="h-5 w-full bg-[var(--border)] rounded-md"></div>
                </div>
                <div className="h-8 w-full bg-[var(--border)] rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
