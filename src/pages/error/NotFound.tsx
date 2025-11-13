import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-6">
            {/* 404 Illustration */}
            <div className="space-y-4">
              <div className="text-6xl font-bold text-muted-foreground/20">404</div>
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Page Not Found</h1>
              <p className="text-sm text-muted-foreground">
                Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}