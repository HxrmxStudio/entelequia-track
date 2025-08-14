import React from 'react';
import { Sidebar } from './Sidebar';
interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
export const Layout = ({
  children,
  title,
  subtitle
}: LayoutProps) => {
  return <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>;
};