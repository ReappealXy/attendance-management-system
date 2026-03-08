import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { AIAssistant } from '@/components/AIAssistant';

export function AppLayout() {
  const { user, switchRole } = useAuth();

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 ml-16">
        {/* 顶栏 */}
        <header className="h-14 glass-card-strong sticky top-0 z-40 flex items-center justify-between px-6 border-b border-border/50 rounded-none">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={switchRole}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              切换为{user?.role === 'admin' ? '员工' : '管理员'}
            </button>
            <div className="text-sm text-muted-foreground">
              {user?.department} · {user?.position}
            </div>
          </div>
        </header>
        {/* 内容区 */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      {/* AI 考勤助手 */}
      <AIAssistant />
    </div>
  );
}
