import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useJoinWaitlist, useGetWaitlistCount, getGetWaitlistCountQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { Layout } from "@/components/layout";

type Hotspot = { x: number; y: number; label: string; desc: string };

const GALLERY: { src: string; label: string; hotspots: Hotspot[] }[] = [
  {
    src: "/twin-front-bassinets.png",
    label: "Bassinet Mode — Front",
    hotspots: [
      // Front bassinets: stroller content starts ~y:22; handlebar at ~y:26; right canopy fabric at ~y:38; left body diamond stitching at ~y:62
      { x: 32, y: 53, label: "Diamond Quilting (×2)", desc: "Precision-sewn on both seats for structural integrity and a tailored aesthetic." },
      { x: 72, y: 38, label: "600D Polyester Fabric", desc: "Military-grade durability across both seats — resists tears, stains, and UV." },
      { x: 50, y: 58, label: "Premium Handlebar", desc: "Walnut-finish shared handlebar — one-handed pushing for two." },
    ],
  },
  {
    src: "/twin-side-bassinet.png",
    label: "Bassinet Mode — Side",
    hotspots: [
      { x: 23, y: 87, label: "Color-Matched Wheel Lining", desc: "Inner wheel trim finished to complement the Biscuit colorway — a considered detail that elevates the whole silhouette." },
      { x: 55, y: 63, label: "Twin-Optimized Frame", desc: "Wider aluminum chassis — stable, rigid, and lighter than you'd expect." },
      { x: 47, y: 38, label: "Dual UPF 50+ Canopies", desc: "Independent canopies for both children — shade on demand, separately." },
    ],
  },
  {
    src: "/twin-front-seats.png",
    label: "Seat Mode — Front",
    hotspots: [
      // Seat mode front: left canopy = 600D material; right canopy = Independent Canopies feature; right side trim = color-matched accents
      { x: 30, y: 26, label: "600D Fabric (×2)", desc: "Both seats wrapped in military-grade polyester — stain and tear resistant." },
      { x: 65, y: 26, label: "Independent Canopies", desc: "Each child's canopy adjusts separately — full shade or fully open." },
      { x: 74, y: 56, label: "Color-Matched Accents", desc: "Walnut handle, biscuit fabric, and black frame — a cohesive premium palette." },
    ],
  },
];

