import React from 'react';
interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}
export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  action
}: CardProps) => {
  return <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {(title || action) && <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>}
      <div className="p-4">{children}</div>
    </div>;
};