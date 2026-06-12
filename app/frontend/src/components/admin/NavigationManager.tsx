import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Trash2, GripVertical, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface NavigationManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  id: number;
  label: string;
  path: string;
  sort_order: number;
  is_visible: boolean;
}

export default function NavigationManager({ open, onOpenChange }: NavigationManagerProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', path: '' });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['navigation_items'],
    queryFn: async () => {
      const res = await client.from('navigation_items').query();
      const data = (res?.data?.items || res?.data || []) as NavItem[];
      return data.sort((a, b) => a.sort_order - b.sort_order);
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { label: string; path: string; sort_order: number; is_visible: boolean }) => {
      return client.from('navigation_items').create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_items'] });
      toast.success('تم إضافة العنصر بنجاح');
      setShowAddForm(false);
      setNewItem({ label: '', path: '' });
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الإضافة');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<NavItem> }) => {
      return client.from('navigation_items').update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_items'] });
      toast.success('تم التحديث بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء التحديث');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return client.from('navigation_items').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_items'] });
      toast.success('تم الحذف بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });

  const handleAdd = () => {
    if (!newItem.label || !newItem.path) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    const path = newItem.path.startsWith('/') ? newItem.path : `/${newItem.path}`;
    createMutation.mutate({
      label: newItem.label,
      path,
      sort_order: items.length + 1,
      is_visible: true,
    });
  };

  const handleToggleVisibility = (item: NavItem) => {
    updateMutation.mutate({ id: item.id, data: { is_visible: !item.is_visible } });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const currentItem = items[index];
    const prevItem = items[index - 1];
    updateMutation.mutate({ id: currentItem.id, data: { sort_order: prevItem.sort_order } });
    updateMutation.mutate({ id: prevItem.id, data: { sort_order: currentItem.sort_order } });
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1) return;
    const currentItem = items[index];
    const nextItem = items[index + 1];
    updateMutation.mutate({ id: currentItem.id, data: { sort_order: nextItem.sort_order } });
    updateMutation.mutate({ id: nextItem.id, data: { sort_order: currentItem.sort_order } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-[#1a1a2e] border-[#D3B051]/30" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-[#D3B051] flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            إدارة التنقل
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <p className="text-white/60 text-center py-4">جاري التحميل...</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  item.is_visible
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/2 border-white/5 opacity-60'
                }`}
              >
                {/* Reorder Controls */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-white/40 hover:text-[#D3B051] disabled:opacity-20 text-xs"
                  >
                    ▲
                  </button>
                  <GripVertical className="h-3 w-3 text-white/20" />
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === items.length - 1}
                    className="text-white/40 hover:text-[#D3B051] disabled:opacity-20 text-xs"
                  >
                    ▼
                  </button>
                </div>

                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.label}</p>
                  <p className="text-white/40 text-xs truncate" dir="ltr">{item.path}</p>
                </div>

                {/* Visibility Toggle */}
                <Switch
                  checked={item.is_visible}
                  onCheckedChange={() => handleToggleVisibility(item)}
                  className="data-[state=checked]:bg-[#D3B051]"
                />

                {/* Delete */}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto"
                  onClick={() => {
                    if (confirm(`هل أنت متأكد من حذف "${item.label}"؟`)) {
                      deleteMutation.mutate(item.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Add New Item Form */}
        {showAddForm ? (
          <div className="space-y-3 p-3 bg-white/5 rounded-lg border border-[#D3B051]/30">
            <Input
              placeholder="العنوان (مثال: من نحن)"
              value={newItem.label}
              onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            <Input
              placeholder="المسار (مثال: /about)"
              value={newItem.path}
              onChange={(e) => setNewItem({ ...newItem, path: e.target.value })}
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
                  setNewItem({ label: '', path: '' });
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
              إضافة عنصر تنقل
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}