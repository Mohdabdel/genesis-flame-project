import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardList,
  FolderKanban,
  GraduationCap,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
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
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">لم تنضم لأي مؤسسة بعد</h2>
        <p className="mt-2 text-muted-foreground max-w-md">
          أنشئ مؤسسة جديدة أو انتظر دعوة من مسؤول مؤسستك للبدء.
        </p>
      </div>
    );
  }

  const statCards = [
    { label: "التقييمات", value: stats.assessmentCount, icon: ClipboardList, color: "text-primary" },
    { label: "المشاريع", value: stats.projectCount, icon: FolderKanban, color: "text-chart-2" },
    { label: "المهام المعلقة", value: stats.taskCount, icon: AlertCircle, color: "text-destructive" },
    { label: "معدل التقدم", value: "72%", icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء مؤسستك</p>
      </div>

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
              آخر المشاريع
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
              آخر التقييمات
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
