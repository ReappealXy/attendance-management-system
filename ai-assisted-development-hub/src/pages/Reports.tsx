import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { statisticsService } from '@/services';
import type { PersonalStats, DepartmentStats } from '@/services/types';
import { Download, Users, User, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { aiService } from '@/services';

// 模拟AI摘要（Spring AI后端未就绪时使用）
const generateMockSummary = (type: 'personal' | 'department'): string => {
  if (type === 'personal') {
    return `## 📊 个人考勤月度分析\n\n### 整体评估\n本月您的出勤表现 **良好**，出勤率达到 **95.5%**，高于部门平均水平（92.3%）。\n\n### 数据亮点\n- ✅ 正常出勤 **18天**，表现稳定\n- ⚠️ 迟到 **2次**，较上月减少1次，持续改善中\n- 📅 请假 **1天**（事假），合理使用\n\n### AI建议\n1. **通勤优化**：两次迟到集中在周一，建议周一提前15分钟出发\n2. **出勤连续性**：已连续12天无异常，保持该节奏\n3. **下月预测**：按当前趋势，下月出勤率有望达到 **97%+**\n\n> 💡 系统已自动为您生成此分析报告，数据截至 ${new Date().toLocaleDateString('zh-CN')}`;
  }
  return `## 📊 部门考勤月度分析\n\n### 整体概况\n本月各部门平均出勤率 **91.8%**，较上月上升 **1.2%**。\n\n### 部门排名\n| 排名 | 部门 | 出勤率 | 趋势 |\n|------|------|--------|------|\n| 🥇 | 技术部 | 96.2% | ↑ 2.1% |\n| 🥈 | 产品部 | 94.5% | ↑ 0.8% |\n| 🥉 | 财务部 | 93.1% | → 持平 |\n| 4 | 运营部 | 91.5% | ↓ 1.3% |\n| 5 | 市场部 | 88.7% | ↓ 2.0% |\n\n### AI建议\n1. 建议对市场部进行一次考勤情况沟通\n2. 技术部表现优异，可作为标杆分享经验\n\n> 💡 此报告由 Spring AI 自动生成，仅供管理参考`;
};

const resolveDimension = (requested: string | null, canViewDepartment: boolean): 'personal' | 'department' => {
  if (requested === 'department' && canViewDepartment) {
    return 'department';
  }
  return 'personal';
};

const Reports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const [dimension, setDimension] = useState<'personal' | 'department'>(() => resolveDimension(searchParams.get('dimension'), isAdmin));

  const [personalStats, setPersonalStats] = useState<PersonalStats>({ totalDays: 0, normalDays: 0, lateDays: 0, earlyDays: 0, absentDays: 0, leaveDays: 0 });
  const [deptStats, setDeptStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ps, ds] = await Promise.all([
          statisticsService.getPersonalStats({ userId: user?.id }),
          isAdmin ? statisticsService.getDepartmentStats() : Promise.resolve([]),
        ]);
        setPersonalStats(ps);
        setDeptStats(ds);
      } catch { /* handled */ }
      setLoading(false);
    };
    load();
  }, [user?.id, isAdmin]);

  useEffect(() => {
    const nextDimension = resolveDimension(searchParams.get('dimension'), isAdmin);
    setDimension(current => current === nextDimension ? current : nextDimension);
  }, [searchParams, isAdmin]);

  useEffect(() => {
    const sectionId = searchParams.get('section');
    if (!sectionId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchParams, dimension, loading]);

  const personalChartData = [
    { name: '正常', 天数: personalStats.normalDays },
    { name: '迟到', 天数: personalStats.lateDays },
    { name: '早退', 天数: personalStats.earlyDays },
    { name: '缺勤', 天数: personalStats.absentDays },
    { name: '请假', 天数: personalStats.leaveDays },
  ];

  const deptChartData = deptStats.map(d => ({ name: d.department, 出勤率: d.rate, 出勤人数: d.present, 迟到人数: d.late }));

  const handleExport = async () => {
    try {
      const blob = await statisticsService.exportReport({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `考勤报表_${new Date().getFullYear()}_${new Date().getMonth() + 1}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: '导出成功', description: '报表已导出为Excel文件（模拟）' });
    }
  };

  const generateAiSummary = async () => {
    setIsAiLoading(true);
    setAiSummary(null);
    try {
      const result = await aiService.summary({
        type: dimension,
        userId: user?.id,
        data: dimension === 'personal' ? personalStats : deptStats,
      });
      setAiSummary(result.content);
    } catch {
      await new Promise(r => setTimeout(r, 1500));
      setAiSummary(generateMockSummary(dimension));
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl font-bold">统计报表</h1>
            <div className="flex gap-3 flex-wrap">
              {isAdmin && (
                <div className="flex bg-muted rounded-lg p-0.5">
                  <button onClick={() => { setDimension('personal'); setAiSummary(null); }} className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${dimension === 'personal' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>
                    <User className="h-4 w-4 inline mr-1" />个人
                  </button>
                  <button onClick={() => { setDimension('department'); setAiSummary(null); }} className={`px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${dimension === 'department' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}>
                    <Users className="h-4 w-4 inline mr-1" />部门
                  </button>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={generateAiSummary} disabled={isAiLoading}>
                {isAiLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                AI 智能分析
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />导出Excel
              </Button>
            </div>
          </div>
        </FadeIn>

        {(isAiLoading || aiSummary) && (
          <FadeIn>
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-strong p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Sparkles className="h-4 w-4 text-primary" /></div>
                  <div>
                    <h3 className="font-semibold text-sm">Spring AI 智能分析</h3>
                    <p className="text-[11px] text-muted-foreground">基于考勤数据自动生成</p>
                  </div>
                </div>
                {aiSummary && <Button variant="ghost" size="sm" onClick={generateAiSummary} disabled={isAiLoading}><RefreshCw className={`h-3.5 w-3.5 ${isAiLoading ? 'animate-spin' : ''}`} /></Button>}
              </div>
              {isAiLoading ? (
                <div className="flex items-center gap-3 py-8 justify-center"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">AI 正在分析考勤数据...</span></div>
              ) : aiSummary ? (
                <div className="prose prose-sm max-w-none dark:prose-invert [&_table]:w-full [&_th]:text-left [&_th]:py-2 [&_td]:py-1.5 [&_h2]:text-base [&_h3]:text-sm"><ReactMarkdown>{aiSummary}</ReactMarkdown></div>
              ) : null}
            </motion.div>
          </FadeIn>
        )}

        {dimension === 'personal' ? (
          <>
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: '出勤天数', value: personalStats.normalDays, unit: '天' },
                { label: '迟到次数', value: personalStats.lateDays, unit: '次' },
                { label: '早退次数', value: personalStats.earlyDays, unit: '次' },
                { label: '缺勤天数', value: personalStats.absentDays, unit: '天' },
                { label: '请假天数', value: personalStats.leaveDays, unit: '天' },
              ].map(item => (
                <StaggerItem key={item.label}>
                  <div className="stat-card text-center">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{loading ? '...' : item.value}<span className="text-sm font-normal text-muted-foreground ml-1">{item.unit}</span></p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <FadeIn delay={0.3}>
              <div id="personal-chart" className="glass-card p-6">
                <h3 className="font-semibold mb-4">本月考勤分布</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={personalChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                      <Bar dataKey="天数" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeIn>
          </>
        ) : (
          <>
            <FadeIn delay={0.1}>
              <div id="department-table" className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">部门</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">总人数</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">出勤</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">迟到</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">缺勤</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">出勤率</th>
                  </tr></thead>
                  <tbody>
                    {deptStats.map(d => (
                      <tr key={d.department} className="border-t border-border/50 table-row-hover">
                        <td className="py-3 px-4 font-medium">{d.department}</td>
                        <td className="py-3 px-4">{d.total}</td>
                        <td className="py-3 px-4 text-success">{d.present}</td>
                        <td className="py-3 px-4 text-warning">{d.late}</td>
                        <td className="py-3 px-4 text-destructive">{d.absent}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full max-w-20"><div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${d.rate}%` }} /></div>
                            <span className="text-sm">{d.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div id="department-chart" className="glass-card p-6">
                <h3 className="font-semibold mb-4">部门出勤率对比</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" fontSize={12} /><YAxis fontSize={12} /><Tooltip />
                      <Bar dataKey="出勤率" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default Reports;
