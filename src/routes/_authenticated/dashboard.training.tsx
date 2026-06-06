import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Play, Clock, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/training")({
  component: TrainingPage,
});

function TrainingPage() {
  const { data: modules } = useQuery({
    queryKey: ["training-modules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("training_modules")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  const { data: progress } = useQuery({
    queryKey: ["training-progress"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      const { data } = await supabase
        .from("training_progress")
        .select("*")
        .eq("user_id", user.user.id);
      return data ?? [];
    },
  });

  const getProgress = (moduleId: string) => {
    const p = progress?.find((x: any) => x.module_id === moduleId);
    return p?.progress ?? 0;
  };

  const categories = [...new Set(modules?.map((m: any) => m.category) ?? [])];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تدريب الفريق والأسرة</h1>
        <p className="text-muted-foreground">وحدات إرشادية للفريق والأسرة.</p>
      </div>

      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules
              ?.filter((m: any) => m.category === category)
              .map((m: any) => (
                <Card key={m.id} className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      {getProgress(m.id) === 100 && (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          مكتمل
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base">{m.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{m.description || ""}</p>
                    <Progress value={getProgress(m.id)} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {m.duration_minutes ? `${m.duration_minutes} دقيقة` : "غير محدد"}
                      </span>
                      <span>{getProgress(m.id)}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-primary">
                      <Play className="h-4 w-4" />
                      {getProgress(m.id) === 0 ? "ابدأ الآن" : "استمر"}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}

      {modules?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>لا توجد وحدات تدريب متاحة حالياً</p>
        </div>
      )}
    </div>
  );
}
