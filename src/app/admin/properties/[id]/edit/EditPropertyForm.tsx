"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type PropertyDetailsItem = {
  label: string;
  value: string;
};

type EditPropertyFormProps = Readonly<{
  action: (formData: FormData) => void;
  property: {
    id: string;
    title: string;
    description: string;
    price: string;
    type: "SALE" | "RENT";
    isActive: boolean;
    isHot: boolean;
    imageUrls: string[];
    status: "AVAILABLE" | "SOLD" | "RENTED";
    details: PropertyDetailsItem[];
    address: string | null;
  };
}>;

const propertyTypeOptions = [
  "דירה",
  "בית פרטי",
  "פנטהאוז",
  "דופלקס",
  "מגרש",
  "אחר",
];

const conditionOptions = ["חדש", "משופץ", "שמור", "צריך שיפוץ"];

const additionOptions = [
  "מרפסת",
  "גינה",
  "מחסן",
  "חניה פרטית",
  "ממ״ד",
  "יחידת דיור",
  "חדר ארונות",
  "אחר",
];

function getDetailValue(details: PropertyDetailsItem[], label: string) {
  return details.find((item) => item.label === label)?.value ?? "";
}

function parseSizePart(value: string, label: string) {
  const match = value.match(new RegExp(`${label}\\s*:\\s*([^,]+)`));
  return match?.[1]?.trim() ?? "";
}

function parseBuildingPart(value: string, label: string) {
  const match = value.match(new RegExp(`${label}\\s*:\\s*([^,]+)`));
  return match?.[1]?.trim() ?? "";
}

