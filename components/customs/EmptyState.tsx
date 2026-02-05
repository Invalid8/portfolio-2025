"use client";

import { PlusIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-16 md:py-24 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"></div>
        <div className="relative bg-neutral-800/30 backdrop-blur border border-neutral-700/50 rounded-full p-8">
          {icon || (
            <PlusIcon
              className="w-16 h-16 text-neutral-600"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-neutral-200 mb-2">{title}</h3>
      <p className="text-neutral-400 text-center max-w-md mb-6">
        {description}
      </p>

      {action && <div className="mt-0">{action}</div>}
    </div>
  );
}
