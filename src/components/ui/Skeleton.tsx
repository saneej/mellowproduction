import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "h-4 w-full" }) => {
  return (
    <div
      className={`animate-pulse bg-white/10 rounded-xl ${className}`}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 space-y-4">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-xl" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 w-1/3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 w-full">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  );
};
