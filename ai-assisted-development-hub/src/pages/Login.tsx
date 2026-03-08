import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Eye, EyeOff, ArrowRight, User, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import collegeLogo from '@/assets/college-logo.jpg';

// ==================== 瞳孔组件 ====================

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

function Pupil({ size = 12, maxDistance = 5, pupilColor = 'black', forceLookX, forceLookY }: PupilProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const rect = pupilRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calculatePosition();

  return (
    <div ref={pupilRef} className="rounded-full" style={{
      width: size, height: size, backgroundColor: pupilColor,
      transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out',
    }} />
  );
}

// ==================== 眼球组件 ====================

interface EyeBallProps {
  size?: number; pupilSize?: number; maxDistance?: number;
  eyeColor?: string; pupilColor?: string; isBlinking?: boolean;
  forceLookX?: number; forceLookY?: number;
}

function EyeBall({ size = 48, pupilSize = 16, maxDistance = 10, eyeColor = 'white', pupilColor = 'black', isBlinking = false, forceLookX, forceLookY }: EyeBallProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const calculatePosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) return { x: forceLookX, y: forceLookY };
    const rect = eyeRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const dist = Math.min(Math.sqrt(dx ** 2 + dy ** 2), maxDistance);
    const angle = Math.atan2(dy, dx);
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist };
  };

  const pos = calculatePosition();

  return (
    <div ref={eyeRef} className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{ width: size, height: isBlinking ? 2 : size, backgroundColor: eyeColor, overflow: 'hidden' }}>
      {!isBlinking && (
        <div className="rounded-full" style={{
          width: pupilSize, height: pupilSize, backgroundColor: pupilColor,
          transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.1s ease-out',
        }} />
      )}
    </div>
  );
}

// ==================== 角色场景 ====================

interface AnimatedCharactersProps {
  isTyping?: boolean; showPassword?: boolean; passwordLength?: number;
}

