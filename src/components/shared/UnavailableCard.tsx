import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/card";
import type React from "react";

interface UnavailableCardProps {
  icon: LucideIcon;
  title: string;
  message: React.ReactNode;
}

export default function UnavailableCard({
  icon: Icon,
  title,
  message,
}: UnavailableCardProps) {
  return (
    <div className="flex justify-center items-center w-full py-20">
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <span className="text-2xl">
              <Icon />
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
