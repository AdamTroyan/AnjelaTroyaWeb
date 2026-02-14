"use client";

import { useEffect, useMemo, useState } from "react";

type PropertyShareActionsProps = {
  title: string;
};

export default function PropertyShareActions({ title }: PropertyShareActionsProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
      setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
    }
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const shareText = useMemo(
    () => `רציתי לשתף נכס: ${title}`,
    [title]
  );

  const whatsappUrl = useMemo(() => {
    if (!currentUrl) {
      return "";
    }
    return `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`;
  }, [currentUrl, shareText]);

  const handleCopy = async () => {
    if (!currentUrl || !navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(currentUrl);
    setCopied(true);
  };

  const handleNativeShare = async () => {
    if (!currentUrl || !navigator?.share) {
      return;
    }

    await navigator.share({
      title,
      text: shareText,
      url: currentUrl,
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-lg font-semibold text-slate-900">שיתוף הנכס</h2>
      <p className="mt-2 text-sm text-slate-600">
        העבר/י את הקישור לנכס למשפחה, חברים או לקוחות.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          type="button"
          onClick={handleCopy}
          disabled={!currentUrl}
        >
          {copied ? "הקישור הועתק" : "העתקת קישור"}
        </button>
        {canShare ? (
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            type="button"
            onClick={handleNativeShare}
          >
            שיתוף מהיר
          </button>
        ) : null}
        <a
          className={`rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 ${
            currentUrl ? "" : "pointer-events-none opacity-60"
          }`}
          href={whatsappUrl || "#"}
          target="_blank"
          rel="noreferrer"
        >
          שיתוף ב-WhatsApp
        </a>
      </div>
    </div>
  );
}
