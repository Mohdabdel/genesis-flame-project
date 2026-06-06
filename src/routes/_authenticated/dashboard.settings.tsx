import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, User, Phone, Briefcase, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile-settings"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user.user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        setJobTitle(data.job_title || "");
      }
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone, job_title: jobTitle })
        .eq("id", user.user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("تم حفظ التغييرات بنجاح");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إعدادات المؤسسة والصلاحيات</h1>
        <p className="text-muted-foreground">إدارة ملفك المهني وبيانات المؤسسة وصلاحيات استخدام المنصة.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            الملف المهني
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {(profile?.full_name || "U")[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.full_name || "المستخدم"}</p>
              <p className="text-sm text-muted-foreground">{profile?.organizations?.name || "غير مرتبط بمؤسسة"}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="محمد أحمد"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">الدور المهني</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="مشرف تربوي / أخصائي انتقال"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966 50 000 0000"
                dir="ltr"
              />
            </div>
          </div>

          <Button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {updateProfile.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
          </Button>
        </CardContent>
      </Card>

      {profile?.organizations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              المؤسسة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">اسم المؤسسة</span>
              <span className="font-medium">{profile.organizations.name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">المجال</span>
              <span className="font-medium">{profile.organizations.industry || "غير محدد"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">الحجم</span>
              <span className="font-medium">{profile.organizations.size || "غير محدد"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">الموقع</span>
              <span className="font-medium">{profile.organizations.website || "غير محدد"}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!profile?.organizations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
            إنشاء مؤسسة انتقالية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateOrgForm />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CreateOrgForm() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const queryClient = useQueryClient();

  const createOrg = useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();
      const { data: org, error: orgError } = await supabase
        .from("organizations")
        .insert({ name, slug, industry, size })
        .select()
        .single();
      if (orgError) throw orgError;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ organization_id: org.id, is_org_admin: true })
        .eq("id", user.user.id);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile-settings"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("تم إنشاء المؤسسة بنجاح");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">أنشئ مؤسسة لاستخدام مسار همم مع المتعلمين</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>اسم المؤسسة</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مركز همم للتأهيل الانتقالي" />
        </div>
        <div className="space-y-2">
          <Label>نوع المؤسسة</Label>
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="التأهيل الانتقالي وخدمات ذوي الإعاقة" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>حجم المؤسسة</Label>
          <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder="50–200 عضو فريق" />
        </div>
      </div>
      <Button
        onClick={() => createOrg.mutate()}
        disabled={!name || createOrg.isPending}
      >
        {createOrg.isPending ? "جاري الإنشاء..." : "إنشاء المؤسسة"}
      </Button>
    </div>
  );
}
