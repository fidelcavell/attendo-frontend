import { useEffect, useState } from "react";

export default function NoInternetConnection() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 left-0 z w-full bg-red-600 text-white text-center p-2 text-sm font-medium z-50 shadow-lg">
      ⚠️ You are offline — some features may not work until you reconnect
    </div>
  );
}
