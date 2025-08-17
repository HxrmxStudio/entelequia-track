interface SidebarUserInfoProps {
  currentUser?: {
    email: string;
    role: string;
  } | null;
  compact?: boolean;
}

export default function SidebarUserInfo({ currentUser, compact = false }: SidebarUserInfoProps) {
  if (!currentUser) return null;

  if (compact) {
    return (
      <div className="px-2 py-3 border-b bg-gray-50 dark:bg-gray-800 flex justify-center">
        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-105">
          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            {currentUser.email.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
      <div className="text-sm text-gray-600 dark:text-gray-300">
        <div className="font-medium">{currentUser.email}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{currentUser.role}</div>
      </div>
    </div>
  );
}
