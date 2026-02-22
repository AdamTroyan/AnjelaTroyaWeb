import { prisma } from "@/lib/prisma";
import PropertyMap from "@/components/PropertyMap";
import ContactWhatsApp from "./ContactWhatsApp";

export const runtime = "nodejs";

export default async function ContactPage() {
  const properties = await prisma.property.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      address: true,
      latitude: true,
      longitude: true,
    },
  });

  const markers = properties
    .filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number")
    .filter((item) => {
      const lat = item.latitude as number;
      const lon = item.longitude as number;
      const inAshkelonBox = lat >= 31.60 && lat <= 31.72 && lon >= 34.50 && lon <= 34.65;
      if (inAshkelonBox) {
        return true;
      }
      const address = (item.address ?? "").toLowerCase();
      return address.includes("אשקלון") || address.includes("ashkelon");
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      address: item.address ?? null,
      latitude: item.latitude as number,
      longitude: item.longitude as number,
      href: `/properties/${item.id}`,
    }));

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">צור קשר</h1>
          <p className="mt-4 text-base text-slate-600">
            רוצים לשמוע עוד, לתאם סיור או לקבל הערכת שווי? השאירו פרטים ואחזור אליכם בהקדם.
          </p>
          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p>טלפון: 054-317-9762</p>
            <p>אימייל: adamtroy@gmail.com</p>
            <p>מיקום פעילות: אשקלון</p>
          </div>
        </div>
        <ContactWhatsApp
          title="שליחת הודעה ב-WhatsApp"
          body="כפתור אחד ואתם ישירות אצלי ב-WhatsApp"
          buttonLabel="פתיחת WhatsApp"
        />
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">אזורי פעילות</h2>
            <p className="mt-2 text-sm text-slate-600">
              אשקלון בלבד - זמינות גבוהה לפגישות וסיורים בעיר.
            </p>
          </div>
          <a
            className="text-sm font-semibold text-slate-600"
            href="https://www.google.com/maps?q=Ashkelon"
            target="_blank"
            rel="noreferrer"
          >
            לפתיחה במפות
          </a>
        </div>
        <div className="mt-6">
          <PropertyMap markers={markers} height="360px" />
        </div>
      </div>
    </section>
  );
}
