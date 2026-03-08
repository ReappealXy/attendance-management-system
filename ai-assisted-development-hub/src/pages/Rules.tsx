import { useState, useEffect } from 'react';
import { ruleService } from '@/services';
import type { AttendanceRule, LeaveType } from '@/services/types';
import { Clock, Calendar, Plus, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PageTransition, FadeIn } from '@/components/animations/PageTransition';

const Rules = () => {
  const [rules, setRules] = useState<AttendanceRule[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, lt] = await Promise.all([ruleService.listRules(), ruleService.listLeaveTypes()]);
        setRules(r);
        setLeaveTypes(lt);
      } catch { /* handled */ }
      setLoading(false);
    };
    load();
  }, []);

  const handleRuleChange = async (id: string, field: keyof AttendanceRule, value: any) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    try {
      const rule = rules.find(r => r.id === id);
      if (rule) await ruleService.updateRule(id, { ...rule, [field]: value });
    } catch { /* mock fallback already updated local state */ }
    toast({ title: '规则已更新' });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn><h1 className="text-2xl font-bold">考勤规则配置</h1></FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">班次时间设置</h3>
            </div>
            <div className="space-y-4">
              {rules.map(rule => (
                <div key={rule.id} className="flex items-center gap-6 py-3 px-4 rounded-lg bg-muted/50 table-row-hover">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rule.name}</span>
                      {rule.isDefault && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">默认</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">上班</span>
                      <Input type="time" value={rule.clockInTime} onChange={e => handleRuleChange(rule.id, 'clockInTime', e.target.value)} className="w-28 h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">下班</span>
                      <Input type="time" value={rule.clockOutTime} onChange={e => handleRuleChange(rule.id, 'clockOutTime', e.target.value)} className="w-28 h-8" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">迟到阈值</span>
                      <Input type="number" value={rule.lateThreshold} onChange={e => handleRuleChange(rule.id, 'lateThreshold', parseInt(e.target.value))} className="w-20 h-8" />
                      <span className="text-muted-foreground">分钟</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">假期类型管理</h3>
              </div>
              <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />添加类型</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {leaveTypes.map(lt => (
                <div key={lt.id} className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50 table-row-hover">
                  <div>
                    <span className="font-medium">{lt.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">最多{lt.maxDays}天</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">需审批</span>
                      <Switch checked={lt.requireApproval} />
                    </div>
                    <button className="p-1 rounded hover:bg-muted transition-colors">
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
};

export default Rules;
