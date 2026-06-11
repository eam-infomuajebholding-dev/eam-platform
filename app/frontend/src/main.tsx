// ========== في أعلى الملف ==========
// منع فلاش الوضع الفاتح قبل تحميل React
(function() {
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && systemDark)) {
    document.documentElement.classList.add('dark');
  }
})();

// ========== داخل الكومبوننت ==========
function App() {
  
  // دالة تبديل الوضع
  const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };

  return (
    <div>
      {/* زر التبديل */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="تبديل الوضع"
      >
        {document.documentElement.classList.contains('dark') ? '☀️' : '🌙'}
      </button>

      {/* باقي المحتوى */}
    </div>
  );
}