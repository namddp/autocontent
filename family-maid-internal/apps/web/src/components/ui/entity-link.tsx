'use client';

// entity-link — clickable entity references: KH, CTV, Ca, Sales
// Renders as an inline link that navigates to the entity detail page

import Link from 'next/link';

type EntityType = 'customer' | 'ctv' | 'case' | 'sales';

interface EntityLinkProps {
  type: EntityType;
  id: string;
  label: string;
  subtitle?: string;
  className?: string;
}

const ENTITY_ROUTES: Record<EntityType, string> = {
  customer: '/crm',
  ctv: '/ctvs',
  case: '/cases',
  sales: '/users',
};

const ENTITY_COLORS: Record<EntityType, string> = {
  customer: 'text-blue-700 hover:text-blue-900',
  ctv: 'text-orange-700 hover:text-orange-900',
  case: 'text-purple-700 hover:text-purple-900',
  sales: 'text-emerald-700 hover:text-emerald-900',
};

export function EntityLink({ type, id, label, subtitle, className = '' }: EntityLinkProps) {
  const href = `${ENTITY_ROUTES[type]}/${id}`;

  return (
    <Link
      href={href as any}
      className={`group inline-flex flex-col ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span className={`text-sm font-medium underline-offset-2 group-hover:underline ${ENTITY_COLORS[type]}`}>
        {label}
      </span>
      {subtitle && (
        <span className="text-xs text-slate-400">{subtitle}</span>
      )}
    </Link>
  );
}
