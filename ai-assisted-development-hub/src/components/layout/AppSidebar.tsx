import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Clock, Users, Settings, FileText,
  BarChart3, UserCircle, LogOut, ChevronRight, Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  adminOnly?: boolean;
  children?: { label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: '工作台', path: '/dashboard' },
  { icon: Clock, label: '考勤打卡', path: '/attendance' },
  { icon: FileText, label: '审批管理', path: '/approval' },
  { icon: Users, label: '人员管理', path: '/employees', adminOnly: true },
  { icon: Building2, label: '部门管理', path: '/departments', adminOnly: true },
  { icon: Settings, label: '考勤规则', path: '/rules', adminOnly: true },
  { icon: BarChart3, label: '统计报表', path: '/reports' },
  { icon: UserCircle, label: '个人中心', path: '/profile' },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visibleItems = menuItems.filter(item => !item.adminOnly || user?.role === 'admin' || user?.role === 'super_admin');

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-out",
        expanded ? "w-52" : "w-16"
      )}
      style={{
        background: 'hsl(var(--sidebar-background))',
        color: 'hsl(var(--sidebar-foreground))',
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => { setExpanded(false); setHoveredItem(null); }}
    >
      {/* Logo区域 */}
      <div className="h-16 flex items-center justify-center border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <Clock className="h-7 w-7 text-sidebar-primary shrink-0" />
          {expanded && (
            <span className="text-base font-semibold whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-200">
              考勤管理
            </span>
          )}
        </div>
      </div>

      {/* 菜单 */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <Tooltip delayDuration={expanded ? 999999 : 200}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredItem(item.path)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {expanded && (
                        <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-150">
                          {item.label}
                        </span>
                      )}
                    </button>
                  </TooltipTrigger>
                  {!expanded && (
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部用户区 */}
      <div className="border-t border-white/10 p-2 shrink-0">
        <div className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
          expanded ? "" : "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center text-xs font-medium shrink-0">
            {user?.name?.charAt(0)}
          </div>
          {expanded && (
            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-200">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/50">{user?.role === 'super_admin' ? '超级管理员' : user?.role === 'admin' ? '管理员' : '员工'}</p>
            </div>
          )}
          {expanded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>退出登录</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
}
