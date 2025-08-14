import React from 'react';
type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';
type BadgeSize = 'sm' | 'md';
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}: BadgeProps) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800'
  };
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5'
  };
  return <span className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>;
};