import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Compass,
  Target,
  Activity,
  ShieldCheck,
  Network,
  FileDown,
  Briefcase,
  Home,
  Users2,
  BookOpen,
  HeartPulse,
} from "lucide-react";
import { TransitionHelpAnchor } from "@/components/transition-help-anchor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مسار همم — بوصلة الانتقال إلى ما بعد المدرسة" },
      {
        name: "description",
        content:
          "منصة تساعد فرق التأهيل والأسر على دعم انتقال الشباب ذوي الإعاقة نحو حياة ذات معنى بعد التخرج عبر مجالات الحياة بعد المدرسة، ومسارات الانتقال، ومحطات التقدم، والسيناريوهات الواقعية.",
      },
      { property: "og:title", content: "مسار همم — بوصلة الانتقال إلى ما بعد المدرسة" },
      {
        property: "og:description",
        content:
          "بوابة الانتقال إلى ما بعد المدرسة ومحرك توصية مسار الدعم بعد التخرج عبر مجالات الحياة بعد المدرسة (D1–D5).",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              هم
            </div>
            <span className="font-semibold text-lg">مسار همم</span>
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            منصة مسار همم الانتقالية — بنية v4
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
            مسار همم: <span className="text-primary">بوصلة الانتقال</span> إلى ما بعد المدرسة
            <TransitionHelpAnchor term="مسار همم" className="mr-2 align-middle" />
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium">
            لدعم انتقال الشباب ذوي الإعاقة نحو
            <span className="text-foreground"> حياة ذات معنى بعد التخرج</span>.
            <TransitionHelpAnchor term="الحياة ذات المعنى بعد التخرج" className="mr-2" />
          </p>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
            تجعل كل هدف <strong className="text-foreground">خطوة نحو بناء المستقبل</strong> — تربط المنصة بين <strong className="text-foreground">مجالات الحياة بعد المدرسة</strong>،
            و<strong className="text-foreground">مسارات الانتقال</strong>،
            و<strong className="text-foreground">محطات التقدم</strong>،
            و<strong className="text-foreground">الأهداف الفردية</strong>،
            و<strong className="text-foreground">السيناريوهات الواقعية</strong>؛
            لتكوين صورة أوضح عن جاهزية المتعلم وخطوات دعمه القادمة.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                جرّب رحلة متعلم نموذجي
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg">
                تعرف على مسار همم
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations strip */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold inline-flex items-center gap-2 justify-center">
              مجالات الحياة بعد المدرسة (D1–D5)
              <TransitionHelpAnchor term="مجالات الحياة بعد المدرسة" />
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">
              المجالات الخمسة التي تنظر المنصة من خلالها إلى جاهزية المتعلم لحياة ذات معنى بعد التخرج.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <DestCard code="D1" icon={Briefcase} title="العمل والمشاركة الاقتصادية" />
            <DestCard code="D2" icon={Home} title="العيش المستقل وإدارة الحياة اليومية" />
            <DestCard code="D3" icon={Users2} title="المشاركة المجتمعية والانتماء" />
            <DestCard code="D4" icon={BookOpen} title="تقرير المصير والاختيار الشخصي" />
            <DestCard code="D5" icon={HeartPulse} title="جودة الحياة والرفاهية" />
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">ثلاث وحدات تشغيلية متكاملة</h2>
          <p className="mt-2 text-muted-foreground">
            من رصد الجاهزية الميدانية إلى توصية مسار الدعم بعد التخرج، إلى وثيقة الخطة الانتقالية الفردية.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={Network}
            title="محطات التقدم والسيناريوهات الواقعية"
            description="محطات التقدم الانتقالي موزّعة على مجالات الحياة بعد المدرسة، مع سيناريوهات واقعية (مقهى تدريبي، بيئة بيع رقمية، شقة مستقلة) لتوليد شواهد الأداء الميداني."
          />
          <FeatureCard
            icon={Compass}
            title="منشئ الخطة الانتقالية الفردية"
            description="مولّد الأهداف الفردية ضمن الخطة الانتقالية، متّبعاً مسار: المجال ← مسار الانتقال ← محطة التقدم ← مؤشر الجاهزية ← السيناريو الواقعي، مع متتبّع الإتقان والتعميم السياقي."
          />
          <FeatureCard
            icon={FileDown}
            title="وثيقة الخطة الانتقالية الفردية (ITP)"
            description="استخراج وثيقة الخطة الانتقالية الفردية للمتعلم جاهزة للاعتماد الرسمي، مع سجل مؤشر حماية جودة الحياة والكرامة."
          />
        </div>
      </section>

      {/* Engine cores */}
      <section className="border-t bg-card py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs">
                <Target className="h-3.5 w-3.5 text-primary" />
                نواة المحرك الذكي
              </div>
              <h2 className="text-3xl font-bold">
                بوابة الانتقال إلى ما بعد المدرسة ومحرك توصية مسار الدعم بعد التخرج
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                يحسب المحرك <strong className="text-foreground">معامل الاستقلالية (IC)</strong> من
                شواهد الأداء الميداني لحظياً، ثم يجمعه في
                <strong className="text-foreground"> معامل الجاهزية الانتقالية (DRC)</strong> لكل
                مجال من مجالات الحياة بعد المدرسة، وتُقيَّم بوابة الانتقال لتقديم توصية مسار الدعم
                المناسب بعد التخرج عند بلوغ نافذة الانتقال (+16).
              </p>
              <ul className="space-y-2 text-sm">
                <Bullet text="مؤشر حماية جودة الحياة والكرامة: تجميد التوجيه الإنتاجي عند تدني D5." />
                <Bullet text="تنبيهات تلقائية لاعتماد السيناريوهات الواقعية في البيئات المجتمعية." />
                <Bullet text="متنبئات النجاح المعتمدة دولياً مدمجة في التدقيق المؤسسي." />
              </ul>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-6">
              <div className="space-y-3">
                {["D1 العمل والمشاركة الاقتصادية","D2 العيش المستقل وإدارة الحياة اليومية","D3 المشاركة المجتمعية والانتماء","D4 تقرير المصير والاختيار الشخصي","D5 جودة الحياة والرفاهية"].map((d, i) => (
                  <div key={d} className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{d}</span>
                      <span className="font-mono">{[82,64,71,55,88][i]}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${[82,64,71,55,88][i]}%` }} />
                    </div>
                  </div>
                ))}
                <p className="text-[11px] text-muted-foreground pt-2 text-center">
                  عيّنة بصرية لمعامل الجاهزية الانتقالية (DRC) لكل مجال حياتي
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">جاهز لتفعيل بوابة الانتقال إلى ما بعد المدرسة في مؤسستك؟</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            أنشئ حساباً وفعّل المؤسسة النموذجية لتجربة ثلاثة متعلمين نموذجيين خلال 60 ثانية.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2">
                أنشئ حساب مجاني
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 مسار همم — Himam Transition Engine. جميع الحقوق محفوظة.</p>
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
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function DestCard({ code, icon: Icon, title }: { code: string; icon: any; title: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <Icon className="h-6 w-6 mx-auto text-primary" />
      <p className="mt-2 font-mono text-xs text-muted-foreground">{code}</p>
      <p className="font-semibold text-sm">{title}</p>
    </div>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <Activity className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <span>{text}</span>
    </li>
  );
}