function AnimatedCharacters({ isTyping = false, showPassword = false, passwordLength = 0 }: AnimatedCharactersProps) {
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { setMouseX(e.clientX); setMouseY(e.clientY); };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => { setIsPurpleBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const t = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => { setIsBlackBlinking(false); scheduleBlink(); }, 150);
      }, Math.random() * 4000 + 3000);
      return t;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  useEffect(() => {
    if (passwordLength > 0 && showPassword) {
      const t = setTimeout(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(t);
    } else {
      setIsPurplePeeking(false);
    }
  }, [passwordLength, showPassword, isPurplePeeking]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 3;
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);
  const isHidingPassword = passwordLength > 0 && !showPassword;
  const isShowingPassword = passwordLength > 0 && showPassword;

  return (
    <div className="relative w-full max-w-[550px] h-[300px] sm:h-[400px]">
      {/* 紫色 */}
      <div ref={purpleRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: '12%', width: '33%', height: (isTyping || isHidingPassword) ? '110%' : '100%',
          backgroundColor: '#6C3FF5', borderRadius: '10px 10px 0 0', zIndex: 1,
          transform: isShowingPassword ? 'skewX(0deg)' : (isTyping || isHidingPassword)
            ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)` : `skewX(${purplePos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}>
        <div className="absolute flex gap-8 transition-all duration-700 ease-in-out"
          style={{
            left: isShowingPassword ? 20 : isLookingAtEachOther ? 55 : 45 + purplePos.faceX,
            top: isShowingPassword ? 35 : isLookingAtEachOther ? 65 : 40 + purplePos.faceY,
          }}>
          <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking}
            forceLookX={isShowingPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={isShowingPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
          <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isPurpleBlinking}
            forceLookX={isShowingPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined}
            forceLookY={isShowingPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
        </div>
      </div>

      {/* 黑色 */}
      <div ref={blackRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: '43%', width: '22%', height: '77.5%', backgroundColor: '#2D2D2D',
          borderRadius: '8px 8px 0 0', zIndex: 2,
          transform: isShowingPassword ? 'skewX(0deg)' : isLookingAtEachOther
            ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
            : (isTyping || isHidingPassword) ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)` : `skewX(${blackPos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}>
        <div className="absolute flex gap-6 transition-all duration-700 ease-in-out"
          style={{
            left: isShowingPassword ? 10 : isLookingAtEachOther ? 32 : 26 + blackPos.faceX,
            top: isShowingPassword ? 28 : isLookingAtEachOther ? 12 : 32 + blackPos.faceY,
          }}>
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
            forceLookX={isShowingPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={isShowingPassword ? -4 : isLookingAtEachOther ? -4 : undefined} />
          <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="#2D2D2D" isBlinking={isBlackBlinking}
            forceLookX={isShowingPassword ? -4 : isLookingAtEachOther ? 0 : undefined}
            forceLookY={isShowingPassword ? -4 : isLookingAtEachOther ? -4 : undefined} />
        </div>
      </div>

      {/* 橙色 */}
      <div ref={orangeRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: 0, width: '44%', height: '50%', zIndex: 3,
          backgroundColor: '#FF9B6B', borderRadius: '50% 50% 0 0',
          transform: isShowingPassword ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}>
        <div className="absolute flex gap-8 transition-all duration-200 ease-out"
          style={{
            left: isShowingPassword ? '20%' : `calc(34% + ${orangePos.faceX || 0}px)`,
            top: isShowingPassword ? '42%' : `calc(45% + ${orangePos.faceY || 0}px)`,
          }}>
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={isShowingPassword ? -5 : undefined} forceLookY={isShowingPassword ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={isShowingPassword ? -5 : undefined} forceLookY={isShowingPassword ? -4 : undefined} />
        </div>
      </div>

      {/* 黄色 */}
      <div ref={yellowRef} className="absolute bottom-0 transition-all duration-700 ease-in-out"
        style={{
          left: '56%', width: '26%', height: '57.5%', backgroundColor: '#E8D754',
          borderRadius: '50% 50% 0 0', zIndex: 4,
          transform: isShowingPassword ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew || 0}deg)`,
          transformOrigin: 'bottom center',
        }}>
        <div className="absolute flex gap-6 transition-all duration-200 ease-out"
          style={{
            left: isShowingPassword ? '14%' : `calc(37% + ${yellowPos.faceX || 0}px)`,
            top: isShowingPassword ? '15%' : `calc(17% + ${yellowPos.faceY || 0}px)`,
          }}>
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={isShowingPassword ? -5 : undefined} forceLookY={isShowingPassword ? -4 : undefined} />
          <Pupil size={12} maxDistance={5} pupilColor="#2D2D2D" forceLookX={isShowingPassword ? -5 : undefined} forceLookY={isShowingPassword ? -4 : undefined} />
        </div>
        <div className="absolute w-14 h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
          style={{
            left: isShowingPassword ? '7%' : `calc(28% + ${yellowPos.faceX || 0}px)`,
            top: isShowingPassword ? '38%' : `calc(38% + ${yellowPos.faceY || 0}px)`,
          }} />
      </div>
    </div>
  );
}

// ==================== 浮动线条动画 ====================

function FlowingLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.path
          key={i}
          d={`M ${-50 + i * 30} ${200 + i * 80} Q ${200 + i * 40} ${100 - i * 30}, ${500 + i * 20} ${300 + i * 50}`}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 6 + i * 1.5, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

// ==================== 动态渐变边框卡片 ====================

function GlowCard({ children, className = '', fullScreen = false }: { children: React.ReactNode; className?: string; fullScreen?: boolean }) {
  if (fullScreen) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" />
        <div className="relative h-full flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16 py-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-[1px] rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(var(--glow-angle, 0deg), hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary) / 0.3), hsl(var(--primary)))',
          animation: 'glowRotate 4s linear infinite',
        }}
      />
      <div className="relative rounded-2xl bg-background/80 backdrop-blur-xl p-8 sm:p-10">
        {children}
      </div>
    </div>
  );
}

// ==================== 登录页 ====================

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [loginError, setLoginError] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ title: '请输入用户名', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setLoginError(false);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      setLoginSuccess(true);
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      setLoginError(true);
      toast({ title: '登录失败', description: '用户名或密码错误', variant: 'destructive' });
      setTimeout(() => setLoginError(false), 600);
    }
  };

  return (
    <motion.div
      className="min-h-screen h-screen overflow-hidden flex flex-col lg:grid lg:grid-cols-2"
      animate={loginSuccess ? { scale: 1.05, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      {/* ===== 左侧：角色动画区（桌面端） ===== */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-12 text-white overflow-hidden">
        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* 动态渐变光球 */}
        <motion.div
          className="absolute w-80 h-80 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(108,63,245,0.3), transparent 70%)' }}
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ top: '10%', right: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,155,107,0.25), transparent 70%)' }}
          animate={{ x: [0, -50, 40, 0], y: [0, 50, -20, 0], scale: [1, 0.85, 1.15, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ bottom: '15%', left: '5%' }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(232,215,84,0.2), transparent 70%)' }}
          animate={{ x: [0, 30, -50, 0], y: [0, -30, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ top: '50%', left: '40%' }}
        />

        {/* 浮动粒子 */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: 4 + (i % 4) * 3,
              height: 4 + (i % 4) * 3,
              background: ['rgba(108,63,245,0.4)', 'rgba(255,155,107,0.4)', 'rgba(232,215,84,0.4)', 'rgba(255,255,255,0.2)'][i % 4],
              left: `${5 + (i * 8) % 90}%`,
              top: `${10 + (i * 13) % 80}%`,
            }}
            animate={{
              y: [0, -30 - (i % 3) * 10, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 5 + (i % 3) * 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}

        <div className="relative z-20">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <span>考勤管理系统</span>
          </div>
        </div>

        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <AnimatedCharacters isTyping={isTyping} showPassword={showPassword} passwordLength={password.length} />
        </div>

        <div className="relative z-20 text-xs text-white/40 leading-relaxed">
          <p>© 2026 重庆人文科技学院 · 22级计算机科学与技术专业-Rexy</p>
          <p>小型企业员工考勤管理系统的设计与实现 · 毕业设计</p>
        </div>
      </div>

      {/* ===== 右侧：登录表单（铺满） ===== */}
      <div className="relative flex-1 min-h-screen lg:min-h-0 overflow-hidden">
        {/* 极简线条动画背景 */}
        <FlowingLines />

        {/* 柔和渐变光晕背景 */}
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)' }}
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ top: '20%', left: '30%' }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.3), transparent 70%)' }}
          animate={{ x: [0, -40, 20, 0], y: [0, 30, -25, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
          initial={{ bottom: '10%', right: '15%' }}
        />

        {/* 装饰：浮动几何图形 */}
        {[
          { w: 80, h: 80, r: '50%', bg: 'hsl(var(--primary) / 0.15)', x: '10%', y: '6%', dur: 7, dx: 20, dy: -25 },
          { w: 50, h: 50, r: '12px', bg: 'hsl(var(--primary) / 0.12)', x: '82%', y: '72%', dur: 9, dx: -25, dy: 18 },
          { w: 100, h: 100, r: '50%', bg: 'hsl(var(--accent) / 0.1)', x: '70%', y: '10%', dur: 11, dx: -15, dy: 30 },
          { w: 40, h: 40, r: '10px', bg: 'hsl(var(--primary) / 0.14)', x: '15%', y: '78%', dur: 8, dx: 25, dy: -15 },
          { w: 120, h: 3, r: '2px', bg: 'hsl(var(--primary) / 0.2)', x: '55%', y: '40%', dur: 6, dx: 15, dy: 0 },
          { w: 3, h: 100, r: '2px', bg: 'hsl(var(--primary) / 0.15)', x: '22%', y: '30%', dur: 8, dx: 0, dy: 20 },
        ].map((s, i) => (
          <motion.div
            key={`deco-${i}`}
            className="absolute pointer-events-none z-[1]"
            style={{ width: s.w, height: s.h, borderRadius: s.r, backgroundColor: s.bg, left: s.x, top: s.y }}
            animate={{ x: [0, s.dx, 0], y: [0, s.dy, 0], opacity: [0.6, 1, 0.6], rotate: [0, s.dx > 0 ? 45 : -30, 0] }}
            transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
          />
        ))}

        {/* 装饰：呼吸光圈 */}
        <motion.div
          className="absolute w-[220px] h-[220px] rounded-full border-2 border-primary/20 pointer-events-none z-[1]"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.08, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[350px] h-[350px] rounded-full border border-primary/15 pointer-events-none z-[1]"
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1.1, 0.85, 1.1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Logo 右上角 */}
        <motion.img
          src={collegeLogo}
          alt="重庆人文科技学院"
          className="absolute top-5 right-5 w-20 h-20 rounded-full object-cover shadow-lg ring-2 ring-primary/10 z-20"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.15, rotate: 10, boxShadow: '0 12px 30px -8px hsl(var(--primary) / 0.3)' }}
          transition={{ type: 'spring', stiffness: 200 }}
        />

        {/* 铺满的毛玻璃卡片 */}
        <GlowCard fullScreen>
            {/* 标题 */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Clock className="h-6 w-6 text-primary" />
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-foreground">欢迎回来！</h1>
              <p className="text-muted-foreground text-sm">请输入你的账号信息登录系统</p>
            </motion.div>

            {/* 表单 */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-5"
              animate={loginError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <label className="text-sm font-medium text-foreground">用户名</label>
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focusedField === 'username' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => { setIsTyping(true); setFocusedField('username'); }}
                    onBlur={() => { setIsTyping(false); setFocusedField(null); }}
                    placeholder="admin 或 employee1"
                    className={`h-12 pl-10 bg-background/50 backdrop-blur-sm transition-all duration-300 ${
                      focusedField === 'username'
                        ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1),0_0_20px_-5px_hsl(var(--primary)/0.15)]'
                        : 'border-border/40 hover:border-border'
                    }`}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <label className="text-sm font-medium text-foreground">密码</label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className={`h-12 pl-10 pr-10 bg-background/50 backdrop-blur-sm transition-all duration-300 ${
                      focusedField === 'password'
                        ? 'border-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.1),0_0_20px_-5px_hsl(var(--primary)/0.15)]'
                        : 'border-border/40 hover:border-border'
                    }`}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    whileTap={{ scale: 0.85 }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showPassword ? 'hide' : 'show'}
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </motion.div>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium relative overflow-hidden group"
                  disabled={loading}
                >
                  <motion.span
                    className="flex items-center gap-2"
                    animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
                  >
                    {loading ? '登录中...' : '登 录'}
                    {!loading && (
                      <motion.span
                        className="inline-flex"
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.span>
                    )}
                  </motion.span>
                  <span className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                </Button>
              </motion.div>
            </motion.form>

            {/* 演示账号 */}
            <motion.div
              className="mt-8 pt-5 border-t border-border/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              <p className="text-xs text-muted-foreground text-center mb-3">演示账号 · 密码均为 123456</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'admin', label: '管理员' },
                  { name: 'employee1', label: '员工' },
                ].map((account, i) => (
                  <motion.button
                    key={account.name}
                    type="button"
                    onClick={() => { setUsername(account.name); setPassword('123456'); }}
                    className="py-3 px-4 rounded-xl border border-border/30 bg-background/30 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all text-center"
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                  >
                    <span className="text-sm font-medium text-foreground">{account.name}</span>
                    <br />
                    <span className="text-xs text-muted-foreground">{account.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </GlowCard>
      </div>
    </motion.div>
  );
};

export default Login;
