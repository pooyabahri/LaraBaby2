import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { Loader2, Download, LogOut, Users, ShoppingBag, Share2, Home } from "lucide-react";

type Entry = {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string;
  productType: string;
  country: string | null;
  createdAt: string;
};

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function formatProduct(p: string) {
  return p === "single_bassinet" ? "Single" : p === "twin_bassinet" ? "Twin" : p;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Admin() {
  const [key, setKey] = useState(() => sessionStorage.getItem("admin_key") ?? "");
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "single_bassinet" | "twin_bassinet">("all");
  const [shareCount, setShareCount] = useState<number | null>(null);

  const fetchData = async (k: string) => {
    setLoading(true);
    setError("");
    try {
      const [listRes, shareRes] = await Promise.all([
        fetch(`${BASE}/api/admin/waitlist?key=${encodeURIComponent(k)}`),
        fetch(`${BASE}/api/share/count`),
      ]);
      if (listRes.status === 401) { setError("Wrong password."); setLoading(false); return; }
      if (!listRes.ok) { setError("Something went wrong. Try again."); setLoading(false); return; }
      const data = await listRes.json();
      setEntries(data);
      setKey(k);
      sessionStorage.setItem("admin_key", k);
      if (shareRes.ok) {
        const shareData = await shareRes.json();
        setShareCount(shareData.count ?? 0);
      }
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (key) fetchData(key);
  }, []);

  const logout = () => {
    sessionStorage.removeItem("admin_key");
    setKey("");
    setEntries([]);
    setInput("");
    setShareCount(null);
  };

  const csvUrl = `${BASE}/api/admin/waitlist/export?key=${encodeURIComponent(key)}`;

  const filtered = filter === "all" ? entries : entries.filter((e) => e.productType === filter);
  const singleCount = entries.filter((e) => e.productType === "single_bassinet").length;
  const twinCount = entries.filter((e) => e.productType === "twin_bassinet").length;

  if (!key) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#F5F0EA" }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="text-2xl font-serif text-foreground mb-1">LaraBaby</div>
            <div className="text-sm text-muted-foreground">Admin Access</div>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              placeholder="Enter admin password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchData(input)}
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={() => fetchData(input)}
              disabled={loading || !input}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: "hsl(20,50%,25%)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Sign In"}
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Home className="w-3.5 h-3.5" /> Return to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F0EA" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="font-serif text-lg text-foreground">LaraBaby · Admin</div>
        <div className="flex items-center gap-3">
          <a
            href={csvUrl}
            download="larababy-waitlist.csv"
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all"
            style={{ background: "hsl(20,50%,25%)" }}
          >
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <Link href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl border border-gray-200 transition-all"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl border border-gray-200 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Signups", value: entries.length, icon: Users },
            { label: "Single Bassinet", value: singleCount, icon: ShoppingBag },
            { label: "Twin Bassinet", value: twinCount, icon: ShoppingBag },
            { label: "Total Shares", value: shareCount ?? "—", icon: Share2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white rounded-2xl p-6 shadow-sm border border-white/60">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{label}</span>
              </div>
              <div className="text-4xl font-serif text-foreground">{value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(["all", "single_bassinet", "twin_bassinet"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === f
                  ? "border-primary text-white"
                  : "border-gray-200 text-muted-foreground hover:border-primary/40"
              }`}
              style={filter === f ? { background: "hsl(20,50%,25%)" } : {}}
            >
              {f === "all" ? "All" : f === "single_bassinet" ? "Single" : "Twin"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/60 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">No signups yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Name", "Email", "Product", "Country", "Joined"].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e, i) => (
                    <tr key={e.id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                      <td className="px-5 py-3.5 font-medium text-foreground">
                        {e.firstName} {e.lastName ?? ""}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{e.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
                          style={{ background: e.productType === "single_bassinet" ? "rgba(160,100,60,0.1)" : "rgba(60,100,160,0.1)",
                            color: e.productType === "single_bassinet" ? "hsl(20,50%,30%)" : "hsl(220,50%,35%)" }}>
                          {formatProduct(e.productType)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">{e.country ?? "—"}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{formatDate(e.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
