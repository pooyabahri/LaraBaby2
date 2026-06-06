import { ReactNode, useState } from "react";
import { Link } from "wouter";
import { Share2, Check } from "lucide-react";

const LOGO_BG = "#EDE8E2";
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function ShareButton() {
  const [done, setDone] = useState(false);

  const handleShare = async () => {
    const siteUrl = window.location.origin + import.meta.env.BASE_URL;
    const shareText = "Luxury strollers that turn heads — LaraBaby is launching soon. Join the waitlist for 20% off!";
    let platform = "copy";
    try {
      if (navigator.share) {
        await navigator.share({ title: "LaraBaby — Luxury Strollers", text: shareText, url: siteUrl });
        platform = "native";
      } else {
        await navigator.clipboard.writeText(siteUrl);
      }
    } catch {
      try { await navigator.clipboard.writeText(siteUrl); } catch {}
    }
    try {
      await fetch(`${BASE}/api/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
    } catch {}
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <button
      onClick={handleShare}
      title="Share LaraBaby"
      className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase px-4 py-2 rounded-full border transition-all duration-200 shrink-0"
      style={done
        ? { borderColor: "hsl(142,50%,40%)", color: "hsl(142,50%,35%)", background: "hsl(142,50%,95%)" }
        : { borderColor: "hsl(20,50%,25%,0.35)", color: "hsl(20,50%,25%)", background: "transparent" }
      }
    >
      {done ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Share2 className="w-3.5 h-3.5" /> Share</>}
    </button>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      {/* ── Header ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b border-black/10"
        style={{ backgroundColor: LOGO_BG }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between relative">
          {/* Logo — transparent PNG, no crop hack needed */}
          <Link href="/" className="shrink-0 hover:opacity-80 transition-opacity">
            <div style={{ width: '172px', height: '50px', overflow: 'hidden' }}>
              <img
                src="/larababy-logo-transparent.png"
                alt="LaraBaby"
                style={{ height: '126px', width: 'auto', marginTop: '-22px', maxWidth: 'none' }}
              />
            </div>
          </Link>

          {/* Nav — centered absolutely */}
          <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase text-foreground/60">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <a href="/#products" className="hover:text-foreground transition-colors">Products</a>
          </nav>

          {/* CTA group */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ShareButton />
            <a
              href="/#waitlist"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold tracking-wide uppercase px-5 py-2.5 rounded-full hover:bg-primary/85 transition-colors"
            >
              Join Waitlist
            </a>
          </div>

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-4 text-xs font-medium tracking-wide uppercase text-foreground/60">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow flex flex-col pt-16">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="py-16 px-6 border-t border-black/10 text-center" style={{ backgroundColor: LOGO_BG }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-5">
            {/* Wordmark — crop to show only "LaraBaby." text, hide the "LOGO" label above */}
            <div style={{ height: '78px', overflow: 'hidden', display: 'inline-block' }}>
              <img
                src="/larababy-logo-transparent.png"
                alt="LaraBaby"
                style={{ height: '220px', width: 'auto', marginTop: '-38px', maxWidth: 'none' }}
              />
            </div>
            {/* Icon mark — crop to show only the circle "L", hide the "ICON" label above it */}
            <div style={{ height: '150px', overflow: 'hidden', display: 'inline-block' }}>
              <img
                src="/larababy-logo-transparent.png"
                alt=""
                style={{ height: '420px', width: 'auto', marginTop: '-268px', maxWidth: 'none' }}
              />
            </div>
          </div>

          <nav className="flex items-center gap-6 text-xs font-semibold tracking-widest uppercase mb-10 text-foreground/50">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <a href="/#products" className="hover:text-foreground transition-colors">Products</a>
            <a href="/#waitlist" className="hover:text-foreground transition-colors">Waitlist</a>
          </nav>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-foreground/70">Luxury, <em style={{ color: '#C9A882' }}>without</em> compromise.</p>
            <p className="text-xs text-foreground/40 font-light">© {new Date().getFullYear()} LaraBaby. All rights reserved.</p>
            <Link href="/admin" className="text-[10px] text-foreground/25 hover:text-foreground/50 transition-colors mt-2 font-light tracking-wide">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
