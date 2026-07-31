import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home, Folder } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 font-mono text-xs text-zinc-500 overflow-x-auto py-2 scrollbar-none">
      <Link 
        to="/" 
        className="hover:text-brand-red transition-colors flex items-center gap-1 flex-shrink-0"
        title="Home"
      >
        <Home size={13} className="text-brand-red" />
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} className="text-zinc-300 flex-shrink-0" />
          {item.url && idx < items.length - 1 ? (
            <Link 
              to={item.url} 
              className="hover:text-brand-red transition-colors truncate max-w-[150px] flex-shrink-0 font-medium text-zinc-600"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-900 font-bold truncate max-w-[200px] flex-shrink-0">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
