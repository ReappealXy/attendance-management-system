import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, Wifi, WifiOff, MapPin, Navigation, AlertTriangle, Shield, Settings, Save } from 'lucide-react';
import { attendanceService } from '@/services';
import type { AttendanceRecord } from '@/services/types';
import { useToast } from '@/hooks/use-toast';
import { PageTransition, FadeIn } from '@/components/animations/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// ==================== 公司位置配置 ====================
const DEFAULT_COMPANY_LOCATION = {
  lat: 29.5647,
  lng: 106.2965,
  name: '重庆人文科技学院',
  radius: 500,
};

function getCompanyLocation() {
  const saved = localStorage.getItem('company_location');
  if (saved) {
    try { return JSON.parse(saved); } catch { /* ignore */ }
  }
  return DEFAULT_COMPANY_LOCATION;
}

// 计算两个坐标之间的距离（米）
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==================== 地图组件 ====================
interface LocationMapProps {
  userLat: number | null;
  userLng: number | null;
  companyLat: number;
  companyLng: number;
  radius: number;
  isInRange: boolean;
}

function LocationMap({ userLat, userLng, companyLat, companyLng, radius, isInRange }: LocationMapProps) {
  const mapSize = 280;
  const center = { x: mapSize / 2, y: mapSize / 2 };
  
  // 将经纬度映射到SVG坐标
  const scale = mapSize / (radius * 4 / 111000); // 大致的度数转换
  const userX = userLat && userLng ? center.x + (userLng - companyLng) * 111000 * Math.cos(companyLat * Math.PI / 180) / (radius * 4) * mapSize : null;
  const userY = userLat ? center.y - (userLat - companyLat) * 111000 / (radius * 4) * mapSize : null;
  
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto">
      <svg viewBox={`0 0 ${mapSize} ${mapSize}`} className="w-full h-full">
        {/* 背景网格 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.5" />
          </pattern>
          <radialGradient id="rangeGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isInRange ? 'hsl(var(--success))' : 'hsl(var(--warning))'} stopOpacity="0.08" />
            <stop offset="70%" stopColor={isInRange ? 'hsl(var(--success))' : 'hsl(var(--warning))'} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isInRange ? 'hsl(var(--success))' : 'hsl(var(--warning))'} stopOpacity="0.03" />
          </radialGradient>
        </defs>
        <rect width={mapSize} height={mapSize} fill="url(#grid)" rx="12" />
        
        {/* 打卡范围圆 */}
        <circle cx={center.x} cy={center.y} r={mapSize * 0.35} fill="url(#rangeGradient)"
          stroke={isInRange ? 'hsl(var(--success))' : 'hsl(var(--warning))'} strokeWidth="1.5" strokeDasharray="6 3" opacity="0.8" />
        
        {/* 范围标注 */}
        <text x={center.x} y={center.y + mapSize * 0.35 + 14} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))" opacity="0.7">
          {radius}m 打卡范围
        </text>
        
        {/* 公司位置 */}
        <circle cx={center.x} cy={center.y} r="6" fill="hsl(var(--primary))" />
        <circle cx={center.x} cy={center.y} r="10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.3">
          <animate attributeName="r" from="10" to="20" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x={center.x} y={center.y - 16} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" fontWeight="600">
          📍 公司
        </text>
        
        {/* 用户位置 */}
        {userX !== null && userY !== null && (
          <>
            <line x1={center.x} y1={center.y} x2={userX} y2={userY}
              stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx={userX} cy={userY} r="5" fill={isInRange ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} />
            <circle cx={userX} cy={userY} r="8" fill="none" stroke={isInRange ? 'hsl(var(--success))' : 'hsl(var(--destructive))'} strokeWidth="1.5" opacity="0.4">
              <animate attributeName="r" from="8" to="15" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <text x={userX} y={userY - 12} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" fontWeight="500">
              📱 我
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

// ==================== 考勤打卡页面 ====================

const Attendance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockedOut, setClockedOut] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // 公司位置（管理员可配置）
  const [companyLocation, setCompanyLocation] = useState(getCompanyLocation);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(companyLocation);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // GPS 定位状态
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isInRange, setIsInRange] = useState(false);
  const [clockInLocation, setClockInLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clockOutLocation, setClockOutLocation] = useState<{ lat: number; lng: number } | null>(null);

  const saveCompanyLocation = () => {
    const loc = {
      lat: Number(settingsForm.lat),
      lng: Number(settingsForm.lng),
      name: settingsForm.name,
      radius: Number(settingsForm.radius),
    };
    localStorage.setItem('company_location', JSON.stringify(loc));
    setCompanyLocation(loc);
    setShowLocationSettings(false);
    toast({ title: '保存成功', description: `公司位置已更新为：${loc.name}` });
    // 重新定位计算距离
    if (userLocation) {
      const dist = getDistance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
      setDistance(Math.round(dist));
      setIsInRange(dist <= loc.radius);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  // 获取GPS位置
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持定位功能');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });
        const dist = getDistance(lat, lng, companyLocation.lat, companyLocation.lng);
        setDistance(Math.round(dist));
        setIsInRange(dist <= companyLocation.radius);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError('定位权限被拒绝，请在浏览器设置中允许定位');
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError('无法获取位置信息');
            break;
          case err.TIMEOUT:
            setLocationError('定位超时，请重试');
            break;
          default:
            setLocationError('定位失败，请重试');
        }
        // 演示模式：模拟在范围内
        const mockLat = companyLocation.lat + (Math.random() - 0.5) * 0.003;
        const mockLng = companyLocation.lng + (Math.random() - 0.5) * 0.003;
        setUserLocation({ lat: mockLat, lng: mockLng });
        const dist = getDistance(mockLat, mockLng, companyLocation.lat, companyLocation.lng);
        setDistance(Math.round(dist));
        setIsInRange(dist <= companyLocation.radius);
        setLocationError('定位失败，已使用模拟位置（演示模式）');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [companyLocation]);

  // 页面加载时自动定位
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (d: Date) =>
    d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const handleClockIn = () => {
    if (!isInRange && !locationError?.includes('模拟')) {
      toast({ title: '打卡失败', description: `您不在打卡范围内（距离公司${distance}米，需${companyLocation.radius}米以内）`, variant: 'destructive' });
      return;
    }
    const time = formatTime(currentTime);
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    setClockedIn(true);
    setClockInTime(time);
    setClockInLocation(userLocation);
    const isLate = hour > 9 || (hour === 9 && minute > 15);
    if (!isOnline) {
      localStorage.setItem('offline_clockin', JSON.stringify({ time, date: new Date().toISOString(), location: userLocation }));
      toast({ title: '离线打卡成功', description: '数据已暂存本地，联网后将自动同步' });
    } else {
      toast({
        title: isLate ? '签到成功（迟到）' : '签到成功',
        description: `签到时间：${time} | 位置已记录`,
        variant: isLate ? 'destructive' : 'default',
      });
    }
  };

  const handleClockOut = () => {
    if (!isInRange && !locationError?.includes('模拟')) {
      toast({ title: '打卡失败', description: `您不在打卡范围内（距离公司${distance}米）`, variant: 'destructive' });
      return;
    }
    const time = formatTime(currentTime);
    const hour = currentTime.getHours();
    setClockedOut(true);
    setClockOutTime(time);
    setClockOutLocation(userLocation);
    const isEarly = hour < 18;
    toast({
      title: isEarly ? '签退成功（早退）' : '签退成功',
      description: `签退时间：${time} | 位置已记录`,
      variant: isEarly ? 'destructive' : 'default',
    });
  };

  const [userRecords, setUserRecords] = useState<AttendanceRecord[]>([]);
  useEffect(() => {
    attendanceService.getMyRecords({ pageSize: 15 }).then(r => setUserRecords(r.records)).catch(() => {});
  }, []);

  const statusLabel = (s: AttendanceRecord['status']) => {
    const map: Record<string, { text: string; cls: string }> = {
      normal: { text: '正常', cls: 'text-success bg-success/10' },
      late: { text: '迟到', cls: 'text-warning bg-warning/10' },
      early: { text: '早退', cls: 'text-warning bg-warning/10' },
      absent: { text: '缺勤', cls: 'text-destructive bg-destructive/10' },
      leave: { text: '请假', cls: 'text-primary bg-primary/10' },
    };
    return map[s] || map.normal;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">考勤打卡</h1>
            {isAdmin && (
              <Dialog open={showLocationSettings} onOpenChange={(open) => { setShowLocationSettings(open); if (open) setSettingsForm(companyLocation); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Settings className="h-4 w-4" />
                    公司位置设置
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>设置公司打卡位置</DialogTitle>
                    <DialogDescription>管理员可修改公司GPS坐标和打卡范围，方便测试不同位置的打卡效果。</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>公司名称</Label>
                      <Input value={settingsForm.name} onChange={e => setSettingsForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>纬度 (Latitude)</Label>
                        <Input type="number" step="0.0001" value={settingsForm.lat} onChange={e => setSettingsForm(f => ({ ...f, lat: e.target.value }))} />
                      </div>
                      <div className="grid gap-2">
                        <Label>经度 (Longitude)</Label>
                        <Input type="number" step="0.0001" value={settingsForm.lng} onChange={e => setSettingsForm(f => ({ ...f, lng: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>打卡范围（米）</Label>
                      <Input type="number" value={settingsForm.radius} onChange={e => setSettingsForm(f => ({ ...f, radius: e.target.value }))} />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">💡 提示</p>
                      <p>可以用百度/高德地图查询目标位置的经纬度，或者把范围设大（如 999999 米）来测试打卡。</p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowLocationSettings(false)}>取消</Button>
                    <Button onClick={saveCompanyLocation} className="gap-2"><Save className="h-4 w-4" />保存</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </FadeIn>

        {!isOnline && (
          <FadeIn>
            <div className="flex items-center gap-2 text-warning bg-warning/10 px-4 py-2 rounded-lg text-sm">
              <WifiOff className="h-4 w-4" />当前处于离线状态，打卡数据将暂存本地
            </div>
          </FadeIn>
        )}

        {/* GPS定位 + 打卡区域 */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：地图和定位信息 */}
            <div className="glass-card-strong p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> GPS定位打卡
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={getLocation}
                  disabled={isLocating}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  <Navigation className={`h-3 w-3 ${isLocating ? 'animate-spin' : ''}`} />
                  {isLocating ? '定位中...' : '重新定位'}
                </motion.button>
              </div>

              {/* 地图 */}
              <LocationMap
                userLat={userLocation?.lat ?? null}
                userLng={userLocation?.lng ?? null}
                companyLat={companyLocation.lat}
                companyLng={companyLocation.lng}
                radius={companyLocation.radius}
                isInRange={isInRange}
              />

              {/* 定位状态信息 */}
              <div className="mt-4 space-y-2">
                <AnimatePresence mode="wait">
                  {locationError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 text-xs text-warning bg-warning/10 px-3 py-2 rounded-lg"
                    >
                      <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      <span>{locationError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">公司位置</p>
                    <p className="font-medium mt-0.5">{companyLocation.name}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">打卡范围</p>
                    <p className="font-medium mt-0.5">{companyLocation.radius} 米</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">当前距离</p>
                    <p className={`font-medium mt-0.5 ${isInRange ? 'text-success' : 'text-destructive'}`}>
                      {distance !== null ? `${distance} 米` : '获取中...'}
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">打卡状态</p>
                    <p className={`font-medium mt-0.5 flex items-center gap-1 ${isInRange ? 'text-success' : 'text-destructive'}`}>
                      <Shield className="h-3 w-3" />
                      {isInRange ? '范围内' : '范围外'}
                    </p>
                  </div>
                </div>

                {/* 打卡位置记录 */}
                {(clockInLocation || clockOutLocation) && (
                  <div className="border-t border-border/50 pt-2 mt-2 space-y-1">
                    {clockInLocation && (
                      <p className="text-[11px] text-muted-foreground">
                        ✅ 签到位置：{clockInLocation.lat.toFixed(6)}, {clockInLocation.lng.toFixed(6)}
                      </p>
                    )}
                    {clockOutLocation && (
                      <p className="text-[11px] text-muted-foreground">
                        ✅ 签退位置：{clockOutLocation.lat.toFixed(6)}, {clockOutLocation.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：时间 + 打卡按钮 */}
            <div className="glass-card-strong p-8 flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">{formatDate(currentTime)}</p>
              <motion.p
                key={formatTime(currentTime)}
                initial={{ opacity: 0.7, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold my-6 font-mono tracking-wider"
              >
                {formatTime(currentTime)}
              </motion.p>

              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-muted-foreground">
                {isOnline ? <Wifi className="h-4 w-4 text-success" /> : <WifiOff className="h-4 w-4 text-warning" />}
                {isOnline ? '网络正常' : '离线模式'}
                <span className="mx-1">·</span>
                <MapPin className={`h-4 w-4 ${isInRange ? 'text-success' : 'text-destructive'}`} />
                {isInRange ? '已进入打卡范围' : '未在打卡范围'}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <motion.button
                  whileHover={{ scale: clockedIn ? 1 : 1.05 }}
                  whileTap={{ scale: clockedIn ? 1 : 0.95 }}
                  onClick={handleClockIn}
                  disabled={clockedIn}
                  className={`flex-1 px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg ${
                    clockedIn
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : !isInRange
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                      : 'bg-primary text-primary-foreground shadow-primary/20 btn-pulse'
                  }`}
                >
                  {clockedIn ? (
                    <span className="flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5" />已签到 {clockInTime}</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Clock className="h-5 w-5" />上班签到</span>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: (!clockedIn || clockedOut) ? 1 : 1.05 }}
                  whileTap={{ scale: (!clockedIn || clockedOut) ? 1 : 0.95 }}
                  onClick={handleClockOut}
                  disabled={!clockedIn || clockedOut}
                  className={`flex-1 px-6 py-4 rounded-2xl text-base font-semibold transition-all duration-200 shadow-lg ${
                    clockedOut
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : !clockedIn
                      ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                      : 'bg-foreground text-background shadow-foreground/10'
                  }`}
                >
                  {clockedOut ? (
                    <span className="flex items-center justify-center gap-2"><CheckCircle className="h-5 w-5" />已签退 {clockOutTime}</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Clock className="h-5 w-5" />下班签退</span>
                  )}
                </motion.button>
              </div>

              {!isInRange && !clockedIn && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-destructive mt-4 flex items-center gap-1"
                >
                  <AlertTriangle className="h-3 w-3" />
                  您当前不在打卡范围内，无法签到
                </motion.p>
              )}
            </div>
          </div>
        </FadeIn>

        {/* 打卡记录 */}
        <FadeIn delay={0.2}>
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4">近期打卡记录</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">日期</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">签到</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">签退</th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {userRecords.map(r => {
                    const s = statusLabel(r.status);
                    return (
                      <tr key={r.id} className="border-b border-border/50 last:border-0 table-row-hover">
                        <td className="py-3 px-2">{r.date}</td>
                        <td className="py-3 px-2">{r.clockIn || '-'}</td>
                        <td className="py-3 px-2">{r.clockOut || '-'}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${s.cls}`}>{s.text}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
};

export default Attendance;
