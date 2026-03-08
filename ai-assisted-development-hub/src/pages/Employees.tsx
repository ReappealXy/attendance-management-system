import { useState, useEffect } from 'react';
import { employeeService, departmentService } from '@/services';
import type { User } from '@/services/types';
import { Search, Plus, Edit2, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PageTransition, FadeIn } from '@/components/animations/PageTransition';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const PAGE_SIZE = 15;
const EMPTY_DEPARTMENT_VALUE = '__none__';

type EmployeeForm = {
  username: string;
  name: string;
  password: string;
  department: string;
  position: string;
  phone: string;
  email: string;
  role: User['role'];
};

const createInitialForm = (): EmployeeForm => ({
  username: '',
  name: '',
  password: '',
  department: EMPTY_DEPARTMENT_VALUE,
  position: '',
  phone: '',
  email: '',
  role: 'employee',
});

const createEmptyEditForm = (): EmployeeForm => ({
  username: '',
  name: '',
  password: '',
  department: EMPTY_DEPARTMENT_VALUE,
  position: '',
  phone: '',
  email: '',
  role: 'employee',
});

const createEditForm = (employee: User): EmployeeForm => ({
  username: employee.username,
  name: employee.name || '',
  password: '',
  department: employee.department || EMPTY_DEPARTMENT_VALUE,
  position: employee.position || '',
  phone: employee.phone || '',
  email: employee.email || '',
  role: employee.role,
});

