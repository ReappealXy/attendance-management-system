import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services';
import { Mail, Phone, Building2, Briefcase, Calendar, Lock, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PageTransition, FadeIn } from '@/components/animations/PageTransition';

const roleLabels: Record<string, string> = {
  super_admin: '超级管理员',
  admin: '系统管理员',
  employee: '普通员工',
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  if (!user) return null;

  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      toast({ title: '请填写完整', variant: 'destructive' });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: '两次密码不一致', variant: 'destructive' });
      return;
    }
    try {
      await authService.changePassword({ oldPassword: oldPwd, newPassword: newPwd, confirmPassword: confirmPwd });
      toast({ title: '密码修改成功' });
      setShowPwdForm(false);
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e: any) {
      toast({ title: '修改失败', description: e.message, variant: 'destructive' });
    }
  };

  const infoItems = [
    { icon: Briefcase, label: '工号', value: user.employeeId },
    { icon: Building2, label: '部门', value: user.department },
    { icon: Briefcase, label: '岗位', value: user.position },
    { icon: Shield, label: '角色', value: roleLabels[user.role] || user.role },
    { icon: Mail, label: '邮箱', value: user.email },
    { icon: Phone, label: '电话', value: user.phone },
    { icon: Calendar, label: '入职日期', value: user.joinDate },
  ];

  return (
    <PageTransition>
      <div className="max-w-2xl space-y-6">
        <FadeIn><h1 className="text-2xl font-bold">个人中心</h1></FadeIn>

        <FadeIn delay={0.1}>
          <div className="glass-card-strong p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">{user.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-muted-foreground">{roleLabels[user.role] || user.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              {infoItems.map(item => (
                <div key={item.label} className="flex items-center gap-3 py-2">
                  <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground w-20">{item.label}</span>
                  <span className="text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">修改密码</h3>
              </div>
              {!showPwdForm && (
                <Button variant="outline" size="sm" onClick={() => setShowPwdForm(true)}>修改</Button>
              )}
            </div>
            {showPwdForm && (
              <div className="space-y-3 max-w-sm">
                <Input type="password" placeholder="当前密码" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
                <Input type="password" placeholder="新密码" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                <Input type="password" placeholder="确认新密码" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                <div className="flex gap-2">
                  <Button onClick={handleChangePwd}>确认修改</Button>
                  <Button variant="outline" onClick={() => setShowPwdForm(false)}>取消</Button>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
};

export default Profile;
