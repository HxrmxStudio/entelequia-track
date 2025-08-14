import React from 'react';
import { BellIcon, UserIcon, SearchIcon } from 'lucide-react';
import { Badge } from '../ui/Badge';
interface HeaderProps {
  title: string;
  subtitle?: string;
}
export const Header = ({
  title,
  subtitle
}: HeaderProps) => {
  return <header className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-64" />
            <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="relative">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 relative">
              <BellIcon size={20} />
              <Badge variant="danger" size="sm" className="absolute -top-1 -right-1">
                3
              </Badge>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900">
                Alex Johnson
              </div>
              <div className="text-xs text-gray-500">Operations Manager</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
              <UserIcon size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>;
};