"use client";

import { useEffect, useRef, useCallback } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type TurnstileWidgetProps = {
  onVerify?: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile CAPTCHA widget.
 * Renders the challenge and writes the token into a hidden input named "cf-turnstile-response".
 * Optionally calls onVerify with the token string.
 */
export default function TurnstileWidget({ onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => {
        if (hiddenRef.current) {
          hiddenRef.current.value = token;
        }
        onVerifyRef.current?.(token);
      },
      "expired-callback": () => {
        if (hiddenRef.current) {
          hiddenRef.current.value = "";
        }
      },
      "error-callback": () => {
        if (hiddenRef.current) {
          hiddenRef.current.value = "";
        }
      },
      theme: "light",
      size: "normal",
    });
  }, []);

  useEffect(() => {
    if (!SITE_KEY) {
      return;
    }

    // If turnstile script is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Check if script tag already exists
    const existing = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => renderWidget();
      document.head.appendChild(script);
    } else {
      // Script exists but not loaded yet
      existing.addEventListener("load", () => renderWidget());
      // Might already be loaded
      if (window.turnstile) {
        renderWidget();
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  if (!SITE_KEY) {
    return null;
  }

  return (
    <>
      <div ref={containerRef} />
      <input type="hidden" name="cf-turnstile-response" ref={hiddenRef} />
    </>
  );
}
