import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, PackageIcon, TruckIcon, UploadIcon, BarChart2Icon, SettingsIcon, MenuIcon, XIcon, LogOutIcon } from 'lucide-react';
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}
const NavItem = ({
  to,
  icon,
  label,
  isActive
}: NavItemProps) => {
  return <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary-100 text-primary-800 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>;
};
export const Sidebar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [{
    to: '/',
    icon: <LayoutDashboardIcon size={18} />,
    label: 'Dashboard'
  }, {
    to: '/orders',
    icon: <PackageIcon size={18} />,
    label: 'Orders'
  }, {
    to: '/shipments',
    icon: <TruckIcon size={18} />,
    label: 'Shipments'
  }, {
    to: '/import',
    icon: <UploadIcon size={18} />,
    label: 'Import'
  }, {
    to: '/analytics',
    icon: <BarChart2Icon size={18} />,
    label: 'Analytics'
  }, {
    to: '/settings',
    icon: <SettingsIcon size={18} />,
    label: 'Settings'
  }];
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleMobileMenu} className="p-2 rounded-md bg-white shadow-md text-gray-600">
          <MenuIcon size={20} />
        </button>
      </div>
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-40 transform transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-black bg-opacity-25 absolute inset-0" onClick={toggleMobileMenu}></div>
        <div className="bg-white w-64 min-h-screen relative z-10 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="font-bold text-xl text-primary-600">Entelequia</div>
            <button onClick={toggleMobileMenu} className="text-gray-500">
              <XIcon size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {navItems.map(item => <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} isActive={location.pathname === item.to} />)}
          </div>
          <div className="p-4 border-t border-gray-200">
            <button className="flex w-full items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
              <LogOutIcon size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar for desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 bg-white h-screen sticky top-0">
        <div className="p-4 border-b border-gray-200">
          <div className="font-bold text-xl text-primary-600">Entelequia</div>
          <div className="text-xs text-gray-500 mt-1">entelequia-track</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} isActive={location.pathname === item.to} />)}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button className="flex w-full items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
            <LogOutIcon size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>;
};