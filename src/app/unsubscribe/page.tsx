
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "הסרת הרשמה להתראות | ANJELA TROYA",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnsubscribePageProps = {
  searchParams?: Promise<{ token?: string; done?: string }>;
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params?.token ?? "";
  const done = params?.done === "1";

  async function handleUnsubscribe() {
    "use server";
    if (!token) return;
    const alert = await prisma.propertyAlert.findUnique({
      where: { unsubscribeToken: token },
      select: { email: true },
    });
    if (alert?.email) {
      await prisma.suppressionEmail.deleteMany({ where: { email: alert.email } });
    }
    await prisma.propertyAlert.deleteMany({
      where: { unsubscribeToken: token },
    });
    redirect(`/unsubscribe?done=1`);
  }

  let content: React.ReactNode;

  if (done) {
    content = (
      <div className="space-y-2 text-sm text-slate-600">
        <p>בוטלה הרשמתך לקבלת התראות על נכסים.</p>
        <p>לא יישלחו אליך הודעות נוספות.</p>
        <p>אם ברצונך להירשם מחדש, ניתן לבצע זאת דרך האתר בכל עת.</p>
      </div>
    );
  } else if (!token) {
    content = (
      <p className="text-sm text-slate-600">לא נמצא מזהה להסרה.</p>
    );
  } else {
    content = (
      <form action={handleUnsubscribe}>
        <p className="text-sm text-slate-600 mb-4">האם להסיר את ההרשמה להתראות?</p>
        <button type="submit" className="rounded bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700 transition-colors">
          אשר הסרה
        </button>
      </form>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">הסרת הרשמה להתראות</h1>
        <div className="mt-4">{content}</div>
      </div>
    </section>
  );
}
