import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Clock, Users, AlertTriangle, CheckCircle,
  FileText, ArrowRight, CalendarDays,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { statisticsService, leaveService, attendanceService } from '@/services';
import type { DepartmentStats } from '@/services/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';
import { PageTransition, StaggerContainer, StaggerItem, FadeIn } from '@/components/animations/PageTransition';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin' || user.role === 'super_admin') return <AdminDashboard />;
  return <EmployeeDashboard userId={user.id} />;
};

function EmployeeDashboard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ normalDays: 0, lateDays: 0, earlyDays: 0, absentDays: 0, leaveDays: 0, totalDays: 0 });
  const [todayStatus, setTodayStatus] = useState<{ hasClockedIn: boolean; clockInTime?: string; clockOutTime?: string }>({ hasClockedIn: false });
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, t, lr] = await Promise.all([
          statisticsService.getPersonalStats({ userId }),
          attendanceService.getToday(),
          leaveService.list({ status: 'pending', userId }),
        ]);
        setStats(s);
        setTodayStatus(t);
        setPendingCount(lr.records.length);
      } catch { /* handled by fallback */ }
      setLoading(false);
    };
    load();
  }, [userId]);

  const statCards = [
    {
      icon: CalendarDays,
      label: '本月出勤',
      value: `${stats.normalDays}天`,
      color: 'text-primary',
      onClick: () => navigate('/reports?dimension=personal&section=personal-chart'),
    },
    {
      icon: AlertTriangle,
      label: '迟到次数',
      value: `${stats.lateDays}次`,
      color: 'text-warning',
      onClick: () => navigate('/reports?dimension=personal&section=personal-chart'),
    },
    {
      icon: Clock,
      label: '早退次数',
      value: `${stats.earlyDays}次`,
      color: 'text-warning',
      onClick: () => navigate('/reports?dimension=personal&section=personal-chart'),
    },
    {
      icon: FileText,
      label: '待处理申请',
      value: `${pendingCount}条`,
      color: 'text-primary',
      onClick: () => navigate('/approval?filter=pending&section=approval-list'),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <h1 className="text-2xl font-bold text-foreground">工作台</h1>
          <p className="text-muted-foreground mt-1">祝你工作愉快 👋</p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">今日考勤状态</p>
              <p className="text-lg font-semibold mt-1">
                {todayStatus.hasClockedIn ? `已签到 ${todayStatus.clockInTime || ''}` : '尚未签到'}
              </p>
              {todayStatus.clockOutTime && (
                <p className="text-sm text-muted-foreground">签退 {todayStatus.clockOutTime}</p>
              )}
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 btn-pulse"
            >
              <Clock className="h-5 w-5" />
              去打卡
            </button>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <StaggerItem key={card.label}>
              <button
                type="button"
                onClick={card.onClick}
                className="stat-card w-full text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-bold">{loading ? '...' : card.value}</p>
                  </div>
                </div>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);
  const [dashboard, setDashboard] = useState({ todayPresent: 0, todayAbsent: 0, todayLate: 0, pendingApprovals: 0, totalEmployees: 400 });
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ds, db, lr] = await Promise.all([
          statisticsService.getDepartmentStats(),
          statisticsService.getDashboard(),
          leaveService.list({ status: 'pending' }),
        ]);
        setDeptStats(ds);
        setDashboard({
          todayPresent: db.todayPresent || 0,
          todayAbsent: db.todayAbsent || 0,
          todayLate: db.todayLate || 0,
          pendingApprovals: db.pendingApprovals || lr.records.length,
          totalEmployees: db.totalEmployees || 400,
        });
        setPendingApprovals(lr.records.filter(r => r.status === 'pending').slice(0, 5));
      } catch { /* handled */ }
      setLoading(false);
    };
    load();
  }, []);

  const summaryCards = [
    {
      icon: Users,
      label: '今日出勤',
      value: `${dashboard.todayPresent}/${dashboard.totalEmployees}`,
      sub: '人',
      color: 'text-primary',
      onClick: () => navigate('/reports?dimension=department&section=department-table'),
    },
    {
      icon: CheckCircle,
      label: '出勤率',
      value: dashboard.totalEmployees > 0 ? `${Math.round((dashboard.todayPresent / dashboard.totalEmployees) * 100)}%` : '-',
      sub: '',
      color: 'text-success',
      onClick: () => navigate('/reports?dimension=department&section=department-chart'),
    },
    {
      icon: AlertTriangle,
      label: '异常打卡',
      value: `${dashboard.todayLate}`,
      sub: '人',
      color: 'text-warning',
      onClick: () => navigate('/reports?dimension=department&section=department-table'),
    },
    {
      icon: FileText,
      label: '待审批',
      value: `${dashboard.pendingApprovals}`,
      sub: '条',
      color: 'text-destructive',
      onClick: () => navigate('/approval?filter=pending&section=approval-list'),
    },
  ];

  const chartData = deptStats.map(d => ({
    name: d.department,
    出勤: d.present,
    迟到: d.late,
    缺勤: d.absent,
  }));

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { annual: '年假', sick: '病假', personal: '事假', overtime: '加班', business: '出差', compensatory: '调休' };
    return map[t] || t;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <h1 className="text-2xl font-bold text-foreground">管理工作台</h1>
          <p className="text-muted-foreground mt-1">全局概览</p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map(card => (
            <StaggerItem key={card.label}>
              <button
                type="button"
                onClick={card.onClick}
                className="stat-card w-full text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-muted ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{card.label}</p>
                    <p className="text-xl font-bold">
                      {loading ? '...' : card.value}
                      <span className="text-sm font-normal text-muted-foreground ml-1">{card.sub}</span>
                    </p>
                  </div>
                </div>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid lg:grid-cols-3 gap-6">
          <FadeIn delay={0.2} className="lg:col-span-2">
            <div id="department-chart" className="glass-card p-6">
              <h3 className="font-semibold mb-4">部门出勤概览</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <RTooltip />
                    <Bar dataKey="出勤" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="迟到" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="缺勤" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div id="pending-approvals" className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">待审批</h3>
                <button onClick={() => navigate('/approval?filter=pending&section=approval-list')} className="text-xs text-primary flex items-center gap-1 hover:underline">
                  查看全部 <ArrowRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-3">
                {pendingApprovals.map(req => (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => navigate('/approval?filter=pending&section=approval-list')}
                    className="flex w-full items-center justify-between py-2 border-b border-border/50 last:border-0 table-row-hover rounded px-1 -mx-1 text-left"
                  >
                    <div>
                      <p className="text-sm font-medium">{req.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabel(req.type)} · {req.startDate}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">待审批</span>
                  </button>
                ))}
                {pendingApprovals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">暂无待审批申请</p>
                )}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}

export default Dashboard;
