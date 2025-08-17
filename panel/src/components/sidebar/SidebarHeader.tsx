import AlertsBadge from "@/components/alerts/AlertsBadge";

interface SidebarHeaderProps {
  compact?: boolean;
}

export default function SidebarHeader({ compact = false }: SidebarHeaderProps) {
  if (compact) {
    return (
      <div className="h-14 flex items-center justify-center border-b">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm gradient-animate">
          <span className="text-white font-bold text-sm">E</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-14 flex items-center justify-between px-4 border-b gap-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm gradient-animate">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <div>
          <div className="text-lg font-semibold leading-tight text-gray-900 dark:text-white">Entelequia</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">entelequia-track</div>
        </div>
      </div>
      <div className="ml-auto">
        <AlertsBadge />
      </div>
    </div>
  );
}
