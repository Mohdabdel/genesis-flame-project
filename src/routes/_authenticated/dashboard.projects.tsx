import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, FolderKanban, Search, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();
      if (!profile?.organization_id) return [];
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const createProject = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();
      if (!profile?.organization_id) throw new Error("No organization");
      const { error } = await supabase.from("projects").insert({
        organization_id: profile.organization_id,
        title,
        description,
        priority,
        created_by: user.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setTitle("");
      setDescription("");
      toast.success("تم إنشاء المشروع بنجاح");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = projects?.filter((p: any) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const statusLabel = (s: string) =>
    s === "completed" ? "مكتمل" : s === "in_progress" ? "قيد التنفيذ" : s === "planning" ? "تخطيط" : "متوقف";

  const priorityColor = (p: string) =>
    p === "high" ? "bg-destructive/10 text-destructive" : p === "medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">السيناريوهات والمبادرات الانتقالية</h1>
          <p className="text-muted-foreground">إدارة السيناريوهات الواقعية والمبادرات الانتقالية التي تُستخدم لتدريب الأهداف وقياس شواهد الأداء في مواقف قريبة من الحياة.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة سيناريو أو مبادرة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>مشروع جديد</DialogTitle>
              <DialogDescription>أضف مشروع تحول رقمي جديد</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">اسم المشروع</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مشروع أتمتة العمليات..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">الوصف</Label>
                <Input
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر..."
                />
              </div>
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <div className="flex gap-2">
                  {[
                    { value: "low", label: "منخفضة" },
                    { value: "medium", label: "متوسطة" },
                    { value: "high", label: "عالية" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={priority === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPriority(opt.value)}
                      className="flex-1"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={() => createProject.mutate()}
              disabled={!title || createProject.isPending}
              className="w-full"
            >
              {createProject.isPending ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="البحث في السيناريوهات والمبادرات"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered?.map((p: any) => (
          <Card key={p.id} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FolderKanban className="h-5 w-5 text-primary" />
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColor(p.priority)}`}>
                  {p.priority === "high" ? "عالية" : p.priority === "medium" ? "متوسطة" : "منخفضة"}
                </span>
              </div>
              <CardTitle className="text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">{p.description || "بدون وصف"}</p>
              <Progress value={p.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {p.start_date ? new Date(p.start_date).toLocaleDateString("ar-SA") : "غير محدد"}
                </span>
                <span>{statusLabel(p.status)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد سيناريوهات أو مبادرات مطابقة</p>
        </div>
      )}
    </div>
  );
}
