import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';

const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');
const AI_API_BASE = import.meta.env.VITE_SPRING_AI_API_BASE || `${DEFAULT_API_BASE}/ai`;

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// 模拟AI回复（Spring AI后端未就绪时使用）
const mockAIResponse = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes('迟到')) return '根据系统记录，您本月迟到 **2次**，分别是3月3日（迟到8分钟）和3月5日（迟到3分钟）。建议您提前出发，避免交通高峰。\n\n> 💡 如需查看详细记录，请前往「考勤打卡」页面。';
  if (q.includes('请假') || q.includes('休假')) return '您本月剩余年假 **5天**，病假 **10天**。\n\n申请请假流程：\n1. 进入「审批管理」页面\n2. 点击「发起申请」\n3. 选择请假类型和日期\n4. 填写请假原因并提交\n\n审批通常在 **1个工作日** 内完成。';
  if (q.includes('考勤') || q.includes('出勤')) return '📊 **本月考勤概况**：\n\n| 项目 | 数据 |\n|------|------|\n| 出勤天数 | 18天 |\n| 迟到 | 2次 |\n| 早退 | 0次 |\n| 请假 | 1天 |\n\n整体出勤率 **95.5%**，高于部门平均水平。继续保持！';
  if (q.includes('加班')) return '本月您的加班记录：\n- 3月2日 加班 **2小时**\n- 3月6日 加班 **1.5小时**\n\n累计加班 **3.5小时**，可申请调休 **0.5天**。';
  if (q.includes('规则') || q.includes('时间')) return '⏰ **当前考勤规则**：\n\n- 上班时间：**09:00**\n- 下班时间：**18:00**\n- 迟到容忍：**15分钟**\n- 早退判定：**18:00前签退**\n- 打卡范围：**公司500米内**';
  return `您好！我是AI考勤助手 🤖\n\n关于"${question}"，我可以帮您查询以下信息：\n\n1. 📅 个人考勤记录和统计\n2. 📝 请假/加班申请状态\n3. ⏰ 考勤规则说明\n4. 📊 部门出勤情况\n\n请具体描述您的需求，我会为您详细解答。`;
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '您好！我是 **AI考勤助手** 🤖\n\n我可以帮您：\n- 查询考勤记录和统计\n- 了解请假/加班政策\n- 分析考勤异常\n- 回答考勤相关问题\n\n请问有什么可以帮您的？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const getToken = () => localStorage.getItem('attendance_token');

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const token = getToken();
      const response = await fetch(`${AI_API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('attendance_token');
        localStorage.removeItem('attendance_user');
        window.location.href = '/login';
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'AI 服务调用失败');
      }

      const content = payload?.data?.content || payload?.content || payload?.message || '抱歉，我暂时无法回答。';
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date(),
      }]);
    } catch (error) {
      if (error instanceof TypeError) {
        // 后端未启动或网络不可达时，保留本地 mock 便于开发
        await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: mockAIResponse(userMsg.content),
          timestamp: new Date(),
        }]);
        return;
      }

      const message = error instanceof Error ? error.message : 'AI 服务调用失败';
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `AI 接口调用失败：${message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = ['我这个月迟到几次？', '怎么申请请假？', '考勤规则是什么？'];

  return (
    <>
      {/* 悬浮按钮 */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] max-h-[80vh] rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col bg-background"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">AI 考勤助手</h3>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                    Spring AI · 在线
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-primary/10' : 'bg-accent/10'
                  }`}>
                    {msg.role === 'user' ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-accent" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_table]:my-2 [&_blockquote]:my-2">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">AI正在思考...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 快捷问题 */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {quickQuestions.map((q) => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setInput(q); }}
                    className="text-xs px-3 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:border-primary/30 hover:text-foreground hover:bg-primary/5 transition-all"
                  >
                    {q}
                  </motion.button>
                ))}
              </div>
            )}

            {/* 输入框 */}
            <div className="px-4 py-3 border-t border-border">
              <form
                onSubmit={e => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="问我任何考勤相关问题..."
                  className="flex-1 h-10 bg-muted/50 border-border/40 text-sm"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-10 w-10 rounded-xl" disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-2">由 Spring AI 提供智能服务</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
