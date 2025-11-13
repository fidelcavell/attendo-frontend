import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldX } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-destructive/20">
          <CardContent className="p-8 text-center space-y-6">
            {/* Access Denied Illustration */}
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <ShieldX className="w-8 h-8 text-destructive" />
              </div>
              <Badge variant="destructive" className="text-xs">
                Access Denied
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Access Restricted</h1>
              <p className="text-sm text-muted-foreground">
                You don't have permission to access this page. This area is
                restricted to authorized personnel only.
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium">Possible reasons:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Your account doesn't have the required role</li>
                <li>• You need to be logged in with proper credentials</li>
                <li>• This resource is temporarily unavailable</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
