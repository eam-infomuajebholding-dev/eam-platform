import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, LogOut, LayoutDashboard, Lock } from 'lucide-react';

const ADMIN_PASSWORD = 'eam2024';
const AUTH_STORAGE_KEY = 'admin_authenticated';

// Generic fetch helper
async function fetchEntities(entityName: string) {
  const res = await client.from(entityName).query();
  return res?.data?.items || res?.data || [];
}

// Generic CRUD helpers
async function createEntity(entityName: string, data: Record<string, unknown>) {
  return client.from(entityName).create(data);
}

async function updateEntity(entityName: string, id: string | number, data: Record<string, unknown>) {
  return client.from(entityName).update(id, data);
}

async function deleteEntity(entityName: string, id: string | number) {
  return client.from(entityName).delete(id);
}

// ============ Page Content Tab ============
function PageContentTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ page_key: '', section_key: '', title: '', content: '', sort_order: 0 });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['page_contents'],
    queryFn: () => fetchEntities('page_contents'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing ? updateEntity('page_contents', editing.id as number, data) : createEntity('page_contents', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_contents'] });
      toast({ title: editing ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح' });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'حدث خطأ', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEntity('page_contents', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_contents'] });
      toast({ title: 'تم الحذف بنجاح' });
    },
    onError: () => toast({ title: 'حدث خطأ في الحذف', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ page_key: '', section_key: '', title: '', content: '', sort_order: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({
      page_key: (item.page_key as string) || '',
      section_key: (item.section_key as string) || '',
      title: (item.title as string) || '',
      content: (item.content as string) || '',
      sort_order: (item.sort_order as number) || 0,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">محتوى الصفحات</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 ml-2" />إضافة محتوى</Button>
      </div>
      {isLoading ? <p>جاري التحميل...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصفحة</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items as Record<string, unknown>[]).map((item) => (
              <TableRow key={item.id as number}>
                <TableCell>{item.page_key as string}</TableCell>
                <TableCell>{item.section_key as string}</TableCell>
                <TableCell>{item.title as string}</TableCell>
                <TableCell>{item.sort_order as number}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(item.id as number)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="مفتاح الصفحة" value={form.page_key} onChange={(e) => setForm({ ...form, page_key: e.target.value })} />
            <Input placeholder="مفتاح القسم" value={form.section_key} onChange={(e) => setForm({ ...form, section_key: e.target.value })} />
            <Input placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="المحتوى" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} />
            <Input type="number" placeholder="الترتيب" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Services Tab ============
function ServicesTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ title: '', description: '', icon: '', image_url: '', page_path: '', sort_order: 0, is_active: true });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => fetchEntities('services'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing ? updateEntity('services', editing.id as number, data) : createEntity('services', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: editing ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح' });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'حدث خطأ', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEntity('services', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast({ title: 'تم الحذف بنجاح' });
    },
    onError: () => toast({ title: 'حدث خطأ في الحذف', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', icon: '', image_url: '', page_path: '', sort_order: 0, is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({
      title: (item.title as string) || '',
      description: (item.description as string) || '',
      icon: (item.icon as string) || '',
      image_url: (item.image_url as string) || '',
      page_path: (item.page_path as string) || '',
      sort_order: (item.sort_order as number) || 0,
      is_active: (item.is_active as boolean) ?? true,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الخدمات</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 ml-2" />إضافة خدمة</Button>
      </div>
      {isLoading ? <p>جاري التحميل...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>المسار</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items as Record<string, unknown>[]).map((item) => (
              <TableRow key={item.id as number}>
                <TableCell>{item.title as string}</TableCell>
                <TableCell className="max-w-[200px] truncate">{item.description as string}</TableCell>
                <TableCell>{item.page_path as string}</TableCell>
                <TableCell>{(item.is_active as boolean) ? '✅ نشط' : '❌ غير نشط'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(item.id as number)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            <Input placeholder="الأيقونة" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            <Input placeholder="رابط الصورة" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <Input placeholder="مسار الصفحة" value={form.page_path} onChange={(e) => setForm({ ...form, page_path: e.target.value })} />
            <Input type="number" placeholder="الترتيب" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              <span>نشط</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Projects Tab ============
function ProjectsTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({
    name: '', location: '', type: '', investment_amount: '', expected_return: '',
    duration: '', description: '', video_url: '', image_url: '', status: 'active',
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchEntities('projects'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing ? updateEntity('projects', editing.id as number, data) : createEntity('projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: editing ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح' });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'حدث خطأ', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEntity('projects', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'تم الحذف بنجاح' });
    },
    onError: () => toast({ title: 'حدث خطأ في الحذف', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', location: '', type: '', investment_amount: '', expected_return: '', duration: '', description: '', video_url: '', image_url: '', status: 'active' });
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({
      name: (item.name as string) || '',
      location: (item.location as string) || '',
      type: (item.type as string) || '',
      investment_amount: String(item.investment_amount || ''),
      expected_return: String(item.expected_return || ''),
      duration: (item.duration as string) || '',
      description: (item.description as string) || '',
      video_url: (item.video_url as string) || '',
      image_url: (item.image_url as string) || '',
      status: (item.status as string) || 'active',
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">المشاريع</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 ml-2" />إضافة مشروع</Button>
      </div>
      {isLoading ? <p>جاري التحميل...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الموقع</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items as Record<string, unknown>[]).map((item) => (
              <TableRow key={item.id as number}>
                <TableCell>{item.name as string}</TableCell>
                <TableCell>{item.location as string}</TableCell>
                <TableCell>{item.type as string}</TableCell>
                <TableCell>{item.investment_amount as string}</TableCell>
                <TableCell>{item.status as string}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(item.id as number)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="اسم المشروع" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="الموقع" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input placeholder="النوع" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            <Input placeholder="مبلغ الاستثمار" value={form.investment_amount} onChange={(e) => setForm({ ...form, investment_amount: e.target.value })} />
            <Input placeholder="العائد المتوقع" value={form.expected_return} onChange={(e) => setForm({ ...form, expected_return: e.target.value })} />
            <Input placeholder="المدة" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <Input placeholder="رابط الفيديو" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
            <Input placeholder="رابط الصورة" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <Input placeholder="الحالة (active/completed/upcoming)" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            <div className="col-span-2">
              <Textarea placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Videos Tab ============
function VideosTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ video_key: '', video_url: '', title: '', page: '', is_active: true });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['site_videos'],
    queryFn: () => fetchEntities('site_videos'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing ? updateEntity('site_videos', editing.id as number, data) : createEntity('site_videos', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_videos'] });
      toast({ title: editing ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح' });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'حدث خطأ', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEntity('site_videos', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_videos'] });
      toast({ title: 'تم الحذف بنجاح' });
    },
    onError: () => toast({ title: 'حدث خطأ في الحذف', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ video_key: '', video_url: '', title: '', page: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({
      video_key: (item.video_key as string) || '',
      video_url: (item.video_url as string) || '',
      title: (item.title as string) || '',
      page: (item.page as string) || '',
      is_active: (item.is_active as boolean) ?? true,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الفيديوهات</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 ml-2" />إضافة فيديو</Button>
      </div>
      {isLoading ? <p>جاري التحميل...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المفتاح</TableHead>
              <TableHead>العنوان</TableHead>
              <TableHead>الصفحة</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items as Record<string, unknown>[]).map((item) => (
              <TableRow key={item.id as number}>
                <TableCell>{item.video_key as string}</TableCell>
                <TableCell>{item.title as string}</TableCell>
                <TableCell>{item.page as string}</TableCell>
                <TableCell>{(item.is_active as boolean) ? '✅ نشط' : '❌ غير نشط'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(item.id as number)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="مفتاح الفيديو" value={form.video_key} onChange={(e) => setForm({ ...form, video_key: e.target.value })} />
            <Input placeholder="العنوان" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="رابط الفيديو" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
            <Input placeholder="الصفحة" value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              <span>نشط</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Navigation Tab ============
function NavigationTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ label: '', path: '', parent_id: '', sort_order: 0, is_visible: true });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['navigation_items'],
    queryFn: () => fetchEntities('navigation_items'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      editing ? updateEntity('navigation_items', editing.id as number, data) : createEntity('navigation_items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_items'] });
      toast({ title: editing ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح' });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'حدث خطأ', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEntity('navigation_items', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['navigation_items'] });
      toast({ title: 'تم الحذف بنجاح' });
    },
    onError: () => toast({ title: 'حدث خطأ في الحذف', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ label: '', path: '', parent_id: '', sort_order: 0, is_visible: true });
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({
      label: (item.label as string) || '',
      path: (item.path as string) || '',
      parent_id: (item.parent_id as string) || '',
      sort_order: (item.sort_order as number) || 0,
      is_visible: (item.is_visible as boolean) ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = { ...form, sort_order: form.sort_order };
    if (!form.parent_id) delete payload.parent_id;
    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">عناصر التنقل</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 ml-2" />إضافة عنصر</Button>
      </div>
      {isLoading ? <p>جاري التحميل...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>المسار</TableHead>
              <TableHead>الترتيب</TableHead>
              <TableHead>مرئي</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items as Record<string, unknown>[]).map((item) => (
              <TableRow key={item.id as number}>
                <TableCell>{item.label as string}</TableCell>
                <TableCell>{item.path as string}</TableCell>
                <TableCell>{item.sort_order as number}</TableCell>
                <TableCell>{(item.is_visible as boolean) ? '✅' : '❌'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(item.id as number)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'تعديل عنصر التنقل' : 'إضافة عنصر تنقل'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="العنوان" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            <Input placeholder="المسار" value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} />
            <Input placeholder="معرف العنصر الأب (اختياري)" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} />
            <Input type="number" placeholder="الترتيب" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
            <div className="flex items-center gap-2">
              <Switch checked={form.is_visible} onCheckedChange={(checked) => setForm({ ...form, is_visible: checked })} />
              <span>مرئي</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Site Settings Tab ============
function SiteSettingsTab() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ setting_key: '', setting_value: '', category: '' });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['site_settings'],
    queryFn: () => fetchEntities('site_settings'),
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof form) =>
      editing ? updateEntity('site_settings', editing.id as number, data) : createEntity('site_settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      toast({ title: editing ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح' });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'حدث خطأ', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEntity('site_settings', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site_settings'] });
      toast({ title: 'تم الحذف بنجاح' });
    },
    onError: () => toast({ title: 'حدث خطأ في الحذف', variant: 'destructive' }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ setting_key: '', setting_value: '', category: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: Record<string, unknown>) => {
    setEditing(item);
    setForm({
      setting_key: (item.setting_key as string) || '',
      setting_value: (item.setting_value as string) || '',
      category: (item.category as string) || '',
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">إعدادات الموقع</h2>
        <Button onClick={openCreate}><Plus className="h-4 w-4 ml-2" />إضافة إعداد</Button>
      </div>
      {isLoading ? <p>جاري التحميل...</p> : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المفتاح</TableHead>
              <TableHead>القيمة</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(items as Record<string, unknown>[]).map((item) => (
              <TableRow key={item.id as number}>
                <TableCell>{item.setting_key as string}</TableCell>
                <TableCell className="max-w-[300px] truncate">{item.setting_value as string}</TableCell>
                <TableCell>{item.category as string}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(item.id as number)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? 'تعديل الإعداد' : 'إضافة إعداد جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="المفتاح" value={form.setting_key} onChange={(e) => setForm({ ...form, setting_key: e.target.value })} />
            <Textarea placeholder="القيمة" value={form.setting_value} onChange={(e) => setForm({ ...form, setting_value: e.target.value })} rows={3} />
            <Input placeholder="الفئة" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============ Main Admin Dashboard ============
export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_STORAGE_KEY) === 'true'
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">لوحة التحكم</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="text-center"
              />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <Button type="submit" className="w-full">
                دخول
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">لوحة التحكم</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 ml-2" />تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>إدارة محتوى الموقع</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="page_contents" className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="page_contents">المحتوى</TabsTrigger>
                <TabsTrigger value="services">الخدمات</TabsTrigger>
                <TabsTrigger value="projects">المشاريع</TabsTrigger>
                <TabsTrigger value="videos">الفيديوهات</TabsTrigger>
                <TabsTrigger value="navigation">التنقل</TabsTrigger>
                <TabsTrigger value="settings">الإعدادات</TabsTrigger>
              </TabsList>
              <TabsContent value="page_contents"><PageContentTab /></TabsContent>
              <TabsContent value="services"><ServicesTab /></TabsContent>
              <TabsContent value="projects"><ProjectsTab /></TabsContent>
              <TabsContent value="videos"><VideosTab /></TabsContent>
              <TabsContent value="navigation"><NavigationTab /></TabsContent>
              <TabsContent value="settings"><SiteSettingsTab /></TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}