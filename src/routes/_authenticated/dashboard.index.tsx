import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  FolderKanban,
  TrendingUp,
  AlertCircle,
  Sparkles,
  PlayCircle,
  Compass,
  Activity,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { seedDemoInstitution } from "@/lib/demo-seed";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const qc = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.user.id)
        .single();

      if (!profile?.organization_id) return { orgId: null };

      const orgId = profile.organization_id;
      const [
        { count: assessmentCount },
        { count: projectCount },
        { count: taskCount },
        { data: projects },
        { data: assessments },
      ] = await Promise.all([
        supabase.from("assessments").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("organization_id", orgId),
        supabase.from("project_tasks").select("*", { count: "exact", head: true }).eq("status", "todo"),
        supabase.from("projects").select("*").eq("organization_id", orgId).order("updated_at", { ascending: false }).limit(5),
        supabase.from("assessments").select("*").eq("organization_id", orgId).order("updated_at", { ascending: false }).limit(5),
      ]);

      return {
        orgId,
        assessmentCount: assessmentCount ?? 0,
        projectCount: projectCount ?? 0,
        taskCount: taskCount ?? 0,
        projects: projects ?? [],
        assessments: assessments ?? [],
      };
    },
  });

  if (!stats?.orgId) {
    const handleSeed = async () => {
      setSeeding(true);
      try {
        const res = await seedDemoInstitution();
        toast.success(`تم تفعيل "مؤسسة همم النموذجية" و${res.learners} متعلمين افتراضيين`);
        await qc.invalidateQueries();
      } catch (e: any) {
        toast.error("تعذّر تجهيز المؤسسة التجريبية: " + e.message);
      } finally {
        setSeeding(false);
      }
    };
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-8 text-center space-y-6">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">لم يتم ربط حسابك بمؤسسة بعد</h2>
              <p className="text-muted-foreground">
                أنشئ مؤسسة نموذجية لتجربة مسار همم مع ملفات متعلمين، وخطط انتقال، وسيناريوهات واقعية، وشواهد أداء ميدانية.
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2 h-12 px-6"
              disabled={seeding}
              onClick={handleSeed}
            >
              {seeding ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5" />}
              إنشاء مؤسسة نموذجية للتجربة
            </Button>

            <div className="rounded-xl border bg-card p-4 text-right space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <PlayCircle className="h-4 w-4 text-primary" />
                جولة متعلم نموذجي خلال 60 ثانية
              </div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <Step n={1} text="اختر ملف متعلم نموذجي من منشئ الخطة الانتقالية الفردية." />
                <Step n={2} text="سجّل شاهد أداء ميداني داخل سيناريو واقعي." />
                <Step n={3} text="افتح بوابة الانتقال لمراجعة الجاهزية والتوصية بالمسار بعد التخرج." />
              </ol>
            </div>

            <p className="text-xs text-muted-foreground">
              ستتم تهيئة "مؤسسة همم النموذجية" مع 3 متعلمين (14، 17، 19 عاماً) وأهداف فردية وأدلة ميدانية واقعية.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    { label: "ملفات التقييمات النشطة", value: stats.assessmentCount, icon: ClipboardList, color: "text-primary" },
    { label: "وثائق الخطة الانتقالية الفردية (ITP)", value: stats.projectCount, icon: FolderKanban, color: "text-chart-2" },
    { label: "المهام المعلقة", value: stats.taskCount, icon: AlertCircle, color: "text-destructive" },
    { label: "متوسط معامل الجاهزية الانتقالية (DRC)", value: "72%", icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">لوحة القيادة</h1>
          <p className="text-muted-foreground">نظرة عامة على جاهزية المتعلمين عبر مجالات الحياة بعد المدرسة.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/dashboard/planner"><Button variant="outline" size="sm" className="gap-2"><Compass className="h-4 w-4" /> اختر متعلمًا نموذجيًا</Button></Link>
          <Link to="/dashboard/field"><Button variant="outline" size="sm" className="gap-2"><Activity className="h-4 w-4" /> سجّل شاهد أداء ميداني</Button></Link>
          <Link to="/dashboard/engine"><Button size="sm" className="gap-2"><Sparkles className="h-4 w-4" /> افتح بوابة الانتقال</Button></Link>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4 text-sm">
          <PlayCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p>
            جولة الـ60 ثانية: <strong>متعلم نموذجي</strong> ← <strong>شاهد أداء ميداني</strong> ← <strong>قراءة معامل الجاهزية الانتقالية (DRC)</strong>.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-primary" />
              آخر وثائق الخطة الانتقالية الفردية (ITP)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.projects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد مشاريع بعد</p>
            )}
            {stats.projects.map((p: any) => (
              <div key={p.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              آخر ملفات التقييمات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.assessments.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">لا توجد تقييمات بعد</p>
            )}
            {stats.assessments.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.status === "completed" ? "مكتمل" : a.status === "in_progress" ? "قيد التنفيذ" : "مسودة"}</p>
                </div>
                {a.overall_score !== null && (
                  <div className="text-lg font-bold text-primary">{a.overall_score}/5</div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: (string | undefined | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
        {n}
      </span>
      <span className="pt-0.5">{text}</span>
    </li>
  );
}
