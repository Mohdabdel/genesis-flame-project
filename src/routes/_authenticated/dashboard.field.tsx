import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, CheckCircle2, HandHelping, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/field")({
  component: FieldPage,
});

type StepStatus = "independent" | "prompted" | "assisted" | null;

const STATUS_SCORE: Record<Exclude<StepStatus, null>, number> = {
  independent: 1.0,
  prompted: 0.0,
  assisted: 0.0,
};

function FieldPage() {
  const qc = useQueryClient();
  const [objectiveId, setObjectiveId] = useState<string>("");
  const [steps, setSteps] = useState<Record<number, StepStatus>>({});

  const { data: objectives } = useQuery({
    queryKey: ["my-objectives"],
    queryFn: async () => {
      const { data } = await supabase
        .from("individual_objectives")
        .select("*, learners(*), scenarios:target_scenario_id(*), indicators(*)")
        .eq("is_active", true);
      return data ?? [];
    },
  });

  const objective: any = objectives?.find((o: any) => String(o.objective_id) === objectiveId);
  const scenario = objective?.scenarios;
  const tasks: string[] = useMemo(() => {
    const t = scenario?.task_analysis_template;
    if (!t) return [];
    if (Array.isArray(t.steps)) return t.steps;
    if (Array.isArray(t)) return t;
    return [];
  }, [scenario]);

  const completedCount = Object.values(steps).filter((s) => s !== null).length;
  // IC = independent steps / total steps in active scenario template
  const independenceScore = useMemo(() => {
    if (tasks.length === 0) return 0;
    const independent = Object.values(steps).filter((s) => s === "independent").length;
    return independent / tasks.length;
  }, [steps, tasks.length]);

  const setStep = (idx: number, status: StepStatus) => {
    setSteps((prev) => ({ ...prev, [idx]: prev[idx] === status ? null : status }));
  };

  const submit = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      const { error } = await supabase.from("evidence_records").insert({
        objective_id: Number(objectiveId),
        evaluator_id: user.user?.id ?? "anonymous",
        independence_score: independenceScore,
        task_analysis_payload: { steps, tasks, completed: completedCount },
        context_verification_metadata: { scenario_id: scenario?.scenario_id, recorded_at: new Date().toISOString() },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`تم تسجيل الجلسة — معامل الاستقلالية الرقمي (IC) ${(independenceScore * 100).toFixed(0)}%`);
      setSteps({});
      qc.invalidateQueries({ queryKey: ["drc"] });
    },
    onError: (e: any) => toast.error("تعذّر التسجيل: " + e.message),
  });

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          المراقبة الميدانية
        </h1>
        <p className="text-sm text-muted-foreground">تتبّع تنفيذ المتعلم خطوة بخطوة داخل السيناريو النشط.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">الهدف النشط</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={objectiveId} onValueChange={(v) => { setObjectiveId(v); setSteps({}); }}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="اختر هدفاً للملاحظة الميدانية" /></SelectTrigger>
            <SelectContent>
              {objectives?.map((o: any) => (
                <SelectItem key={o.objective_id} value={String(o.objective_id)}>
                  {o.learners?.first_name} — {o.generated_iep_goal_ar.slice(0, 60)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {objective && (
            <div className="rounded-lg bg-muted/40 p-3 text-sm space-y-2">
              <p className="font-medium">{objective.generated_iep_goal_ar}</p>
              {scenario && (
                <Badge variant="secondary">السيناريو: {scenario.title_ar}</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {objective && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">قائمة المهام</CardTitle>
              <Badge variant="default" className="text-base">
                {(independenceScore * 100).toFixed(0)}%
              </Badge>
            </div>
            <Progress value={independenceScore * 100} className="h-2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                لم يُعرَّف تحليل مهام لهذا السيناريو بعد. أضف الخطوات في حقل <code>task_analysis_template</code> داخل جدول السيناريوهات.
              </div>
            )}
            {tasks.map((task, i) => {
              const status = steps[i] ?? null;
              return (
                <div key={i} className="rounded-xl border-2 p-3 space-y-3" data-status={status ?? "pending"}>
                  <div className="flex items-start gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
                    <p className="text-sm font-medium flex-1">{task}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="lg"
                      variant={status === "independent" ? "default" : "outline"}
                      onClick={() => setStep(i, "independent")}
                      className="h-12 text-xs"
                    >
                      <CheckCircle2 className="h-4 w-4 ml-1" />مستقل
                    </Button>
                    <Button
                      size="lg"
                      variant={status === "prompted" ? "default" : "outline"}
                      onClick={() => setStep(i, "prompted")}
                      className="h-12 text-xs"
                    >
                      تلميح
                    </Button>
                    <Button
                      size="lg"
                      variant={status === "assisted" ? "default" : "outline"}
                      onClick={() => setStep(i, "assisted")}
                      className="h-12 text-xs"
                    >
                      <HandHelping className="h-4 w-4 ml-1" />دعم كامل
                    </Button>
                  </div>
                </div>
              );
            })}
            {tasks.length > 0 && (
              <Button
                size="lg"
                className="w-full h-14 text-base"
                disabled={completedCount === 0 || submit.isPending}
                onClick={() => submit.mutate()}
              >
                {submit.isPending ? "جارٍ التسجيل..." : `تسجيل الجلسة (${completedCount}/${tasks.length})`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}