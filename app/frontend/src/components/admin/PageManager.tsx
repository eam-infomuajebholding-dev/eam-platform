import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface PageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavigationItem {
  id: number;
  label: string;
  path: string;
  sort_order: number;
  is_visible: boolean;
}

export default function PageManager({ open, onOpenChange }: PageManagerProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPage, setNewPage] = useState({ label: '', path: '' });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['navigation_items'],
    queryFn: async () => {
      const res = await client.from('navigation_items').query();
      return (res?.data?.items || res?.data || []) as NavigationItem[];
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { label: string; path: string; sort_order: number; is_visible: boolean }) => {
      return client.from('navigation_items').create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_items'] });
      toast.success('تم إضافة الصفحة بنجاح');
      setShowAddForm(false);
      setNewPage({ label: '', path: '' });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الإضافة');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return client.from('navigation_items').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_items'] });
      toast.success('تم حذف الصفحة بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });

  const handleAdd = () => {
    if (!newPage.label || !newPage.path) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    const path = newPage.path.startsWith('/') ? newPage.path : `/${newPage.path}`;
    createMutation.mutate({
      label: newPage.label,
      path,
      sort_order: pages.length + 1,
      is_visible: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1a1a2e] border-[#D3B051]/30" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-[#D3B051] flex items-center gap-2">
            <FileText className="h-5 w-5" />
            إدارة الصفحات
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <p className="text-white/60 text-center py-4">جاري التحميل...</p>
          ) : (
            pages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{page.label}</p>
                  <p className="text-white/40 text-xs" dir="ltr">{page.path}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف "${page.label}"؟`)) {
                      deleteMutation.mutate(page.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New Page Form */}
        {showAddForm ? (
          <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-[#D3B051]/30">
            <Input
              placeholder="اسم الصفحة (مثال: خدماتنا)"
              value={newPage.label}
              onChange={(e) => setNewPage({ ...newPage, label: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            <Input
              placeholder="المسار (مثال: /services)"
              value={newPage.path}
              onChange={(e) => setNewPage({ ...newPage, path: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
              dir="ltr"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-[#D3B051] text-[#1a1a2e] hover:bg-[#D3B051]/80"
                onClick={handleAdd}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'جاري الإضافة...' : 'إضافة'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white/60 hover:bg-white/5 bg-transparent"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPage({ label: '', path: '' });
                }}
              >
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <DialogFooter>
            <Button
              className="w-full bg-[#D3B051]/10 text-[#D3B051] hover:bg-[#D3B051]/20 border border-[#D3B051]/30"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 ml-1" />
              إضافة صفحة جديدة
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}