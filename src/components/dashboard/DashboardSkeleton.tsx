'use client';

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-ofira-surface2 ${className}`} />;
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <Bone className="h-8 w-40 mb-2" />
        <Bone className="h-5 w-60" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Bone className="h-28" />
        <Bone className="h-28" />
        <Bone className="h-28" />
      </div>
      <Bone className="h-80" />
    </div>
  );
}

export function HabitsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Bone className="h-8 w-32 mb-2" />
        <Bone className="h-5 w-48" />
      </div>
      <Bone className="h-16" />
      <Bone className="h-12" />
      <div className="space-y-2">
        <Bone className="h-14" />
        <Bone className="h-14" />
        <Bone className="h-14" />
        <Bone className="h-14" />
        <Bone className="h-14" />
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Bone className="h-8 w-32 mb-2" />
        <Bone className="h-5 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Bone className="h-28" />
        <Bone className="h-28" />
        <Bone className="h-28" />
        <Bone className="h-28" />
      </div>
      <Bone className="h-80" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Bone className="h-64" />
        <Bone className="h-64" />
      </div>
    </div>
  );
}
