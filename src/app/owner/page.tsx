import OwnerLeadCard from "@/components/OwnerLeadCard";

export const metadata = {
  title: "מעוניין למכור/להשכיר | ANJELA TROYA",
};

export default function OwnerLeadPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">מעוניין למכור/להשכיר?</h1>
        <p className="mt-3 text-sm text-slate-600">
          השאירו פרטים קצרים ונחזור אליכם במהירות. אפשר גם ליצור קשר ישיר.
        </p>
        <div className="mt-6">
          <OwnerLeadCard />
        </div>
      </div>
    </section>
  );
}
