import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard/guidebook")({
  component: GuidebookPage,
});

function GuidebookPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      <header>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          دليل التطبيق والإرشاد
          <span className="text-sm text-muted-foreground font-normal" dir="ltr">
            / مركز موارد المنصة
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مرجع مبسّط للأسر والمختصين لاستخدام منصة مسار همم بصورة سليمة وموجّهة نحو
          الحياة بعد التخرج.
        </p>
      </header>

      {/* Golden Rule callout */}
      <Card className="border-2 border-primary bg-gradient-to-l from-primary/10 via-primary/5 to-transparent">
        <CardContent className="py-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-primary mb-1">
              القاعدة الذهبية للمنصة
            </p>
            <p className="text-base font-bold leading-relaxed">
              لا تكتب هدفًا منفصلًا عن الحياة. كل هدف يجب أن يجيب عن سؤال:
              <br />
              <span className="text-primary">
                كيف يساعد هذا الهدف المتعلم على حياة أفضل بعد التخرج؟
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="family" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="family" className="gap-2">
            <Heart className="h-4 w-4" /> دليل الأسرة
          </TabsTrigger>
          <TabsTrigger value="specialist" className="gap-2">
            <Users className="h-4 w-4" /> دليل المختص
          </TabsTrigger>
        </TabsList>

        <TabsContent value="family" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-rose-500" />
                دليل الأسرة المبسّط: كيف أقرأ المنصة؟
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed">
              <Section title="ماذا تعني هذه المنصة لأسرتي؟">
                <p>
                  منصة <strong>مسار همم</strong> هي بوصلة تساعد فريق التأهيل والأسرة معاً
                  على تنظيم رحلة ابنكم نحو حياة ذات معنى بعد التخرج من المدرسة. لا تركّز
                  على الدرجات الأكاديمية وحدها، بل على جاهزيته للعمل، والحياة اليومية،
                  والمشاركة المجتمعية، والاختيار الشخصي، وجودة حياته العامة.
                </p>
              </Section>
              <Section title="ما الذي تحتاج الأسرة معرفته؟">
                <Bullets
                  items={[
                    "كل هدف نراه في المنصة هو خطوة عملية نحو حياة أفضل بعد التخرج، وليس مجرد مهارة منعزلة.",
                    "النجاح لا يقاس فقط بقدرة المتعلم على العمل، بل أيضاً براحته وكرامته وعلاقاته ومشاركته في القرارات.",
                    "وجود مؤشر منخفض في جانب معيّن ليس حكماً نهائياً، بل دعوة للتعاون مع الفريق لتعديل الخطة.",
                    "صوت الأسرة جزء أساسي من القرار، خصوصاً عند الاقتراب من نافذة الانتقال (16 سنة فأكثر).",
                  ]}
                />
              </Section>
              <Section title="كيف تشارك الأسرة في المنصة؟">
                <Bullets
                  items={[
                    "اطّلعوا على مجالات الحياة الخمسة بعد المدرسة، وحدّدوا ما الذي تتمنّونه لابنكم في كل مجال.",
                    "شاركوا الفريق ملاحظاتكم اليومية من المنزل والمجتمع — فهي شواهد لا تقلّ أهمية عن الملاحظة المدرسية.",
                    "اسألوا عن توصية مسار الدعم بعد التخرج، وتذكّروا أنها اقتراح يُبنى معكم لا قرار مفروض عليكم.",
                    "احرصوا على مراجعة وثيقة الخطة الانتقالية الفردية (ITP) قبل اعتمادها.",
                  ]}
                />
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialist" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5 text-primary" />
                دليل المختص المبسّط: كيف أستخدم المنصة؟
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-relaxed">
              <Section title="قبل كتابة الأهداف">
                <Bullets
                  items={[
                    "حدّد المجال المستهدف من مجالات الحياة بعد المدرسة (D1–D5) وفق احتياج المتعلم وعمره.",
                    "اختر مسار الانتقال ثم محطة التقدم المناسبة، ولا تقفز مباشرة إلى الهدف المهاري.",
                    "تأكّد أن المؤشر المختار من «مؤشرات الجاهزية حسب المرحلة العمرية».",
                    "اربط الهدف دائماً بسيناريو واقعي قابل للملاحظة، لا بمحاكاة صفّية فقط.",
                  ]}
                />
              </Section>
              <Section title="أثناء تدريب الهدف">
                <Bullets
                  items={[
                    "سجّل شواهد الأداء الميداني خطوة بخطوة، مع تصنيف مستوى الدعم (مستقل / تلميح / دعم كامل).",
                    "احرص على تكرار التدريب في أكثر من سيناريو لضمان التعميم السياقي.",
                    "راقب معامل الاستقلالية (IC) لكل جلسة، وليس فقط المتوسط الكلي.",
                    "احترم مؤشر حماية جودة الحياة والكرامة: إذا انخفض D5 جوهرياً جمّد التوجيه الإنتاجي مؤقتاً.",
                  ]}
                />
              </Section>
              <Section title="بعد الملاحظة الميدانية">
                <Bullets
                  items={[
                    "راجع معامل الجاهزية الانتقالية (DRC) لكل مجال، لا الهدف منفرداً.",
                    "ناقش توصية مسار الدعم بعد التخرج مع الفريق والأسرة قبل أي قرار رسمي.",
                    "حدّث وثيقة الخطة الانتقالية الفردية (ITP) عند كل تغيّر جوهري في الشواهد.",
                    "وثّق تنبيهات جودة الخطة واتّخذ إجراءً واضحاً تجاه كل تنبيه نشط.",
                  ]}
                />
              </Section>
              <Section title="القاعدة الذهبية للمختص">
                <p className="rounded-lg border-r-4 border-primary bg-primary/5 p-3 text-foreground">
                  لا تكتب هدفاً منفصلاً عن الحياة. كل هدف يجب أن يجيب عن سؤال:
                  <strong> كيف يساعد هذا الهدف المتعلم على حياة أفضل بعد التخرج؟</strong>
                </p>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <div className="text-foreground/90">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pr-4 list-disc marker:text-primary">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  );
}
