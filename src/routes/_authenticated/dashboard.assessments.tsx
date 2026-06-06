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
import { Plus, ClipboardList, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/assessments")({
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: assessments } = useQuery({
    queryKey: ["assessments"],
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
        .from("assessments")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const createAssessment = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();
      if (!profile?.organization_id) throw new Error("No organization");
      const { error } = await supabase.from("assessments").insert({
        organization_id: profile.organization_id,
        title,
        description,
        created_by: user.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessments"] });
      setOpen(false);
      setTitle("");
      setDescription("");
      toast.success("تم إنشاء التقييم بنجاح");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = assessments?.filter((a: any) =>
    a.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ملف التقييمات والجاهزية الانتقالية</h1>
          <p className="text-muted-foreground">إدارة تقييمات الجاهزية الانتقالية ونتائج أدوات التقييم الداعمة للخطة الانتقالية الفردية.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              تقييم جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تقييم جديد</DialogTitle>
              <DialogDescription>أنشئ تقييم نضج رقمي جديد لمؤسستك</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان التقييم</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="تقييم النضج الرقمي 2026"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">الوصف</Label>
                <Input
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للتقييم..."
                />
              </div>
            </div>
            <Button
              onClick={() => createAssessment.mutate()}
              disabled={!title || createAssessment.isPending}
              className="w-full"
            >
              {createAssessment.isPending ? "جاري الإنشاء..." : "إنشاء التقييم"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="البحث في التقييمات"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered?.map((a: any) => (
          <Card key={a.id} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <ClipboardList className="h-5 w-5 text-primary" />
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === "completed"
                      ? "bg-success/10 text-success"
                      : a.status === "in_progress"
                      ? "bg-warning/10 text-warning"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {a.status === "completed" ? "مكتمل" : a.status === "in_progress" ? "قيد التنفيذ" : "مسودة"}
                </span>
              </div>
              <CardTitle className="text-base">{a.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{a.description || "بدون وصف"}</p>
              {a.overall_score !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{a.overall_score}</span>
                  <span className="text-sm text-muted-foreground">/ 5</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد تقييمات مطابقة</p>
        </div>
      )}
    </div>
  );
}