const Employees = () => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [employees, setEmployees] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<string[]>([]);

  // 新增员工弹窗
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(createInitialForm);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EmployeeForm>(createEmptyEditForm);

  const isSuperAdmin = currentUser?.role === 'super_admin';
  const isAdmin = isSuperAdmin || currentUser?.role === 'admin';

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const result = await employeeService.list({ page, pageSize: PAGE_SIZE, keyword: search || undefined, department: deptFilter !== 'all' ? deptFilter : undefined });
      setEmployees(result.records);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch { /* fallback handled in service */ }
    setLoading(false);
  };

  const loadDepartments = async () => {
    try {
      const depts = await departmentService.list();
      setDepartments(depts.filter(d => !d.parentId).map(d => d.name));
    } catch { /* ignore */ }
  };

  useEffect(() => { loadDepartments(); }, []);
  useEffect(() => { loadEmployees(); }, [page, search, deptFilter]);

  const handleCreate = async () => {
    if (!form.username || !form.name) {
      toast({ title: '请填写用户名和姓名', variant: 'destructive' });
      return;
    }
    if (!form.password.trim()) {
      toast({ title: '请填写初始密码', variant: 'destructive' });
      return;
    }
    if (form.password.trim().length < 6) {
      toast({ title: '初始密码至少 6 位', variant: 'destructive' });
      return;
    }
    try {
      await employeeService.create({
        ...form,
        password: form.password.trim(),
        department: form.department === EMPTY_DEPARTMENT_VALUE ? '' : form.department,
      });
      toast({ title: '添加成功' });
      setDialogOpen(false);
      setForm(createInitialForm());
      loadEmployees();
    } catch (e: any) {
      toast({ title: '添加失败', description: e.message, variant: 'destructive' });
    }
  };

  const canEditEmployee = (employee: User) => employee.role !== 'super_admin' || isSuperAdmin;

  const canDeleteEmployee = (employee: User) => {
    if (employee.id === currentUser?.id) return false;
    if (employee.role === 'super_admin') return isSuperAdmin;
    if (employee.role === 'admin') return isSuperAdmin;
    return true;
  };

  const resetEditDialog = () => {
    setEditDialogOpen(false);
    setEditingEmployee(null);
    setEditForm(createEmptyEditForm());
  };

  const openEditDialog = (employee: User) => {
    if (!canEditEmployee(employee)) return;
    setEditingEmployee(employee);
    setEditForm(createEditForm(employee));
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingEmployee) return;
    if (!editForm.name.trim()) {
      toast({ title: '请填写姓名', variant: 'destructive' });
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      toast({ title: '新密码至少 6 位', variant: 'destructive' });
      return;
    }

    const payload: Partial<User> & { password?: string } = {
      name: editForm.name.trim(),
      department: editForm.department === EMPTY_DEPARTMENT_VALUE ? '' : editForm.department,
      position: editForm.position.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
    };

    if (editForm.password.trim()) {
      payload.password = editForm.password.trim();
    }
    if (isSuperAdmin && editingEmployee.role !== 'super_admin' && editForm.role !== editingEmployee.role) {
      payload.role = editForm.role;
    }

    try {
      await employeeService.update(editingEmployee.id, payload);
      toast({
        title: payload.password ? '修改成功，登录密码已重置' : '修改成功',
      });
      resetEditDialog();
      loadEmployees();
    } catch (e: any) {
      toast({ title: '修改失败', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除员工 ${name} 吗？`)) return;
    try {
      await employeeService.remove(id);
      toast({ title: '删除成功' });
      loadEmployees();
    } catch (e: any) {
      toast({ title: '删除失败', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">人员管理</h1>
              <p className="text-sm text-muted-foreground mt-1">共 {total} 名员工</p>
            </div>
            <Dialog
              open={dialogOpen}
              onOpenChange={open => {
                setDialogOpen(open);
                if (!open) {
                  setForm(createInitialForm());
                }
              }}
            >
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />添加员工</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>添加员工</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>用户名 *</Label>
                      <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>姓名 *</Label>
                      <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>部门</Label>
                      <Select value={form.department} onValueChange={v => setForm(f => ({ ...f, department: v }))}>
                        <SelectTrigger><SelectValue placeholder="选择部门" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={EMPTY_DEPARTMENT_VALUE}>未分配</SelectItem>
                          {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>岗位</Label>
                      <Input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>电话</Label>
                      <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>邮箱</Label>
                      <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>初始密码 *</Label>
                      <Input
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="请手动设置初始密码"
                      />
                    </div>
                    {isSuperAdmin && (
                      <div className="grid gap-2">
                        <Label>角色</Label>
                        <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as User['role'] }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">普通员工</SelectItem>
                            <SelectItem value="admin">管理员</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setForm(createInitialForm());
                    }}
                  >
                    取消
                  </Button>
                  <Button onClick={handleCreate}>确认添加</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="搜索姓名、工号或电话"
                className="pl-10"
              />
            </div>
            <Select value={deptFilter} onValueChange={v => { setDeptFilter(v); setPage(1); }}>
              <SelectTrigger className="w-36"><SelectValue placeholder="全部部门" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部部门</SelectItem>
                {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">工号</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">姓名</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">部门</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">岗位</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">角色</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">入职日期</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">联系方式</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-t border-border/50 table-row-hover"
                      >
                        <td className="py-3 px-4 font-mono text-xs">{u.employeeId}</td>
                        <td className="py-3 px-4 font-medium">{u.name}</td>
                        <td className="py-3 px-4">{u.department}</td>
                        <td className="py-3 px-4">{u.position}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            u.role === 'super_admin' ? 'bg-destructive/10 text-destructive' :
                            u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {u.role === 'super_admin' ? '超管' : u.role === 'admin' ? '管理员' : '员工'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{u.joinDate}</td>
                        <td className="py-3 px-4 text-muted-foreground">{u.phone}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <button
                              className="p-1.5 rounded-md hover:bg-muted transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                              onClick={() => openEditDialog(u)}
                              disabled={!canEditEmployee(u)}
                              title={canEditEmployee(u) ? '编辑员工' : '仅超级管理员可编辑超级管理员'}
                            >
                              <Edit2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button
                              className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                              onClick={() => handleDelete(u.id, u.name)}
                              disabled={!canDeleteEmployee(u)}
                              title={canDeleteEmployee(u) ? '删除员工' : '当前账号无权删除该员工'}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                  <p className="text-sm text-muted-foreground">
                    第 {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} 条，共 {total} 条
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const p = page <= 3 ? i + 1 : page + i - 2;
                      if (p < 1 || p > totalPages) return null;
                      return (
                        <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(p)} className="w-8">
                          {p}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </FadeIn>

        <Dialog open={editDialogOpen} onOpenChange={open => { if (!open) resetEditDialog(); else setEditDialogOpen(true); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>编辑员工</DialogTitle></DialogHeader>
            {editingEmployee && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>用户名</Label>
                    <Input value={editForm.username} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label>姓名 *</Label>
                    <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>部门</Label>
                    <Select value={editForm.department} onValueChange={v => setEditForm(f => ({ ...f, department: v }))}>
                      <SelectTrigger><SelectValue placeholder="选择部门" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_DEPARTMENT_VALUE}>未分配</SelectItem>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>岗位</Label>
                    <Input value={editForm.position} onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>电话</Label>
                    <Input value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>邮箱</Label>
                    <Input value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {isSuperAdmin && editingEmployee.role !== 'super_admin' ? (
                    <div className="grid gap-2">
                      <Label>角色</Label>
                      <Select value={editForm.role} onValueChange={v => setEditForm(f => ({ ...f, role: v as User['role'] }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">普通员工</SelectItem>
                          <SelectItem value="admin">管理员</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label>角色</Label>
                      <Input
                        value={editingEmployee.role === 'super_admin' ? '超级管理员' : editingEmployee.role === 'admin' ? '管理员' : '普通员工'}
                        disabled
                      />
                    </div>
                  )}

                  {isAdmin && (
                    <div className="grid gap-2">
                      <Label>重置登录密码</Label>
                      <Input
                        type="password"
                        value={editForm.password}
                        onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="留空则不修改"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={resetEditDialog}>取消</Button>
              <Button onClick={handleUpdate} disabled={!editingEmployee}>保存修改</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Employees;