export default function EditPropertyForm({ action, property }: EditPropertyFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState(property.status);
  const [address, setAddress] = useState(property.address ?? "");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const initialSize = getDetailValue(property.details, "גודל");
  const initialBuilding = getDetailValue(property.details, "בניין וסביבה");
  const initialAdditions = getDetailValue(property.details, "תוספות");
  const initialType = getDetailValue(property.details, "סוג הנכס");

  const [neighborhood, setNeighborhood] = useState(
    getDetailValue(property.details, "שכונה") ||
      getDetailValue(property.details, "מיקום")
  );
  const [propertyType, setPropertyType] = useState(
    initialType.startsWith("אחר") ? "אחר" : initialType
  );
  const [propertyTypeOther, setPropertyTypeOther] = useState(
    initialType.startsWith("אחר") ? initialType.replace("אחר - ", "") : ""
  );
  const [builtSqm, setBuiltSqm] = useState(parseSizePart(initialSize, "מ\"ר בנוי"));
  const [balconySqm, setBalconySqm] = useState(parseSizePart(initialSize, "מ\"ר מרפסת"));
  const [lotSqm, setLotSqm] = useState(parseSizePart(initialSize, "שטח מגרש"));
  const [rooms, setRooms] = useState(getDetailValue(property.details, "מספר חדרים"));
  const [floor, setFloor] = useState(getDetailValue(property.details, "קומה"));
  const [airDirections, setAirDirections] = useState(getDetailValue(property.details, "כיווני אוויר"));
  const [condition, setCondition] = useState(getDetailValue(property.details, "מצב הנכס"));
  const [parking, setParking] = useState(getDetailValue(property.details, "חניה"));

  const [additions, setAdditions] = useState<string[]>(() =>
    initialAdditions
      ? initialAdditions.split(",").map((part) => part.trim()).filter(Boolean)
      : []
  );
  const [additionOther, setAdditionOther] = useState(() => {
    const other = additions.find((item) => item.startsWith("אחר"));
    return other ? other.replace("אחר - ", "").replace("אחר", "").trim() : "";
  });

  const [lobby, setLobby] = useState(parseBuildingPart(initialBuilding, "לובי"));
  const [maintenance, setMaintenance] = useState(parseBuildingPart(initialBuilding, "תחזוקה"));
  const [committee, setCommittee] = useState(parseBuildingPart(initialBuilding, "ועד בית"));
  const [neighbors, setNeighbors] = useState(parseBuildingPart(initialBuilding, "שכנים"));
  const [noise, setNoise] = useState(parseBuildingPart(initialBuilding, "שקט/רעש"));
  const [buildingOther, setBuildingOther] = useState(parseBuildingPart(initialBuilding, "אחר"));
  const [view, setView] = useState(getDetailValue(property.details, "נוף"));
  const [priceTerms, setPriceTerms] = useState(getDetailValue(property.details, "מחיר ותנאים"));
  const [fitFor, setFitFor] = useState(getDetailValue(property.details, "למי זה מתאים"));

  const details = useMemo<PropertyDetailsItem[]>(() => {
    const items: PropertyDetailsItem[] = [];
    if (neighborhood) items.push({ label: "שכונה", value: neighborhood });

    if (propertyType) {
      const typeValue =
        propertyType === "אחר" && propertyTypeOther
          ? `${propertyType} - ${propertyTypeOther}`
          : propertyType;
      items.push({ label: "סוג הנכס", value: typeValue });
    }

    const sizeParts: string[] = [];
    if (builtSqm) sizeParts.push(`מ"ר בנוי: ${builtSqm}`);
    if (balconySqm) sizeParts.push(`מ"ר מרפסת: ${balconySqm}`);
    if (lotSqm) sizeParts.push(`שטח מגרש: ${lotSqm}`);
    if (sizeParts.length > 0) {
      items.push({ label: "גודל", value: sizeParts.join(", ") });
    }

    if (rooms) items.push({ label: "מספר חדרים", value: rooms });
    if (floor) items.push({ label: "קומה", value: floor });
    if (airDirections) items.push({ label: "כיווני אוויר", value: airDirections });
    if (condition) items.push({ label: "מצב הנכס", value: condition });
    if (parking) items.push({ label: "חניה", value: parking });

    if (additions.length > 0) {
      const additionValue = additions.includes("אחר") && additionOther
        ? [...additions.filter((item) => item !== "אחר"), `אחר - ${additionOther}`]
        : additions;
      items.push({ label: "תוספות", value: additionValue.join(", ") });
    }

    const buildingParts: string[] = [];
    if (lobby) buildingParts.push(`לובי: ${lobby}`);
    if (maintenance) buildingParts.push(`תחזוקה: ${maintenance}`);
    if (committee) buildingParts.push(`ועד בית: ${committee}`);
    if (neighbors) buildingParts.push(`שכנים: ${neighbors}`);
    if (noise) buildingParts.push(`שקט/רעש: ${noise}`);
    if (buildingOther) buildingParts.push(`אחר: ${buildingOther}`);
    if (buildingParts.length > 0) {
      items.push({ label: "בניין וסביבה", value: buildingParts.join(", ") });
    }

    if (view) items.push({ label: "נוף", value: view });
    if (priceTerms) items.push({ label: "מחיר ותנאים", value: priceTerms });
    if (fitFor) items.push({ label: "למי זה מתאים", value: fitFor });

    return items;
  }, [
    neighborhood,
    propertyType,
    propertyTypeOther,
    builtSqm,
    balconySqm,
    lotSqm,
    rooms,
    floor,
    airDirections,
    condition,
    parking,
    additions,
    additionOther,
    lobby,
    maintenance,
    committee,
    neighbors,
    noise,
    buildingOther,
    view,
    priceTerms,
    fitFor,
  ]);

  const toggleAddition = (value: string) => {
    setAdditions((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const getFocusableElements = (container: HTMLElement | null) => {
    if (!container) {
      return [] as HTMLElement[];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        "button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])"
      )
    ).filter((element) => !element.hasAttribute("disabled"));
  };

  useEffect(() => {
    if (!isOpen) {
      triggerRef.current?.focus();
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(dialogRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  return (
    <>
      <form
        className="mt-8 grid gap-4"
        action={action}
        onChange={() => setIsDirty(true)}
        onSubmit={() => setIsDirty(false)}
      >
        <input type="hidden" name="id" value={property.id} />
        <input type="hidden" name="details" value={JSON.stringify(details)} />
        <input type="hidden" name="status" value={status} />
        <input
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          aria-label="כותרת"
          name="title"
          placeholder="כותרת"
          defaultValue={property.title}
          required
        />
        <div className="grid gap-3">
          <input
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            aria-label='כתובת: "רחוב+מספר בית"'
            name="address"
            placeholder='כתובת: "רחוב+מספר בית"'
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          {address.trim().length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title="תצוגת כתובת"
                src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
                className="h-56 w-full"
                loading="lazy"
              />
            </div>
          ) : null}
        </div>
        <textarea
          className="min-h-[120px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          aria-label="תיאור"
          name="description"
          placeholder="תיאור"
          defaultValue={property.description}
          required
        />
        <button
          className="w-fit rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
          type="button"
          onClick={() => setIsOpen(true)}
          ref={triggerRef}
        >
          פרמטרים
        </button>
        <button
          className={
            status === "AVAILABLE"
              ? "w-fit rounded-xl border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-400"
              : "w-fit rounded-xl border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:border-emerald-400"
          }
          type="button"
          onClick={() => {
            setIsDirty(true);
            setStatus((current) => {
              if (current !== "AVAILABLE") {
                return "AVAILABLE";
              }
              return property.type === "SALE" ? "SOLD" : "RENTED";
            });
          }}
        >
          {status === "AVAILABLE"
            ? property.type === "SALE"
              ? "נמכר"
              : "הושכר"
            : "זמין"}
        </button>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            aria-label="מחיר"
            name="price"
            placeholder="מחיר"
            defaultValue={property.price}
            required
          />
          <select
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            aria-label="סוג עסקה"
            name="type"
            defaultValue={property.type}
          >
            <option value="SALE">למכירה</option>
            <option value="RENT">להשכרה</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            className="h-4 w-4 rounded border-slate-300"
            type="checkbox"
            name="isActive"
            defaultChecked={property.isActive}
          />
          {" "}
          פעיל להצגה באתר
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            className="h-4 w-4 rounded border-slate-300"
            type="checkbox"
            name="isHot"
            defaultChecked={property.isHot}
          />
          {" "}
          נכס חם
        </label>

        {property.imageUrls.length > 0 ? (
          <div>
            <p className="text-sm font-semibold text-slate-700">תמונות קיימות</p>
            <p className="mt-1 text-xs text-slate-500">בטל סימון כדי למחוק תמונה.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {property.imageUrls.map((url, index) => (
                <label
                  key={`${property.id}-${index}`}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
                >
                  <input
                    className="h-4 w-4 rounded border-slate-300"
                    type="checkbox"
                    name="keepImages"
                    value={url}
                    defaultChecked
                  />
                  <img
                    className="h-20 w-28 rounded-xl object-cover"
                    src={url}
                    alt={`תמונה ${index + 1} של ${property.title}`}
                  />
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="images">
            הוספת תמונות חדשות
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="submit"
          >
            שמירה
          </button>
          <a
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            href="/admin/dashboard"
            onClick={(event) => {
              if (!isDirty) {
                return;
              }
              const ok = window.confirm(
                "יש שינויים שלא נשמרו, האם ברצונך לצאת בכל זאת?"
              );
              if (!ok) {
                event.preventDefault();
              }
            }}
          >
            חזרה
          </a>
        </div>
      </form>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-6">
          <div
            className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-property-params-title"
            ref={dialogRef}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900" id="edit-property-params-title">
                פרמטרים לנכס
              </h3>
              <button
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                type="button"
                onClick={() => setIsOpen(false)}
                ref={closeButtonRef}
              >
                סגירה
              </button>
            </div>

            <div className="mt-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-4">
                <input
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  aria-label="שכונה (לא חובה)"
                  placeholder="שכונה (לא חובה)"
                  value={neighborhood}
                  onChange={(event) => setNeighborhood(event.target.value)}
                />

                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="סוג הנכס"
                    value={propertyType}
                    onChange={(event) => setPropertyType(event.target.value)}
                  >
                    <option value="">סוג הנכס</option>
                    {propertyTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {propertyType === "אחר" ? (
                    <input
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                      aria-label="פרט סוג נכס"
                      placeholder="פרט סוג נכס"
                      value={propertyTypeOther}
                      onChange={(event) => setPropertyTypeOther(event.target.value)}
                    />
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label='מ"ר בנוי'
                    placeholder='מ"ר בנוי'
                    value={builtSqm}
                    onChange={(event) => setBuiltSqm(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label='מ"ר מרפסת'
                    placeholder='מ"ר מרפסת'
                    value={balconySqm}
                    onChange={(event) => setBalconySqm(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="שטח מגרש"
                    placeholder='שטח מגרש'
                    value={lotSqm}
                    onChange={(event) => setLotSqm(event.target.value)}
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="מספר חדרים"
                    value={rooms}
                    onChange={(event) => setRooms(event.target.value)}
                  >
                    <option value="">מספר חדרים</option>
                    {[1, 2, 3, 4, 5, 6, 7].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="קומה"
                    placeholder="קומה"
                    value={floor}
                    onChange={(event) => setFloor(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="כיווני אוויר"
                    placeholder="כיווני אוויר"
                    value={airDirections}
                    onChange={(event) => setAirDirections(event.target.value)}
                  />
                </div>

                <select
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  aria-label="מצב הנכס"
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                >
                  <option value="">מצב הנכס</option>
                  {conditionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  aria-label="חניה"
                  value={parking}
                  onChange={(event) => setParking(event.target.value)}
                >
                  <option value="">חניה</option>
                  <option value="יש">חניה</option>
                  <option value="אין">בלי חניה</option>
                </select>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">תוספות</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {additionOptions.map((option) => (
                      <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          className="h-4 w-4 rounded border-slate-300"
                          type="checkbox"
                          checked={additions.includes(option)}
                          onChange={() => toggleAddition(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                  {additions.includes("אחר") ? (
                    <input
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                      aria-label="אחר"
                      placeholder="אחר"
                      value={additionOther}
                      onChange={(event) => setAdditionOther(event.target.value)}
                    />
                  ) : null}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="לובי"
                    placeholder="לובי"
                    value={lobby}
                    onChange={(event) => setLobby(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="תחזוקה"
                    placeholder="תחזוקה"
                    value={maintenance}
                    onChange={(event) => setMaintenance(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="ועד בית"
                    placeholder="ועד בית"
                    value={committee}
                    onChange={(event) => setCommittee(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="שכנים"
                    placeholder="שכנים"
                    value={neighbors}
                    onChange={(event) => setNeighbors(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="שקט/רעש"
                    placeholder="שקט/רעש"
                    value={noise}
                    onChange={(event) => setNoise(event.target.value)}
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                    aria-label="אחר"
                    placeholder="אחר"
                    value={buildingOther}
                    onChange={(event) => setBuildingOther(event.target.value)}
                  />
                </div>

                <input
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  aria-label="נוף"
                  placeholder="נוף"
                  value={view}
                  onChange={(event) => setView(event.target.value)}
                />
                <textarea
                  className="min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  aria-label="מחיר ותנאים"
                  placeholder="מחיר ותנאים"
                  value={priceTerms}
                  onChange={(event) => setPriceTerms(event.target.value)}
                />
                <textarea
                  className="min-h-[100px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  aria-label="למי זה מתאים"
                  placeholder="למי זה מתאים"
                  value={fitFor}
                  onChange={(event) => setFitFor(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                שמירה
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
