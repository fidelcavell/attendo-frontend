import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginContext } from "./useLogin";

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    );
  } catch {
    return "";
  }
}

function parseJwt(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = base64UrlDecode(parts[1]);
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const decoded = parseJwt(token);
  const exp = typeof decoded?.exp === "number" ? (decoded.exp as number) : null;
  if (!exp) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds >= exp;
}

export default function useJwtExpiryWatcher() {
  const { setToken, setCurrentUser, setCurrentStore, setStoreLoaded } =
    useLoginContext();
  const navigate = useNavigate();
  const intervalMs = 1000;
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (expired) return; // avoid duplicate timers once expired

    const id = window.setInterval(() => {
      const token = localStorage.getItem("JWT_TOKEN");
      if (isTokenExpired(token)) {
        localStorage.removeItem("JWT_TOKEN");
        localStorage.removeItem("USERNAME");
        setToken(null);
        setCurrentUser(null);
        setCurrentStore(null);
        setStoreLoaded(false);
        setExpired(true);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, intervalMs);

    intervalRef.current = id;
    return () => clearInterval(id);
  }, [
    navigate,
    intervalMs,
    setToken,
    setCurrentUser,
    setCurrentStore,
    expired,
    setStoreLoaded,
  ]);

  const acknowledgeExpiry = () => {
    setExpired(false);
    navigate("/", { replace: true });
  };

  return { expired, acknowledgeExpiry };
}
