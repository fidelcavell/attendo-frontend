import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarClock,
  Users2,
  FileChartColumn,
  ShieldCheck,
  Clock,
  LineChart,
} from "lucide-react";
import { useEffect } from "react";
import { useLoginContext } from "@/hooks/useLogin";

export default function LandingPage() {
  const { token } = useLoginContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate("/sign-in", { replace: true });
    }
  }, [navigate, token]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary/10 grid place-items-center">
              <img src="/logo.png" alt="Logo" />
            </div>
            <span className="font-semibold">Attendo.</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a className="hover:text-foreground" href="#features">
              Fitur
            </a>
            <a className="hover:text-foreground" href="#cta">
              Get started
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/sign-in">
              <Button variant="ghost" className="h-8 text-xs">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button className="h-8 text-xs">Buat akun</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge className="text-[10px]">
              Sistem Manajemen Presensi CV. Centro Felix Utama
            </Badge>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold leading-tight">
              Menyederhanakan manajemen presensi pada CV. Centro Felix Utama
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Sistem presensi ini dirancang untuk mencatat waktu masuk dan
              keluar karyawan secara otomatis melalui foto dan lokasi, mengelola
              durasi jam istirahat, serta menyusun laporan presensi dan
              pengeluaran yang dapat diakses untuk kebutuhan evaluasi dan
              pengambilan keputusan
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/sign-up">
                <Button className="h-9 text-sm sm:text-xs md:text-sm">
                  Gabung CV. Centro Felix Utama
                </Button>
              </Link>
              <Link to="">
                <Button
                  variant="outline"
                  className="h-9 text-sm sm:text-xs md:text-sm"
                >
                  Employee Sign In
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Secure
              </div>
              <div className="inline-flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5" /> Multi-role
              </div>
              <div className="inline-flex items-center gap-1">
                <LineChart className="w-3.5 h-3.5" /> Insights
              </div>
            </div>
          </div>

          {/* Illustrative preview card */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Quick snapshot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] text-muted-foreground">Presensi</p>
                  <div className="mt-1 text-sm font-semibold flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Presensi Masuk
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Dengan foto dan lokasi
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] text-muted-foreground">Jadwal</p>
                  <div className="mt-1 text-sm font-semibold flex items-center gap-2">
                    <CalendarClock className="w-3.5 h-3.5" /> Jam Kerja
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pengaturan jadwal lebih cepat
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] text-muted-foreground">Karyawan</p>
                  <div className="mt-1 text-sm font-semibold flex items-center gap-2">
                    <Users2 className="w-3.5 h-3.5" /> Data Karyawan
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Pengaturan role dan toko
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-[11px] text-muted-foreground">Laporan</p>
                  <div className="mt-1 text-sm font-semibold flex items-center gap-2">
                    <FileChartColumn className="w-3.5 h-3.5" /> Insights
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Presensi dan pengeluaran
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-10 sm:pb-16">
        <h2 className="text-lg sm:text-xl font-semibold">
          Mengapa memilih sistem presensi Attendo
        </h2>
        <p className="text-sm text-muted-foreground">
          Semua yang dibutuhkan untuk mengelola presensi karyawan secara
          efisien.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Presensi dengan foto",
              desc: "Karyawan mencatat kehadiran dengan mengambil selfie.",
              icon: <Clock className="w-4 h-4" />,
            },
            {
              title: "Pelacakan waktu istirahat",
              desc: "Melacak waktu istirahat dan jam kerja karyawan.",
              icon: <Clock className="w-4 h-4" />,
            },
            {
              title: "Jadwal kerja",
              desc: "Mengelola jadwal shift dan cakupan kerja.",
              icon: <CalendarClock className="w-4 h-4" />,
            },
            {
              title: "Multiple roles",
              desc: "Owner, admin, dan employee secara bertingkat.",
              icon: <Users2 className="w-4 h-4" />,
            },
            {
              title: "Analitik perusahaan",
              desc: "Menyediakan wawasan presensi dan pengeluaran.",
              icon: <LineChart className="w-4 h-4" />,
            },
            {
              title: "Secure access",
              desc: "Perlindungan data karyawan CV. Centro Felix Utama",
              icon: <ShieldCheck className="w-4 h-4" />,
            },
          ].map((f) => (
            <Card key={f.title} className="">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-primary">{f.icon}</div>
                  <div>
                    <p className="font-medium text-sm">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="mx-auto max-w-6xl px-4 pb-16">
        <Card>
          <CardContent className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                Siap bergabung dengan CV. Centro Felix Utama?
              </h3>
              <p className="text-sm text-muted-foreground">
                Akses akun Anda dan mulai presensi.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/sign-up">
                <Button className="h-9">Gabung CV. Centro Felix Utama</Button>
              </Link>
              <Link to="/sign-in">
                <Button variant="outline" className="h-9">
                  Employee Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} Attendo.</span>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-foreground">
              Fitur
            </a>
            <a href="#cta" className="hover:text-foreground">
              Get started
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
