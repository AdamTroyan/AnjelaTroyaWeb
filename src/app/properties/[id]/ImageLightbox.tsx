"use client";

import { useEffect, useRef, useState } from "react";

type ImageLightboxProps = Readonly<{
  images: string[];
  title: string;
}>;

export default function ImageLightbox({ images, title }: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState("50% 50%");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const closeLightbox = () => {
    document.body.style.overflow = "";
    setActiveIndex(null);
  };

  useEffect(() => {
    if (activeIndex === null) {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      setZoom(1);
      setOrigin("50% 50%");
      return;
    }
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) {
            return current;
          }
          return (current + 1) % images.length;
        });
      }
      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) {
            return current;
          }
          return (current - 1 + images.length) % images.length;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, images.length]);

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {images.map((url, index) => (
          <button
            key={`${url}-${index}`}
            className="group relative overflow-hidden rounded-2xl"
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`פתיחת תמונה ${index + 1} של ${title}`}
          >
            <img
              className="h-64 w-full rounded-2xl object-cover transition duration-300 group-hover:scale-[1.02]"
              src={url}
              alt={`${title} ${index + 1}`}
            />
            <div className="absolute inset-0 bg-slate-900/10 opacity-0 transition group-hover:opacity-100" />
          </button>
        ))}
      </div>

      {activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          onClick={closeLightbox}
          onWheel={(event) => event.preventDefault()}
        >
          <div className="relative h-full w-full">
            <p
              className="sr-only"
              id="lightbox-title"
            >
              צפייה בתמונות: {title}
            </p>
            <div
              className="absolute left-6 top-6 z-10 flex items-center gap-3"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700"
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === null ? current : (current - 1 + images.length) % images.length
                  )
                }
                aria-label="תמונה קודמת"
              >
                הקודם
              </button>
              <button
                className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700"
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === null ? current : (current + 1) % images.length
                  )
                }
                aria-label="תמונה הבאה"
              >
                הבא
              </button>
            </div>

            <div
              className="absolute right-6 top-6 z-10 flex items-center gap-3"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700"
                type="button"
                onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
                aria-label="הקטנת תמונה"
              >
                -
              </button>
              <input
                className="h-2 w-36"
                type="range"
                min="1"
                max="3"
                step="0.25"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                aria-label="רמת זום"
              />
              <button
                className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700"
                type="button"
                onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))}
                aria-label="הגדלת תמונה"
              >
                +
              </button>
              <button
                className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700"
                type="button"
                onClick={closeLightbox}
                ref={closeButtonRef}
                aria-label="סגירת חלון התמונות"
              >
                סגירה
              </button>
            </div>

            <div
              className="flex h-full w-full items-center justify-center overflow-hidden"
              onWheel={(event) => {
                event.preventDefault();
                const target = event.currentTarget as HTMLDivElement;
                const rect = target.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                setOrigin(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
                const delta = event.deltaY > 0 ? -0.25 : 0.25;
                setZoom((value) => {
                  const next = Math.min(3, Math.max(1, value + delta));
                  return Number(next.toFixed(2));
                });
              }}
            >
              <div
                className="flex h-[80vh] w-[80vw] items-center justify-center rounded-3xl bg-black/30"
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  className="max-h-[80vh] max-w-[80vw] object-contain transition"
                  src={images[activeIndex]}
                  alt={`${title} ${activeIndex + 1}`}
                  style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
