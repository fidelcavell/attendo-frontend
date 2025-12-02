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
                Akses ditolak
              </Badge>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Akses terbatas</h1>
              <p className="text-sm text-muted-foreground">
                Anda tidak memiliki izin untuk mengakses halaman ini. Area ini
                hanya dapat diakses oleh pengguna yang berwenang.
              </p>
            </div>

            {/* Additional Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-xs font-medium">Kemungkinan penyebab:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Akun Anda tidak memiliki peran yang sesuai</li>
                <li>• Anda perlu login dengan kredensial yang benar</li>
                <li>• Sumber daya ini sedang tidak tersedia</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
