import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { client } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `أنت مساعد ذكي لشركة إعمار الأصالة والمعاصرة للاستشارات الهندسية (EAM). أجب على استفسارات العملاء بشكل مهني ومختصر باللغة العربية.

معلومات عن الشركة:
- شركة إعمار الأصالة والمعاصرة للاستشارات الهندسية هي شركة سعودية رائدة في مجال الاستشارات الهندسية
- تأسست الشركة برؤية واضحة لتقديم حلول هندسية متكاملة تجمع بين الأصالة والمعاصرة
- حاصلة على شهادات الأيزو في الجودة
- تسعى لتكون الرائدة إقليمياً في مجال الاستشارات الهندسية
- تحقق نمو سنوي متواصل منذ التأسيس

الخدمات الهندسية:
1. التصميم المعماري والإنشائي
2. إدارة المشاريع والإشراف الهندسي
3. دراسات الجدوى الاقتصادية
4. التصميم الداخلي والخارجي
5. تصميم البنية التحتية
6. الاستشارات البيئية
7. تخطيط المدن والمناطق
8. خدمات المساحة والطبوغرافيا

الخدمات الحكومية:
1. إصدار رخص البناء
2. اعتماد المخططات الهندسية
3. شهادات إتمام البناء
4. تصاريح الدفاع المدني
5. تقارير فحص المباني

معلومات التواصل:
- البريد الإلكتروني: info@eam.sa
- الموقع: الرياض، المملكة العربية السعودية
- ساعات العمل: الأحد - الخميس، 8:00 صباحاً - 5:00 مساءً

قواعد الرد:
- أجب باللغة العربية دائماً
- كن مختصراً ومفيداً
- إذا لم تعرف الإجابة، اقترح التواصل مع الشركة مباشرة
- لا تختلق معلومات غير موجودة
- كن ودوداً ومهنياً`;

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    const chatHistory = [...messages, userMessage].map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      let accumulated = '';
      await client.ai.gentxt({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chatHistory,
        ],
        model: 'deepseek-v3.2',
        stream: true,
        onChunk: (chunk: { content?: string }) => {
          if (chunk.content) {
            accumulated += chunk.content;
            setStreamingContent(accumulated);
          }
        },
        onComplete: (finalResult: { content?: string }) => {
          const finalContent = finalResult?.content || accumulated;
          setMessages((prev) => [...prev, { role: 'assistant', content: finalContent }]);
          setStreamingContent('');
          setIsLoading(false);
        },
        onError: (error: { message?: string }) => {
          console.error('Chatbot error:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.' },
          ]);
          setStreamingContent('');
          setIsLoading(false);
        },
        timeout: 60_000,
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى أو التواصل معنا مباشرة.' },
      ]);
      setStreamingContent('');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="bg-[#1a1a2e] px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm font-tajawal">المساعد الذكي</h3>
                <p className="text-white/50 text-xs font-tajawal">إعمار الأصالة والمعاصرة</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" dir="rtl">
            {messages.length === 0 && !streamingContent && (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                  <Bot className="w-7 h-7 text-gold" />
                </div>
                <p className="text-[#1a1a2e]/70 text-sm font-tajawal mb-4">
                  مرحباً! أنا المساعد الذكي لشركة إعمار الأصالة والمعاصرة. كيف يمكنني مساعدتك؟
                </p>
                <div className="space-y-2">
                  {[
                    'ما هي خدماتكم الهندسية؟',
                    'كيف أتواصل معكم؟',
                    'ما هي ساعات العمل؟',
                  ].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => {
                          const fakeEvent = { key: 'Enter', shiftKey: false, preventDefault: () => {} } as React.KeyboardEvent;
                          handleKeyDown(fakeEvent);
                        }, 100);
                      }}
                      className="block w-full text-right px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-[#1a1a2e]/80 font-tajawal hover:border-gold/50 hover:bg-gold/5 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-[#1a1a2e]' : 'bg-gold/20'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gold" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-tajawal leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#1a1a2e] text-white rounded-tr-sm'
                      : 'bg-white text-[#1a1a2e] border border-gray-200 rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {streamingContent && (
              <div className="flex gap-2 flex-row">
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-gold" />
                </div>
                <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tl-sm bg-white text-[#1a1a2e] border border-gray-200 text-sm font-tajawal leading-relaxed whitespace-pre-wrap">
                  {streamingContent}
                  <span className="inline-block w-1.5 h-4 bg-gold/60 animate-pulse mr-0.5 align-middle" />
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && !streamingContent && (
              <div className="flex gap-2 flex-row">
                <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-gold" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-gray-200">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0" dir="rtl">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك هنا..."
                disabled={isLoading}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1a1a2e] font-tajawal placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors disabled:opacity-60"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-[#1a1a2e] text-white flex items-center justify-center hover:bg-[#2a2a4e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 rotate-180" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-[#1a1a2e] hover:bg-[#2a2a4e]'
            : 'bg-gradient-to-br from-gold to-[#b8922e] hover:shadow-[0_4px_20px_rgba(201,168,76,0.4)]'
        }`}
        aria-label="المساعد الذكي"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
}