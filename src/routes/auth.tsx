import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              مسارهمم
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              محرك الانتقال الرقمي
            </p>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">مرحباً بك</CardTitle>
            <CardDescription className="text-center">
              سجل دخولك أو أنشئ حساب جديد للبدء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
                <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="mt-4">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register" className="mt-4">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success("تم تسجيل الدخول بنجاح");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">البريد الإلكتروني</Label>
        <Input
          id="login-email"
          type="email"
          placeholder="example@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          dir="ltr"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">كلمة المرور</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          dir="ltr"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "تسجيل الدخول"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) toast.error(error.message);
    else toast.success("تم إنشاء الحساب بنجاح! تحقق من بريدك لتفعيل الحساب");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">الاسم الكامل</Label>
        <Input
          id="register-name"
          type="text"
          placeholder="محمد أحمد"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-email">البريد الإلكتروني</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="example@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          dir="ltr"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="register-password">كلمة المرور</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          dir="ltr"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "إنشاء حساب"}
      </Button>
    </form>
  );
}
