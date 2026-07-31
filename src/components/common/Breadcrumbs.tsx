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
    <nav className="flex items-center gap-2 font-mono text-xs text-white/50 overflow-x-auto py-2 scrollbar-none">
      <Link 
        to="/" 
        className="hover:text-white transition-colors flex items-center gap-1 flex-shrink-0"
        title="Home"
      >
        <Home size={13} className="text-brand-red" />
      </Link>

      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={12} className="text-white/20 flex-shrink-0" />
          {item.url && idx < items.length - 1 ? (
            <Link 
              to={item.url} 
              className="hover:text-white transition-colors truncate max-w-[150px] flex-shrink-0"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-white font-semibold truncate max-w-[200px] flex-shrink-0">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
