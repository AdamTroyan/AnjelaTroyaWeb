"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileFieldProps = {
  name?: string;
  onToken?: (token: string) => void;
  className?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function TurnstileField({ name, onToken, className }: TurnstileFieldProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState("");

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) {
      return;
    }

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || widgetIdRef.current) {
        return;
      }
      if (!window.turnstile) {
        return;
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (value: string) => {
          if (cancelled) {
            return;
          }
          setToken(value);
          onToken?.(value);
        },
        "expired-callback": () => {
          if (cancelled) {
            return;
          }
          setToken("");
          onToken?.("");
        },
        "error-callback": () => {
          if (cancelled) {
            return;
          }
          setToken("");
          onToken?.("");
        },
      });
    };

    if (!window.turnstile) {
      const existing = document.querySelector("script[data-turnstile]");
      if (!existing) {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "true";
        script.onload = renderWidget;
        document.head.appendChild(script);
      } else {
        existing.addEventListener("load", renderWidget, { once: true });
      }
    } else {
      renderWidget();
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [onToken]);

  return (
    <div className={className}>
      <div ref={containerRef} />
      {name ? <input type="hidden" name={name} value={token} /> : null}
    </div>
  );
}
