"use client";

const WHATSAPP_NUMBER = "972547650236";
const WHATSAPP_MESSAGE = "שלום, הגעתי אלייך דרך האתר שלך, אני רוצה לברר לגבי קנייה/השכרה";

type ContactWhatsAppProps = {
  title: string;
  body: string;
  buttonLabel: string;
};

export default function ContactWhatsApp({ title, body, buttonLabel }: ContactWhatsAppProps) {
  const handleWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_MESSAGE
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm text-slate-600">{body}</p>
      <button
        className="mt-6 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        type="button"
        onClick={handleWhatsApp}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
