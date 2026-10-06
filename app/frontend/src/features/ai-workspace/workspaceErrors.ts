import axios from 'axios';

export function describeWorkspaceFailure(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return (
        'تعذّر الاتصال بخادم المنصة. تأكد أن الـ backend يعمل (منفذ 8000) وأن الواجهة تعمل عبر npm run dev.'
      );
    }
    const status = error.response.status;
    if (status === 429) {
      return 'تم تجاوز حد الطلبات. انتظر قليلاً ثم أعد المحاولة.';
    }
    const detail = error.response.data;
    if (detail && typeof detail === 'object') {
      const userMessage = (detail as { user_message?: string }).user_message;
      if (typeof userMessage === 'string' && userMessage.trim()) {
        return userMessage.trim();
      }
      const nested = (detail as { error?: { user_message?: string } }).error?.user_message;
      if (typeof nested === 'string' && nested.trim()) {
        return nested.trim();
      }
      const plainDetail = (detail as { detail?: string }).detail;
      if (typeof plainDetail === 'string' && plainDetail.trim()) {
        return plainDetail.trim();
      }
    }
    return `تعذّر معالجة رسالتك (خطأ ${status}). حاول مرة أخرى.`;
  }

  if (error instanceof Error && error.message === 'Streaming request failed') {
    return (
      'تعذّر بث رد المساعد. تحقق من اتصال الخادم أو من إعداد مفتاح الذكاء الاصطناعي (APP_AI_KEY).'
    );
  }

  return 'تعذر معالجة رسالتك حالياً. يرجى المحاولة مرة أخرى أو تصفح الخدمات من القائمة.';
}
