import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  PenSquare,
  Plus,
  FileText,
  Navigation,
  Upload,
  LogOut,
  Lock,
} from 'lucide-react';
import PageManager from './PageManager';
import NavigationManager from './NavigationManager';
import FileUploadDialog from './FileUploadDialog';

export default function EditToolbar() {
  const { isEditMode, isAuthenticated, toggleEditMode, login, logout } = useEditMode();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const [showNavManager, setShowNavManager] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setShowLoginDialog(false);
      setPassword('');
      setLoginError('');
    } else {
      setLoginError('كلمة المرور غير صحيحة');
    }
  };

  const handleEditButtonClick = () => {
    if (isAuthenticated) {
      toggleEditMode();
    } else {
      setShowLoginDialog(true);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Floating Edit Mode Toggle Button - always visible in bottom-left */}
      {!isEditMode && (
        <button
          onClick={handleEditButtonClick}
          className="fixed bottom-6 left-6 z-[9999] w-12 h-12 rounded-full bg-[#1a1a2e]/90 border border-[#D3B051]/40 shadow-lg shadow-[#D3B051]/10 flex items-center justify-center hover:bg-[#D3B051]/20 hover:border-[#D3B051]/70 transition-all duration-300 group"
          aria-label="تفعيل وضع التحرير"
        >
          {isAuthenticated ? (
            <PenSquare className="h-5 w-5 text-[#D3B051] group-hover:scale-110 transition-transform" />
          ) : (
            <Lock className="h-5 w-5 text-[#D3B051]/70 group-hover:text-[#D3B051] group-hover:scale-110 transition-all" />
          )}
        </button>
      )}

      {/* Edit Mode Toolbar - fixed at bottom */}
      {isEditMode && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#1a1a2e]/95 backdrop-blur-xl border-t border-[#D3B051]/30 shadow-2xl shadow-black/50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3" dir="rtl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#D3B051] font-bold text-sm ml-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                وضع التحرير
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-[#D3B051]/40 text-[#D3B051] hover:bg-[#D3B051]/10 hover:text-[#D3B051] bg-transparent"
                onClick={() => setShowPageManager(true)}
              >
                <FileText className="h-4 w-4 ml-1" />
                إدارة الصفحات
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#D3B051]/40 text-[#D3B051] hover:bg-[#D3B051]/10 hover:text-[#D3B051] bg-transparent"
                onClick={() => setShowNavManager(true)}
              >
                <Navigation className="h-4 w-4 ml-1" />
                إدارة التنقل
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-[#D3B051]/40 text-[#D3B051] hover:bg-[#D3B051]/10 hover:text-[#D3B051] bg-transparent"
                onClick={() => setShowFileUpload(true)}
              >
                <Upload className="h-4 w-4 ml-1" />
                تحميل ملف
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 ml-1" />
                خروج
              </Button>
              <Button
                size="sm"
                className="bg-[#D3B051] text-[#1a1a2e] hover:bg-[#D3B051]/80 font-bold"
                onClick={toggleEditMode}
              >
                إيقاف التحرير
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="max-w-sm bg-[#1a1a2e] border-[#D3B051]/30" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#D3B051] text-center">دخول وضع التحرير</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="أدخل كلمة المرور"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setLoginError('');
              }}
              className="text-center bg-white/5 border-[#D3B051]/30 text-white placeholder:text-white/40"
            />
            {loginError && (
              <p className="text-sm text-red-400 text-center">{loginError}</p>
            )}
            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-[#D3B051] text-[#1a1a2e] hover:bg-[#D3B051]/80 font-bold"
              >
                دخول
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Page Manager Dialog */}
      <PageManager open={showPageManager} onOpenChange={setShowPageManager} />

      {/* Navigation Manager Dialog */}
      <NavigationManager open={showNavManager} onOpenChange={setShowNavManager} />

      {/* File Upload Dialog */}
      <FileUploadDialog open={showFileUpload} onOpenChange={setShowFileUpload} />
    </>
  );
}