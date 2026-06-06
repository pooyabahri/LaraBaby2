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
import { ArrowRight, Loader2, CheckCircle2, ChevronLeft, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout";

type Hotspot = { x: number; y: number; label: string; desc: string };

const GALLERY: { src: string; label: string; hotspots: Hotspot[] }[] = [
  {
    src: "/single-side-bassinet.png",
    label: "Bassinet Mode — Side",
    hotspots: [
      // Side view: stroller faces left; front wheel is lower-left, frame center-right, canopy upper-center
      { x: 24, y: 84, label: "Color-Matched Wheel Lining", desc: "Inner wheel trim finished in a tone that complements the Biscuit colorway — a detail most stroller brands never bother with." },
      { x: 58, y: 65, label: "Aerospace-Grade Aluminum", desc: "Superior strength-to-weight ratio — rigid, corrosion-resistant, never heavy." },
      { x: 50, y: 32, label: "UPF 50+ Canopy", desc: "All-season shielding from sun, wind, and light rain." },
    ],
  },
  {
    src: "/single-front-bassinet.png",
    label: "Bassinet Mode — Front",
    hotspots: [
      // Front view: handlebar at ~y:20 on walnut bar; diamond stitching on lower inner bassinet wall; wheel at bottom-left corner
      { x: 50, y: 68, label: "Diamond-Pattern Quilting", desc: "Precision-sewn for structural integrity and a refined, tailored aesthetic." },
      { x: 50, y: 20, label: "Ergonomic Handle Bar", desc: "Height-adjustable padded handle — comfortable for any parent." },
      { x: 70, y: 88, label: "Color-Matched Wheel Caps", desc: "Frame and wheel caps finished in matching black — a premium signature detail." },
    ],
  },
  {
    src: "/single-front-seat.png",
    label: "Seat Mode — Front",
    hotspots: [
      // Front seat view: 600D on canopy, memory foam on inner seat surface, recline lever on right side
      { x: 50, y: 26, label: "600D Polyester Fabric", desc: "Military-grade durability with a feather-light feel — resists tears, stains, and UV." },
      { x: 62, y: 36, label: "Multi-Position Recline", desc: "Adjustable backrest — flat for newborns to upright for toddlers." },
      { x: 44, y: 50, label: "Memory-Foam Insert", desc: "Temperature-regulating foam supports healthy spine development from day one." },
    ],
  },
];

const SPECS = [
  { title: "Reversible Bassinet — Face You or the World", desc: "The bassinet rotates to face forward or toward you with a single click — keep your baby close or let them explore." },
  { title: "Multi-Position Tilt System", desc: "Adjust the bassinet angle across multiple recline positions — perfectly flat for newborn sleep, gently inclined for feeding, or anywhere in between." },
  { title: "Converts to an Upward-Facing Seat", desc: "As your baby grows, the bassinet transforms into a full forward-facing seat — one stroller that adapts from newborn through toddler years." },
  { title: "One-Handed Magnetic Fold", desc: "Collapses effortlessly in under 3 seconds — no wrestling, no frustration." },
  { title: "Built-In Cup Holders", desc: "Two insulated cup holders keep your coffee warm and your hands free." },
  { title: "Memory-Foam Bassinet Insert", desc: "Temperature-regulating orthopedic foam supports healthy spine development from day one." },
  { title: "600D High-Strength Polyester Fabric", desc: "Military-grade durability with a feather-light feel. Resists tears, stains, and UV degradation." },
  { title: "Aerospace-Grade Aluminum Frame", desc: "Engineered for strength-to-weight ratio — robust but never heavy." },
  { title: "Diamond-Pattern Quilted Stitching", desc: "Precision-sewn for structural integrity and a refined, tailored aesthetic." },
  { title: "Weather-Resistant Canopy", desc: "UPF 50+ sun protection with all-season shielding from wind and light rain." },
  { title: "Suspension-Tuned Wheel System", desc: "Four-wheel independent suspension absorbs cobblestones, curbs, and city terrain." },
  { title: "Color-Matched Wheel Lining", desc: "The inner wheel trim is finished in a tone that complements your chosen colorway — a considered aesthetic detail most stroller brands never bother with." },
  { title: "Carry Bag Included", desc: "Every Lara Single ships with a premium carry bag — padded, structured, and sized to protect your stroller in transit or storage. No extra purchase needed." },
];

const COMING_SOON_FEATURES = [
  { title: "Retractable Sun Visor", desc: "A dedicated sleep-shade visor for the bassinet that blocks low-angle sun without disturbing airflow — so naps stay naps, even on bright afternoon walks. Currently in development." },
];

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProductSingle() {
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
      { data: { ...values, productType: "single_bassinet" } },
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
              The Lara Single Bassinet Stroller
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-10 max-w-lg">
              Our flagship single stroller. Engineered for the parent who refuses to compromise — on style, on safety, or on the joy of a morning walk.
            </p>
            <div className="flex items-center gap-3 self-start bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-3.5 mb-3">
              <span className="text-2xl font-semibold text-foreground tracking-tight">$1,295</span>
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

      {/* Specs */}
      <section className="py-24 bg-card px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-sm font-medium tracking-wide uppercase text-primary mb-4">Built Different</h2>
            <h3 className="text-4xl font-serif text-foreground mb-4">Every detail matters.</h3>
            <p className="text-muted-foreground font-light leading-relaxed text-lg">
              We obsessed over every component, every seam, every mechanism — so you don't have to think twice.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {SPECS.map((spec, i) => (
              <motion.div
                key={i}
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

          {/* Coming Soon Features */}
          <div className="mt-16 pt-12 border-t border-border/50">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold tracking-widest uppercase text-primary">In Development</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
              {COMING_SOON_FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.07 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 mt-1 w-5 h-5 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-serif text-foreground">{feature.title}</h4>
                      <span className="text-[10px] font-semibold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
              Join the waitlist and lock in your <strong className="text-primary">20% launch discount</strong> for the Single Bassinet Stroller.
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
                    Reserving: <strong className="text-foreground">Single Bassinet Stroller</strong>
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
