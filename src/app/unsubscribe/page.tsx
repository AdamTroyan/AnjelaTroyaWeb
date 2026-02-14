import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "הסרת הרשמה להתראות | ANJELA TROYA",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnsubscribePageProps = {
  searchParams?: { token?: string };
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const token = searchParams?.token ?? "";

  let message: React.ReactNode;

  if (!token) {
    message = (
      <p className="text-sm text-slate-600">לא נמצא מזהה להסרה.</p>
    );
  } else {
    const alert = await prisma.propertyAlert.findUnique({
      where: { unsubscribeToken: token },
      select: { email: true },
    });

    if (alert?.email) {
      await prisma.suppressionEmail.deleteMany({ where: { email: alert.email } });
    }

    const result = await prisma.propertyAlert.deleteMany({
      where: { unsubscribeToken: token },
    });

    if (result.count > 0) {
      message = (
        <div className="space-y-2 text-sm text-slate-600">
          <p>בוטלה הרשמתך לקבלת התראות על נכסים.</p>
          <p>לא יישלחו אליך הודעות נוספות.</p>
          <p>אם ברצונך להירשם מחדש, ניתן לבצע זאת דרך האתר בכל עת.</p>
        </div>
      );
    } else {
      message = (
        <p className="text-sm text-slate-600">ההתראה כבר הוסרה או שהקישור לא תקין.</p>
      );
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">הסרת הרשמה להתראות</h1>
        <div className="mt-4">{message}</div>
      </div>
    </section>
  );
}
