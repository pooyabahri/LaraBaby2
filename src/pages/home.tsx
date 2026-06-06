import React, { useRef, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useJoinWaitlist, useGetWaitlistCount, getGetWaitlistCountQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, CheckCircle2, Sparkles, Share2, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  productType: z.enum(["twin_bassinet", "single_bassinet"], {
    required_error: "Please select a product",
  }),
  country: z.string().min(1, "Please select your country"),
  notARobot: z.boolean().refine((v) => v === true, {
    message: "Please confirm you're not a robot",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const PRODUCTS = [
  {
    slug: "single",
    name: "The Lara Single Bassinet Stroller",
    desc: "Our flagship single. Effortless to push, impossible to ignore.",
    image: "/single-front-bassinet.png",
  },
  {
    slug: "twin",
    name: "The Lara Twin Bassinet Stroller",
    desc: "Side-by-side perfection — style and space for both.",
    image: "/twin-front-bassinets.png",
  },
];

const COLORS = [
  {
    name: "Biscuit",
    preview: "linear-gradient(135deg, #D4B896 0%, #C09070 100%)",
    comingSoon: false,
  },
  {
    name: "Black",
    preview: "linear-gradient(135deg, #2a2a2a 0%, #111111 100%)",
    comingSoon: true,
  },
];

const ALL_FEATURES = [
  { title: "Reversible Bassinet", desc: "Rotates to face you or forward with one click — keep your baby close or let them explore, your call.", highlight: true, comingSoon: false },
  { title: "Multi-Position Tilt System", desc: "Adjusts from fully flat for newborn sleep to gently inclined for feeding, or anywhere in between.", highlight: true, comingSoon: false },
  { title: "Converts to Upward-Facing Seat", desc: "The bassinet transforms into a full forward-facing seat as your baby grows — newborn through toddler.", highlight: true, comingSoon: false },
  { title: "One-Handed Magnetic Fold", desc: "Collapses in under 3 seconds — no wrestling, no frustration, no learning curve.", highlight: true, comingSoon: false },
  { title: "Built-In Cup Holders", desc: "Two insulated holders keep your coffee warm and your hands free — because you deserve it too.", highlight: false, comingSoon: false },
  { title: "Memory-Foam Bassinet Insert", desc: "Temperature-regulating orthopedic foam supports healthy spine development from day one.", highlight: false, comingSoon: false },
  { title: "600D High-Strength Polyester Fabric", desc: "Military-grade durability with a feather-light feel. Resists tears, stains, and UV degradation.", highlight: true, comingSoon: false },
  { title: "Aerospace-Grade Aluminum Frame", desc: "Engineered for strength-to-weight ratio — robust but never heavy.", highlight: false, comingSoon: false },
  { title: "Diamond-Pattern Quilted Stitching", desc: "Precision-sewn for structural integrity and a refined, tailored aesthetic.", highlight: true, comingSoon: false },
  { title: "Weather-Resistant Canopy", desc: "UPF 50+ sun protection with all-season shielding from wind and light rain.", highlight: false, comingSoon: false },
  { title: "Suspension-Tuned Wheel System", desc: "Four-wheel independent suspension absorbs cobblestones, curbs, and city terrain.", highlight: false, comingSoon: false },
  { title: "Color-Matched Wheel Lining", desc: "Inner wheel trim finished to complement your chosen colorway — a considered detail most brands never bother with.", highlight: true, comingSoon: false },
  { title: "Carry Bag Included", desc: "Every Lara stroller ships with a premium carry bag — padded, structured, and sized to protect your stroller in transit or storage.", highlight: true, comingSoon: false },
  { title: "Retractable Sun Visor", desc: "A dedicated sleep-shade visor for the bassinet that blocks low-angle sun without disturbing airflow — so naps stay naps.", highlight: false, comingSoon: true },
];

type HomeHotspot = { x: number; y: number; label: string; desc: string };

const PREVIEW_PRODUCTS: { label: string; name: string; price: string; image: string; slug: string; hotspots: HomeHotspot[] }[] = [
  {
    label: "Single", name: "Single Bassinet", price: "$1,295", image: "/single-front-bassinet.png", slug: "single",
    hotspots: [
      { x: 50, y: 20, label: "Ergonomic Handle Bar", desc: "Height-adjustable padded handle — comfortable for any parent." },
      { x: 50, y: 68, label: "Diamond-Pattern Quilting", desc: "Precision-sewn for structural integrity and a refined, tailored aesthetic." },
      { x: 70, y: 88, label: "Color-Matched Wheel Caps", desc: "Frame and wheel caps finished in matching black — a premium signature detail." },
    ],
  },
  {
    label: "Twin", name: "Twin Bassinet", price: "$1,695", image: "/twin-front-bassinets.png", slug: "twin",
    hotspots: [
      { x: 50, y: 58, label: "Ergonomic Handle Bar", desc: "Height-adjustable padded handle — comfortable for any parent." },
      { x: 72, y: 38, label: "600D Polyester Fabric", desc: "Military-grade durability with a feather-light feel — resists tears, stains, and UV." },
      { x: 32, y: 53, label: "Diamond-Pattern Quilting", desc: "Precision-sewn for structural integrity and a refined, tailored aesthetic." },
    ],
  },
];

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: countData } = useGetWaitlistCount();
  const joinWaitlist = useJoinWaitlist();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [activePreview, setActivePreview] = useState(0);
  const [shareCount, setShareCount] = useState<number | null>(null);
  const [shareDone, setShareDone] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/share/count`)
      .then((r) => r.json())
      .then((d) => setShareCount(d.count ?? 0))
      .catch(() => {});
  }, []);

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
      await fetch(`${BASE}/api/share`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ platform }) });
      setShareCount((c) => (c ?? 0) + 1);
    } catch {}
    setShareDone(true);
    setTimeout(() => setShareDone(false), 3000);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      productType: undefined,
      country: "",
      notARobot: false,
    },
  });

  const onSubmit = (values: FormValues) => {
    // Honeypot check — bots fill hidden fields, humans don't
    if (honeypotRef.current?.value) {
      setLocation("/thank-you");
      return;
    }

    const { notARobot: _, ...apiValues } = values;

    joinWaitlist.mutate(
      { data: apiValues },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWaitlistCountQueryKey() });
          setLocation("/thank-you");
        },
        onError: (error: any) => {
          if (error.status === 409) {
            toast({ title: "You're already on the list!", description: "We have your email — stay tuned." });
            form.reset();
          } else {
            toast({ variant: "destructive", title: "Something went wrong", description: error.data?.error || "Please try again." });
          }
        },
      }
    );
  };

  const isPending = joinWaitlist.isPending;
  const count = countData?.count || 0;

  return (
    <Layout>
      {/* ── Hero ── */}
      <section id="waitlist" className="relative py-16 md:py-24 px-6 overflow-hidden bg-background">
        <div className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/6 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/4 blur-3xl" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">

          {/* Left — headline + waitlist */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8 z-10"
          >
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[11px] font-bold tracking-widest uppercase px-4 py-2 rounded-full border border-primary/20 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Launching Soon · 20% Off for Waitlist
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-[72px] font-serif leading-[1.05] mb-6 text-foreground">
                Luxury,<br />
                <em style={{ color: '#C9A882', fontStyle: 'italic' }}>without</em>
                <br />compromise.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-md font-light">
                A stroller crafted for modern parents who refuse to settle. Premium materials, thoughtful engineering, and a design that turns heads — every single time.
              </p>
            </div>

            {/* Waitlist form card */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl shadow-xl shadow-primary/5 p-7 md:p-8">
              <h3 className="text-xl font-serif mb-1 text-foreground">Join the Waitlist</h3>
              <p className="text-sm text-muted-foreground mb-5 font-light">
                Lock in <strong className="text-primary font-semibold">20% off</strong> your order at launch. All fields required.
              </p>

              {/* Honeypot — invisible to humans, filled by bots */}
              <input
                ref={honeypotRef}
                type="text"
                name="_hp"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
              />

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="First Name *"
                            className="h-11 bg-white/70 border-gray-200 focus-visible:ring-primary/30 rounded-xl text-sm"
                            {...field}
                            data-testid="input-firstname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Last Name *"
                            className="h-11 bg-white/70 border-gray-200 focus-visible:ring-primary/30 rounded-xl text-sm"
                            {...field}
                            data-testid="input-lastname"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email Address *"
                          type="email"
                          className="h-11 bg-white/70 border-gray-200 focus-visible:ring-primary/30 rounded-xl text-sm"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="productType" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <select
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          data-testid="select-product"
                          className="h-11 w-full rounded-xl border border-gray-200 bg-white/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                          style={{
                            color: field.value ? "inherit" : "#9ca3af",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23999' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                          }}
                        >
                          <option value="" disabled>Which stroller are you interested in? *</option>
                          <option value="single_bassinet" style={{ color: "inherit" }}>The Lara Single Bassinet Stroller</option>
                          <option value="twin_bassinet" style={{ color: "inherit" }}>The Lara Twin Bassinet Stroller</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="country" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <select
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-11 w-full rounded-xl border border-gray-200 bg-white/70 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                          style={{
                            color: field.value ? "inherit" : "#9ca3af",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23999' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                          }}
                        >
                          <option value="" disabled>Where are you located? *</option>
                          <option value="Afghanistan">Afghanistan</option>
                          <option value="Albania">Albania</option>
                          <option value="Algeria">Algeria</option>
                          <option value="Andorra">Andorra</option>
                          <option value="Angola">Angola</option>
                          <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Armenia">Armenia</option>
                          <option value="Australia">Australia</option>
                          <option value="Austria">Austria</option>
                          <option value="Azerbaijan">Azerbaijan</option>
                          <option value="Bahamas">Bahamas</option>
                          <option value="Bahrain">Bahrain</option>
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="Barbados">Barbados</option>
                          <option value="Belarus">Belarus</option>
                          <option value="Belgium">Belgium</option>
                          <option value="Belize">Belize</option>
                          <option value="Benin">Benin</option>
                          <option value="Bhutan">Bhutan</option>
                          <option value="Bolivia">Bolivia</option>
                          <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                          <option value="Botswana">Botswana</option>
                          <option value="Brazil">Brazil</option>
                          <option value="Brunei">Brunei</option>
                          <option value="Bulgaria">Bulgaria</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                          <option value="Cambodia">Cambodia</option>
                          <option value="Cameroon">Cameroon</option>
                          <option value="Canada">Canada</option>
                          <option value="Cape Verde">Cape Verde</option>
                          <option value="Chile">Chile</option>
                          <option value="China">China</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Costa Rica">Costa Rica</option>
                          <option value="Croatia">Croatia</option>
                          <option value="Cuba">Cuba</option>
                          <option value="Cyprus">Cyprus</option>
                          <option value="Czech Republic">Czech Republic</option>
                          <option value="Denmark">Denmark</option>
                          <option value="Dominican Republic">Dominican Republic</option>
                          <option value="Ecuador">Ecuador</option>
                          <option value="Egypt">Egypt</option>
                          <option value="El Salvador">El Salvador</option>
                          <option value="Estonia">Estonia</option>
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="Fiji">Fiji</option>
                          <option value="Finland">Finland</option>
                          <option value="France">France</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Germany">Germany</option>
                          <option value="Ghana">Ghana</option>
                          <option value="Greece">Greece</option>
                          <option value="Guatemala">Guatemala</option>
                          <option value="Honduras">Honduras</option>
                          <option value="Hong Kong">Hong Kong</option>
                          <option value="Hungary">Hungary</option>
                          <option value="Iceland">Iceland</option>
                          <option value="India">India</option>
                          <option value="Indonesia">Indonesia</option>
                          <option value="Iran">Iran</option>
                          <option value="Iraq">Iraq</option>
                          <option value="Ireland">Ireland</option>
                          <option value="Israel">Israel</option>
                          <option value="Italy">Italy</option>
                          <option value="Jamaica">Jamaica</option>
                          <option value="Japan">Japan</option>
                          <option value="Jordan">Jordan</option>
                          <option value="Kazakhstan">Kazakhstan</option>
                          <option value="Kenya">Kenya</option>
                          <option value="Kuwait">Kuwait</option>
                          <option value="Kyrgyzstan">Kyrgyzstan</option>
                          <option value="Latvia">Latvia</option>
                          <option value="Lebanon">Lebanon</option>
                          <option value="Lithuania">Lithuania</option>
                          <option value="Luxembourg">Luxembourg</option>
                          <option value="Macau">Macau</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Maldives">Maldives</option>
                          <option value="Malta">Malta</option>
                          <option value="Mauritius">Mauritius</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Moldova">Moldova</option>
                          <option value="Monaco">Monaco</option>
                          <option value="Mongolia">Mongolia</option>
                          <option value="Montenegro">Montenegro</option>
                          <option value="Morocco">Morocco</option>
                          <option value="Mozambique">Mozambique</option>
                          <option value="Myanmar">Myanmar</option>
                          <option value="Namibia">Namibia</option>
                          <option value="Nepal">Nepal</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="New Zealand">New Zealand</option>
                          <option value="Nicaragua">Nicaragua</option>
                          <option value="Nigeria">Nigeria</option>
                          <option value="North Macedonia">North Macedonia</option>
                          <option value="Norway">Norway</option>
                          <option value="Oman">Oman</option>
                          <option value="Pakistan">Pakistan</option>
                          <option value="Panama">Panama</option>
                          <option value="Papua New Guinea">Papua New Guinea</option>
                          <option value="Paraguay">Paraguay</option>
                          <option value="Peru">Peru</option>
                          <option value="Philippines">Philippines</option>
                          <option value="Poland">Poland</option>
                          <option value="Portugal">Portugal</option>
                          <option value="Qatar">Qatar</option>
                          <option value="Romania">Romania</option>
                          <option value="Russia">Russia</option>
                          <option value="Rwanda">Rwanda</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="Senegal">Senegal</option>
                          <option value="Serbia">Serbia</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Slovakia">Slovakia</option>
                          <option value="Slovenia">Slovenia</option>
                          <option value="South Africa">South Africa</option>
                          <option value="South Korea">South Korea</option>
                          <option value="Spain">Spain</option>
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="Sweden">Sweden</option>
                          <option value="Switzerland">Switzerland</option>
                          <option value="Taiwan">Taiwan</option>
                          <option value="Tanzania">Tanzania</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                          <option value="Tunisia">Tunisia</option>
                          <option value="Turkey">Turkey</option>
                          <option value="Uganda">Uganda</option>
                          <option value="Ukraine">Ukraine</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United States">United States</option>
                          <option value="Uruguay">Uruguay</option>
                          <option value="Uzbekistan">Uzbekistan</option>
                          <option value="Venezuela">Venezuela</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Yemen">Yemen</option>
                          <option value="Zambia">Zambia</option>
                          <option value="Zimbabwe">Zimbabwe</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Not-a-robot checkbox */}
                  <FormField control={form.control} name="notARobot" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <label className="flex items-center gap-3 cursor-pointer select-none group">
                          <div className={`relative h-5 w-5 rounded border-2 transition-colors shrink-0 flex items-center justify-center ${field.value ? "bg-primary border-primary" : "border-gray-300 bg-white group-hover:border-primary/50"}`}>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={field.value ?? false}
                              onChange={field.onChange}
                            />
                            {field.value && (
                              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground font-light">I'm not a robot</span>
                        </label>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-11 text-sm rounded-xl group font-semibold tracking-wide mt-1"
                    data-testid="button-submit"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Secure Your Spot
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {count > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="mt-5 flex items-center gap-3 text-xs text-muted-foreground font-light"
                >
                  <div className="flex -space-x-1.5 shrink-0">
                    <div className="h-5 w-5 rounded-full bg-primary/20 border-2 border-white" />
                    <div className="h-5 w-5 rounded-full bg-primary/40 border-2 border-white" />
                    <div className="h-5 w-5 rounded-full bg-primary/60 border-2 border-white" />
                  </div>
                  <span data-testid="text-waitlist-count">
                    Join <strong className="text-foreground">{count.toLocaleString()}</strong> parents already waiting.
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right — hero stroller image + toggle */}
          <div className="flex flex-col gap-4">

            {/* Animated image — natural ratio so hotspot % coords map 1:1 to image pixels */}
            <div className="rounded-3xl overflow-hidden shadow-2xl shadow-primary/10" style={{ background: "#F5F0EA" }}>
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activePreview}
                    src={PREVIEW_PRODUCTS[activePreview].image}
                    alt={PREVIEW_PRODUCTS[activePreview].name}
                    className="w-full h-auto block"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    data-testid="img-hero"
                  />
                </AnimatePresence>

                {/* Hotspot pins */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activePreview}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="absolute inset-0"
                  >
                    {PREVIEW_PRODUCTS[activePreview].hotspots.map((spot, i) => {
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

                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-sm rounded-full px-3 py-1.5 text-[10px] font-medium text-foreground/60 z-10 pointer-events-none">
                  Hover dots to explore
                </div>
              </div>
            </div>

            {/* Model selector cards */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex gap-3"
            >
              {PREVIEW_PRODUCTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePreview(i)}
                  className={`flex-1 rounded-2xl px-5 py-4 text-left transition-all duration-250 border-2 ${
                    activePreview === i
                      ? "bg-white border-primary/40 shadow-md"
                      : "bg-foreground/4 border-transparent hover:bg-foreground/7"
                  }`}
                >
                  <span className={`text-[10px] font-bold tracking-widest uppercase block mb-1.5 ${activePreview === i ? "text-primary" : "text-muted-foreground/60"}`}>
                    {p.label}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-xl font-semibold tracking-tight ${activePreview === i ? "text-foreground" : "text-foreground/40"}`}>{p.price}</span>
                    <span className={`text-xs font-light ${activePreview === i ? "text-muted-foreground" : "text-foreground/30"}`}>+ tax</span>
                  </div>
                </button>
              ))}
            </motion.div>

            {/* Now Accepting strip */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center justify-between shadow-sm border border-white/70"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-primary">Now Accepting</p>
                  <p className="text-sm font-serif text-foreground">{PREVIEW_PRODUCTS[activePreview].name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground font-light tracking-wide">Early access · Waitlist</p>
                <p className="text-lg font-bold text-primary">20% Off</p>
              </div>
            </motion.div>

            {/* Available In — directly under image */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex items-center gap-5 px-1"
            >
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted-foreground whitespace-nowrap">Available In</span>
              <div className="flex items-center gap-5">
                {COLORS.map((color, i) => (
                  <div key={i} className="group flex items-center gap-2.5 cursor-default">
                    <div
                      className="relative w-8 h-8 rounded-full shadow-md overflow-hidden flex-shrink-0"
                      style={{
                        background: color.preview,
                        border: !color.comingSoon ? '3px solid rgba(0,0,0,0.5)' : '2px solid rgba(0,0,0,0.15)',
                      }}
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground block leading-tight">{color.name}</span>
                      {!color.comingSoon && <span className="text-[10px] font-semibold text-emerald-600 tracking-wide uppercase">Available</span>}
                      {color.comingSoon && <span className="text-[10px] font-semibold text-primary/70 tracking-wide uppercase">Coming Soon</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex items-center gap-4 px-1"
            >
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: shareDone ? "hsl(142,50%,32%)" : "hsl(20,50%,25%)" }}
              >
                {shareDone ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Share2 className="w-3.5 h-3.5" /> Share LaraBaby</>}
              </button>
              {shareCount !== null && shareCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {shareCount.toLocaleString()} {shareCount === 1 ? "person" : "people"} shared
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Share strip ── */}
      <section className="py-10 px-6 border-y border-border/40" style={{ background: "#F5F0EA" }}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-base font-serif text-foreground mb-1">Know someone who'd love this?</p>
            <p className="text-sm text-muted-foreground font-light">
              Share LaraBaby with a parent who deserves the best.
              {shareCount !== null && shareCount > 0 && (
                <span className="ml-2 font-semibold" style={{ color: "hsl(20,50%,35%)" }}>
                  {shareCount.toLocaleString()} {shareCount === 1 ? "person" : "people"} have shared so far.
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleShare}
            className="shrink-0 inline-flex items-center gap-2.5 text-sm font-semibold px-7 py-3.5 rounded-full text-white transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: shareDone ? "hsl(142,50%,32%)" : "hsl(20,50%,25%)" }}
          >
            {shareDone ? (
              <><Check className="w-4 h-4" /> Copied! Thanks for sharing</>
            ) : (
              <><Share2 className="w-4 h-4" /> Share LaraBaby</>
            )}
          </button>
        </div>
      </section>

      {/* ── All Features (unified) ── */}
      <section className="py-28 bg-background px-6 relative overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/4 blur-3xl" />
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-16">
            <h2 className="text-xs font-bold tracking-widest uppercase text-primary mb-4">Everything Included</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-foreground mb-5">
              Built different.<br />Obsessive by design.
            </h3>
            <p className="text-muted-foreground font-light leading-relaxed text-lg">
              Every LaraBaby feature exists for a reason. <span className="text-primary font-bold">★</span> marks the ones that set us apart from every other stroller on the market.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {ALL_FEATURES.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="flex gap-4"
              >
                <div className="shrink-0 mt-1">
                  {item.comingSoon ? (
                    <div className="w-5 h-5 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    </div>
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h4 className="font-serif text-foreground">{item.title}</h4>
                    {item.highlight && <span className="text-primary font-bold leading-none">★</span>}
                    {item.comingSoon && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                        <Sparkles className="w-2.5 h-2.5" /> Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product showcase ── */}
      <section id="products" className="py-32 bg-card px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-xs font-bold tracking-widest uppercase text-primary mb-5">The Collection</h2>
            <h3 className="text-5xl md:text-6xl font-serif text-foreground mb-6">Two strollers. One standard.</h3>
            <p className="text-muted-foreground text-xl font-light leading-relaxed">
              Each LaraBaby model is built to the same exacting standard — because every family deserves the best.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {PRODUCTS.map((product, i) => (
              <Link key={i} href={`/products/${product.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, delay: i * 0.15 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl mb-8 bg-background border border-border/40">
                    <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[11px] font-bold tracking-widest uppercase text-primary border border-white/60 shadow-sm">
                      Coming Soon
                    </div>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                      <span className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-foreground text-sm font-semibold px-6 py-3 rounded-full shadow-lg whitespace-nowrap">
                        View Product <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <h4 className="text-3xl font-serif text-foreground mb-3 group-hover:text-primary transition-colors duration-200">{product.name}</h4>
                  <p className="text-muted-foreground text-lg font-light leading-relaxed">{product.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why LaraBaby ── */}
      <section className="py-28 px-6 text-center" style={{ backgroundColor: '#1a120a' }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-6" style={{ color: '#C9A882' }}>Why LaraBaby?</p>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 text-balance text-white leading-tight">
              Because your child<br />deserves the best.
            </h2>
            <p className="text-lg md:text-xl font-light leading-relaxed text-balance" style={{ color: 'rgba(255,255,255,0.72)' }}>
              We don't settle. We source only the highest-quality components globally, and our standards exceed most industry benchmarks. Because when it comes to your child, "good enough" simply isn't good enough.
            </p>
            <div className="mt-10">
              <a
                href="/#waitlist"
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase px-8 py-4 rounded-full transition-all duration-200"
                style={{ backgroundColor: '#C9A882', color: '#1a120a' }}
              >
                Join the Waitlist <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
