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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مسارهمم — محرك الانتقال للحياة المستقلة والوكالة المهنية لذوي الإعاقة" },
      {
        name: "description",
        content:
          "منصة متخصصة لتأهيل اليافعين والشباب من ذوي الإعاقة للانتقال نحو الحياة المستقلة والوكالة المهنية عبر محطات الجاهزية، ورشة المخطط التأهيلي، ووثائق الانتقال المعتمدة (ITP).",
      },
      { property: "og:title", content: "مسارهمم — محرك الانتقال للحياة المستقلة" },
      {
        property: "og:description",
        content:
          "بوابة الخروج التكيفية ومحرك توصيات مسارات الرشد عبر وجهات الحياة الثابتة (D1–D5).",
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            بنية v3 — حوكمة الانتقال إلى الرشد
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            الانتقال إلى
            <span className="text-primary"> الحياة المستقلة </span>
            والوكالة المهنية
            <br />
            <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl font-semibold">
              لليافعين والشباب من ذوي الإعاقة
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            منصة عملياتية متخصصة تربط <strong className="text-foreground">محطات الجاهزية الـ22</strong> بـ
            <strong className="text-foreground"> وجهات الرشد الثابتة (D1–D5)</strong>، وتقود بوابة الخروج التكيفية
            ومحرك توصيات مسارات الرشد بأدلة حقيقية من البيئة المهنية والمجتمعية — لا شعارات
            عمومية للتحول الرقمي.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                ابدأ رحلة الانتقال
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg">
                جرّب كمتعلم افتراضي
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations strip */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold">وجهات الرشد الثابتة (D1–D5)</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              الغايات النهائية للحياة المستقلة التي يقيس المحرك جاهزية المتعلم نحوها لحظياً.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <DestCard code="D1" icon={Briefcase} title="العمل والإنتاج" />
            <DestCard code="D2" icon={Home} title="السكن المستقل" />
            <DestCard code="D3" icon={Users2} title="المشاركة المجتمعية" />
            <DestCard code="D4" icon={BookOpen} title="التعلم مدى الحياة" />
            <DestCard code="D5" icon={HeartPulse} title="الرفاهية والصحة" />
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">ثلاث وحدات تشغيلية متكاملة</h2>
          <p className="mt-2 text-muted-foreground">
            من رصد الجاهزية الميدانية إلى توصية المسار، إلى الوثيقة المعتمدة.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureCard
            icon={Network}
            title="محطات الجاهزية والسيناريوهات"
            description="22 محطة انتقال موزّعة على 5 وجهات رشد، مع سيناريوهات غامرة (مقهى تدريبي، بيئة بيع رقمية، شقة مستقلة) لتوليد الأدلة العملياتية."
          />
          <FeatureCard
            icon={Compass}
            title="ورشة المخطط التأهيلي"
            description="مولّد الأهداف الفردية المشتقة حوكمياً، متّبعاً مسار الوجهة → المسار النمائي → المحطة → المؤشر → السيناريو، مع متتبّع الإتقان والتعميم السياقي."
          />
          <FeatureCard
            icon={FileDown}
            title="وثائق الانتقال المعتمدة (ITP)"
            description="استخراج وثيقة الانتقال المعتمدة والموحدة للطالب (ITP) جاهزة للاعتماد الرسمي، مع سجل صمام الأمان الحوكمي وحارس الكرامة (Rule 4)."
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
                بوابة الخروج التكيفية ومحرك توصيات مسارات الرشد
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                يحسب المحرك <strong className="text-foreground">معامل الاستقلالية الرقمي (IC)</strong> من
                ملاحظات الميدان لحظياً، ثم يجمعه في <strong className="text-foreground">معاملات الجاهزية
                التراكمية (DRC)</strong> لكل وجهة رشد، وتُقيَّم بوابة الخروج التلقائية لتوصية أحد مسارات
                الرشد الستة عند بلوغ نافذة الانتقال الحرجة (+16).
              </p>
              <ul className="space-y-2 text-sm">
                <Bullet text="حارس الكرامة (Rule 4 Enforcer): تجميد التوجيه الإنتاجي عند تدني D5 < 0.50." />
                <Bullet text="تنبيهات حوكمية تلقائية لاعتماد البيئات المجتمعية الحقيقية (CBI)." />
                <Bullet text="متنبئات النجاح لـ NTACT:C مدمجة في التدقيق المؤسسي." />
              </ul>
            </div>
            <div className="rounded-2xl border bg-gradient-to-br from-primary/10 to-transparent p-6">
              <div className="space-y-3">
                {["D1 العمل والإنتاج","D2 السكن المستقل","D3 المشاركة المجتمعية","D4 التعلم مدى الحياة","D5 الرفاهية والصحة"].map((d, i) => (
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
                  عيّنة بصرية لمعاملات الجاهزية التراكمية DRC
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">جاهز لتفعيل بوابة الخروج التكيفية في مؤسستك؟</h2>
          <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
            أنشئ حساباً وفعّل المؤسسة التجريبية لعرض ثلاثة متعلمين افتراضيين خلال 60 ثانية.
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
          <p>© 2026 مسارهمم — Himam Transition Engine. جميع الحقوق محفوظة.</p>
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

