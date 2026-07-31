import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="p-12 text-center bg-zinc-950/60 border border-white/10 rounded-3xl space-y-6 max-w-lg mx-auto my-8 shadow-2xl backdrop-blur-md">
      <div className="w-16 h-16 mx-auto rounded-3xl bg-brand-red/10 border border-brand-red/30 text-brand-red flex items-center justify-center shadow-inner">
        {icon}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-display font-extrabold uppercase tracking-tight text-white">{title}</h3>
        <p className="text-xs font-mono text-white/60 leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="py-3 px-6 rounded-2xl bg-brand-red hover:bg-brand-red/90 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-xl active:scale-95"
            >
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all border border-white/10 active:scale-95"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
