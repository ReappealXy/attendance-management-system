import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService } from '@/services';
import type { LeaveRequest } from '@/services/types';
import { FileText, Plus, Check, X, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PageTransition, FadeIn } from '@/components/animations/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

const typeLabels: Record<string, string> = {
  annual: '年假', sick: '病假', personal: '事假',
  compensatory: '调休', overtime: '加班', business: '出差',
};

const statusLabels: Record<string, { text: string; cls: string }> = {
  pending: { text: '待审批', cls: 'bg-warning/10 text-warning' },
  approved: { text: '已通过', cls: 'bg-success/10 text-success' },
  rejected: { text: '已驳回', cls: 'bg-destructive/10 text-destructive' },
};

const Approval = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filter, setFilter] = useState<string>(searchParams.get('filter') || 'all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  useEffect(() => {
    const nextFilter = searchParams.get('filter') || 'all';
    setFilter(current => current === nextFilter ? current : nextFilter);
  }, [searchParams]);

  useEffect(() => {
    const sectionId = searchParams.get('section');
    if (!sectionId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [searchParams, filter, loading]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const result = await leaveService.list({ status: filter !== 'all' ? filter : undefined });
      let records = result.records;
      // 非管理员只看自己的
      if (!isAdmin) {
        records = records.filter(r => r.userId === user?.id);
      }
      setRequests(records);
    } catch { /* handled */ }
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, [filter]);

  const handleSubmit = async () => {
    if (!startDate || !endDate || !reason.trim()) {
      toast({ title: '请填写完整信息', variant: 'destructive' });
      return;
    }
    try {
      await leaveService.create({ type: newType, startDate, endDate, reason });
      toast({ title: '申请提交成功' });
      setDialogOpen(false);
      setStartDate(''); setEndDate(''); setReason('');
      loadRequests();
    } catch (e: any) {
      // mock fallback: 本地添加
      const newReq: LeaveRequest = {
        id: 'lr-' + Date.now(),
        userId: user!.id,
        userName: user!.name,
        department: user!.department,
        type: newType as LeaveRequest['type'],
        startDate, endDate, reason,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRequests(prev => [newReq, ...prev]);
      setDialogOpen(false);
      setStartDate(''); setEndDate(''); setReason('');
      toast({ title: '申请提交成功' });
    }
  };

  const handleApprove = async (id: string, approved: boolean) => {
    try {
      if (approved) {
        await leaveService.approve(id);
      } else {
        await leaveService.reject(id);
      }
      toast({ title: approved ? '已批准' : '已驳回' });
      loadRequests();
    } catch {
      // mock fallback
      setRequests(prev => prev.map(r =>
        r.id === id ? { ...r, status: approved ? 'approved' : 'rejected', approverComment: approved ? '同意' : '不符合条件' } : r
      ));
      toast({ title: approved ? '已批准' : '已驳回' });
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">审批管理</h1>
            {!isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />发起申请</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>发起申请</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium">申请类型</label>
                      <Select value={newType} onValueChange={setNewType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(typeLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium">开始日期</label>
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">结束日期</label>
                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">申请理由</label>
                      <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="请输入申请理由" />
                    </div>
                    <Button onClick={handleSubmit} className="w-full">提交申请</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                  filter === s ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {s === 'all' ? '全部' : statusLabels[s].text}
              </button>
            ))}
          </div>
        </FadeIn>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              id="approval-list"
              key={filter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {requests.map((req, i) => {
                const st = statusLabels[req.status];
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="glass-card p-5 flex items-start justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{req.userName}</span>
                          <span className="text-xs text-muted-foreground">{req.department}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${st.cls}`}>{st.text}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {typeLabels[req.type] || req.type} · {req.startDate} ~ {req.endDate}
                        </p>
                        <p className="text-sm mt-1">{req.reason}</p>
                        {req.approverComment && (
                          <p className="text-xs text-muted-foreground mt-1">审批意见：{req.approverComment}</p>
                        )}
                      </div>
                    </div>
                    {isAdmin && req.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => handleApprove(req.id, true)}>
                          <Check className="h-4 w-4 mr-1" />通过
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleApprove(req.id, false)}>
                          <X className="h-4 w-4 mr-1" />驳回
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
              {requests.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">暂无申请记录</div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </PageTransition>
  );
};

export default Approval;
