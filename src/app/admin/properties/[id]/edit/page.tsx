import { notFound, redirect } from "next/navigation";
import { getUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProperty } from "@/app/admin/dashboard/actions";
import EditPropertyForm from "./EditPropertyForm";

export const runtime = "nodejs";

type EditPropertyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const user = await getUserFromCookies();
  if (user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    notFound();
  }

  const details = Array.isArray(property.details)
    ? property.details.filter(
        (item): item is { label: string; value: string } =>
          typeof item === "object" &&
          item !== null &&
          "label" in item &&
          "value" in item &&
          typeof (item as { label?: unknown }).label === "string" &&
          typeof (item as { value?: unknown }).value === "string"
      )
    : [];

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">עריכת נכס</h1>
        <p className="mt-2 text-sm text-slate-600">עדכן פרטי נכס ותמונות.</p>

        <EditPropertyForm
          action={updateProperty}
          property={{
            id: property.id,
            title: property.title,
            description: property.description,
            price: property.price,
            type: property.type,
            isActive: property.isActive,
            isHot: property.isHot,
            imageUrls: property.imageUrls,
            status: property.status,
            details,
            address: property.address,
          }}
        />
      </div>
    </section>
  );
}
