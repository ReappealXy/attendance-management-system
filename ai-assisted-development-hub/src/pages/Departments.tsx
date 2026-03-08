import { useState, useEffect } from 'react';
import { departmentService } from '@/services';
import type { Department } from '@/services/types';
import { Building2, Plus, Users, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PageTransition, FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/PageTransition';

const Departments = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', manager: '', parentId: '' as string | null });

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentService.list();
      setDepartments(data);
    } catch { /* handled */ }
    setLoading(false);
  };

  useEffect(() => { loadDepartments(); }, []);

  const topLevel = departments.filter(d => !d.parentId);
  const getChildren = (parentId: string) => departments.filter(d => d.parentId === parentId);

  const handleCreate = async () => {
    if (!form.name) {
      toast({ title: '请输入部门名称', variant: 'destructive' });
      return;
    }
    try {
      await departmentService.create({ name: form.name, manager: form.manager, parentId: form.parentId || null });
      toast({ title: '创建成功' });
      setDialogOpen(false);
      setForm({ name: '', manager: '', parentId: '' });
      loadDepartments();
    } catch (e: any) {
      toast({ title: '创建失败', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定删除部门「${name}」吗？`)) return;
    try {
      await departmentService.remove(id);
      toast({ title: '删除成功' });
      loadDepartments();
    } catch (e: any) {
      toast({ title: '删除失败', description: e.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">部门管理</h1>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />新建部门</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>新建部门</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>部门名称 *</Label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>负责人</Label>
                    <Input value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>上级部门（留空为顶级部门）</Label>
                    <Input value={form.parentId || ''} onChange={e => setForm(f => ({ ...f, parentId: e.target.value || null }))} placeholder="输入上级部门ID" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                  <Button onClick={handleCreate}>确认创建</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        <StaggerContainer className="grid gap-4">
          {topLevel.map(dept => {
            const children = getChildren(dept.id);
            return (
              <StaggerItem key={dept.id}>
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{dept.name}</h3>
                        <p className="text-sm text-muted-foreground">负责人：{dept.manager}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />{dept.memberCount}人
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" onClick={() => handleDelete(dept.id, dept.name)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {children.length > 0 && (
                    <div className="mt-3 ml-12 space-y-2">
                      {children.map(child => (
                        <div key={child.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{child.name}</span>
                            <span className="text-xs text-muted-foreground">· {child.manager}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{child.memberCount}人</span>
                            <button className="p-1 rounded hover:bg-muted transition-colors">
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <button className="p-1 rounded hover:bg-destructive/10 transition-colors" onClick={() => handleDelete(child.id, child.name)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </PageTransition>
  );
};

export default Departments;
