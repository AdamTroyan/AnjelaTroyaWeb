type TurnstileVerificationResponse = {
  success: boolean;
  "error-codes"?: string[];
};

function getSecret() {
  return process.env.TURNSTILE_SECRET_KEY || "";
}

export async function verifyTurnstile(token: string, ip?: string | null) {
  const secret = getSecret();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  if (!token) {
    return false;
  }

  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (ip) {
    body.set("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as TurnstileVerificationResponse;
  return data.success === true;
}