const SPECS = [
  { title: "Side-by-Side Seating Layout", desc: "Equal views, equal comfort. Neither child rides behind the other — ever." },
  { title: "Synchronized Reclining Bassinets", desc: "Both seats recline independently from flat newborn to upright — nap time on your schedule." },
  { title: "Diamond-Pattern Quilted Stitching (×2)", desc: "Precision-sewn for structural integrity across both seats, with a refined tailored aesthetic." },
  { title: "Memory-Foam Bassinet Inserts (×2)", desc: "Temperature-regulating orthopedic foam for both children. No compromises — ever." },
  { title: "Dual UPF 50+ Weather-Resistant Canopies", desc: "Independent canopies shield both children simultaneously from sun, wind, and light rain." },
  { title: "Aerospace-Grade Aluminum Frame", desc: "Twin-optimized chassis — wider, stable, rigid, and lighter than you'd expect." },
  { title: "Color-Matched Wheel Lining", desc: "Inner wheel trim finished in a tone that complements your chosen colorway — a considered aesthetic detail most stroller brands never bother with." },
  { title: "600D High-Strength Polyester Fabric", desc: "Military-grade durability with a feather-light feel. Resists tears, stains, and UV degradation." },
  { title: "Carry Bag Included", desc: "Every Lara Twin ships with a premium carry bag — padded, structured, and sized to protect your stroller in transit or storage. No extra purchase needed." },
];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductTwin() {
  const [activePhoto, setActivePhoto] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: countData } = useGetWaitlistCount();
  const joinWaitlist = useJoinWaitlist();
  const count = countData?.count || 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", email: "" },
  });

  const onSubmit = (values: FormValues) => {
    joinWaitlist.mutate(
      { data: { ...values, productType: "twin_bassinet" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWaitlistCountQueryKey() });
          setLocation("/thank-you");
        },
        onError: (error: any) => {
          if (error.status === 409) {
            toast({ title: "You're already on the list!", description: "We'll be in touch when the drop date is announced." });
            form.reset();
          } else {
            toast({ variant: "destructive", title: "Something went wrong", description: "Please try again later." });
          }
        },
      }
    );
  };

  return (
    <Layout>
      {/* Back */}
      <div className="pt-28 pb-4 px-6 max-w-7xl mx-auto w-full">
        <Link href="/#products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
          <ChevronLeft className="w-4 h-4" />
          All Products
        </Link>
      </div>

      {/* Hero */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:pt-4"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-medium tracking-wide uppercase px-4 py-2 rounded-full mb-8 border border-primary/20">
              Coming Soon
            </div>
            <h1 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-6 text-foreground text-balance">
              The Lara Twin Bassinet Stroller
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-10 max-w-lg">
              Side-by-side perfection for growing families. Because having twins shouldn't mean giving up on design, comfort, or your morning walk.
            </p>
            <div className="flex items-center gap-3 self-start bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3.5 mb-3">
              <span className="text-2xl font-semibold text-foreground tracking-tight">$1,695</span>
              <span className="text-sm text-muted-foreground font-light">+ tax</span>
            </div>
            <p className="text-xs text-muted-foreground font-medium mb-4 flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-3.5 text-primary">✓</span>
              Carry bag included with every purchase
            </p>
            <div className="bg-primary/8 border border-primary/20 rounded-2xl px-5 py-4 text-sm mb-6">
              <p className="font-semibold text-foreground mb-1">Waitlist members receive a <span className="text-primary">20% off promo code</span> at launch.</p>
              <p className="text-muted-foreground font-light text-xs">This offer is limited and will expire soon — secure your spot now.</p>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground whitespace-nowrap">Available In</span>
              <div className="flex items-center gap-4">
                {[
                  { name: "Biscuit", preview: "linear-gradient(135deg, #D4B896 0%, #C09070 100%)", comingSoon: false },
                  { name: "Black", preview: "linear-gradient(135deg, #2a2a2a 0%, #111 100%)", comingSoon: true },
                ].map((color, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full shadow-sm flex-shrink-0" style={{ background: color.preview, border: !color.comingSoon ? '3px solid rgba(0,0,0,0.5)' : '2px solid rgba(0,0,0,0.12)' }} />
                    <div>
                      <span className="text-sm font-medium text-foreground block leading-tight">{color.name}</span>
                      {!color.comingSoon ? <span className="text-[10px] font-semibold text-emerald-600 tracking-wide uppercase">Available</span> : <span className="text-[10px] font-semibold text-primary/70 tracking-wide uppercase">Coming Soon</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right — photo gallery */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Main photo — natural ratio so hotspot % coords map 1:1 to image pixels */}
            <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: "#F5F0EA" }}>
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePhoto}
                    src={GALLERY[activePhoto].src}
                    alt={GALLERY[activePhoto].label}
                    className="w-full h-auto block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                  />
                </AnimatePresence>

                {/* Hotspot pins — absolute inset-0 sits exactly on the image */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePhoto}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute inset-0"
                  >
                    {GALLERY[activePhoto].hotspots.map((spot, i) => {
                      const nearTop = spot.y < 32;
                      const nearLeft = spot.x < 28;
                      const nearRight = spot.x > 72;
                      const tooltipH = nearTop ? "top-6" : "bottom-6";
                      const tooltipX = nearLeft ? "left-0" : nearRight ? "right-0" : "left-1/2 -translate-x-1/2";
                      return (
                        <div
                          key={i}
                          className="absolute group/spot"
                          style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: "translate(-50%,-50%)", zIndex: 10 }}
                        >
                          <span className="absolute inset-0 rounded-full bg-white/50 animate-ping" style={{ width: 20, height: 20, margin: -4 }} />
                          <div className="w-3 h-3 rounded-full bg-white border-2 border-primary shadow-lg cursor-default relative z-10" />
                          <div className={`absolute ${tooltipH} ${tooltipX} opacity-0 group-hover/spot:opacity-100 transition-opacity duration-200 pointer-events-none z-20`}>
                            <div className="bg-white/97 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-xl border border-black/8 w-52">
                              <p className="text-xs font-semibold text-foreground leading-snug">{spot.label}</p>
                              <p className="text-[11px] text-muted-foreground font-light mt-0.5 leading-relaxed">{spot.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-5 left-5 bg-white/85 backdrop-blur-md rounded-xl px-4 py-2 text-xs font-semibold tracking-wide text-foreground border border-white/60 shadow-sm z-10">
                  {GALLERY[activePhoto].label}
                </div>
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] font-medium text-foreground/60 z-10 pointer-events-none">
                  Hover dots to explore
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {GALLERY.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`relative aspect-square rounded-2xl overflow-hidden transition-all duration-200 ${
                    activePhoto === i
                      ? "ring-2 ring-primary ring-offset-2 shadow-md"
                      : "opacity-60 hover:opacity-90"
                  }`}
                  style={{ background: "#F5F0EA" }}
                >
                  <img src={photo.src} alt={photo.label} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Twin-specific callout */}
      <section className="py-16 bg-primary/5 border-y border-primary/10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {[
            { label: "Two seats", detail: "Side-by-side, equal experience" },
            { label: "One fold", detail: "Collapses as easily as a single" },
            { label: "Zero compromise", detail: "Built to the same standard as our single" },
          ].map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="text-2xl font-serif text-primary mb-2">{item.label}</div>
              <div className="text-sm text-muted-foreground font-light">{item.detail}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Specs */}
      <section className="py-24 bg-card px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-sm font-medium tracking-wide uppercase text-primary mb-4">Built Different</h2>
            <h3 className="text-4xl font-serif text-foreground mb-4">Twice the love. Not twice the hassle.</h3>
            <p className="text-muted-foreground font-light leading-relaxed text-lg">
              Every feature on the Twin is engineered to give both your children the same premium experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {SPECS.map((spec, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="flex gap-4"
              >
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <div>
                  <h4 className="font-serif text-foreground mb-1">{spec.title}</h4>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{spec.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-serif mb-4 text-foreground">Reserve yours.</h2>
            <p className="text-muted-foreground font-light mb-10">
              Join the waitlist and lock in your <strong className="text-primary">20% launch discount</strong> for the Twin Bassinet Stroller.
              {count > 0 && <span className="block mt-2 text-sm">You'd be joining {count.toLocaleString()} parents already waiting.</span>}
            </p>

            <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm text-left">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="First Name" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Last Name" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Email Address" type="email" className="h-12 rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-muted-foreground">
                    Reserving: <strong className="text-foreground">Twin Bassinet Stroller</strong>
                  </div>
                  <Button type="submit" disabled={joinWaitlist.isPending} className="w-full h-12 rounded-xl text-base group">
                    {joinWaitlist.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>Secure My 20% Off <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
