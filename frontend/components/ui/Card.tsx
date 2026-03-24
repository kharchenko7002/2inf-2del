// c:\projects\kostian_task\frontend\components\ui\Card.tsx

'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  hoverable?: boolean;
}

export default function Card({
  children,
  className = '',
  title,
  subtitle,
  actions,
  padding = 'md',
  hoverable = false,
}: CardProps) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        rounded-xl border shadow-sm
        bg-[var(--bg-card)]
        border-[var(--border-color)]
        ${hoverable ? 'card-hover cursor-pointer' : ''}
        ${paddings[padding]}
        ${className}
      `}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
