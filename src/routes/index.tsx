import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  FolderKanban,
  GraduationCap,
  Shield,
  Users,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Himam Transition Engine - محرك مسارهمم للانتقال" },
      { name: "description", content: "منصة متكاملة للتحول الرقمي - تقييم، إدارة مشاريع، وتدريب" },
      { property: "og:title", content: "Himam Transition Engine" },
      { property: "og:description", content: "منصة متكاملة للتحول الرقمي" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              هم
            </div>
            <span className="font-semibold text-lg">مسارهمم</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">تسجيل الدخول</Button>
            </Link>
            <Link to="/auth">
              <Button>ابدأ الآن</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            محرك
            <span className="text-primary"> مسارهمم </span>
            للانتقال الرقمي
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            منصة متكاملة لتقييم جاهزية مؤسستك للتحول الرقمي، إدارة مشاريع الانتقال،
            وتطوير كفاءات فريقك — كل ذلك في مكان واحد.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                ابدأ رحلتك
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              تعرف أكثر
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">كل ما تحتاجه للتحول الرقمي</h2>
            <p className="mt-2 text-muted-foreground">ثلاث ركائز أساسية لنجاح رحلتك</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={BarChart3}
              title="تقييم النضج الرقمي"
              description="استبيانات متقدمة لقياس جاهزية مؤسستك وتحديد الفجوات والفرص."
            />
            <FeatureCard
              icon={FolderKanban}
              title="إدارة المشاريع"
              description="تتبع مبادرات التحول، توزيع المهام، ومراقبة التقدم لحظياً."
            />
            <FeatureCard
              icon={GraduationCap}
              title="التدريب والتطوير"
              description="محتوى تعليمي مخصص لتطوير مهارات فريقك في مجال التحول الرقمي."
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">لماذا مسارهمم؟</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <BenefitCard icon={Shield} title="أمان متكامل" text="حماية البيانات على مستوى المؤسسات" />
          <BenefitCard icon={Users} title="تعاون فعال" text="فرق العمل في بيئة موحدة" />
          <BenefitCard icon={Zap} title="تنفيذ سريع" text="بدء التقييم في دقائق" />
          <BenefitCard icon={BarChart3} title="رؤى دقيقة" text="تقارير تحليلية مفصلة" />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">ابدأ رحلة التحول الرقمي اليوم</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            انضم لمئات المؤسسات التي تستخدم مسارهمم لتسريع رحلتها نحو التحول الرقمي.
          </p>
          <div className="mt-8">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                أنشئ حساب مجاني
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 Himam Transition Engine. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <Icon className="h-8 w-8 text-primary mb-3" />
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

