import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";

export default function ThankYou() {
  return (
    <Layout>
      <div className="flex-grow flex items-center justify-center p-6 py-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full glass-panel rounded-3xl p-10 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-8">
            <Check className="w-8 h-8 text-primary" />
          </div>
          
          <h1 className="text-4xl font-serif mb-4 text-balance">You're on the list.</h1>
          
          <p className="text-lg text-muted-foreground mb-8 font-light leading-relaxed">
            Thank you for joining the LaraBaby waitlist. We'll send your <strong>20% discount code</strong> to your inbox as soon as we announce the official drop date.
          </p>
          
          <div className="bg-card rounded-xl p-6 mb-8 border border-border/50 text-left">
            <h3 className="font-medium mb-2 text-sm uppercase tracking-wider text-muted-foreground">What happens next?</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-serif italic">1.</span>
                <span className="text-muted-foreground font-light">Watch your email for behind-the-scenes design updates.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-serif italic">2.</span>
                <span className="text-muted-foreground font-light">Get early access to our pre-order window.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-serif italic">3.</span>
                <span className="text-muted-foreground font-light">Use your discount to secure your LaraBaby stroller.</span>
              </li>
            </ul>
          </div>
          
          <Link href="/">
            <Button variant="outline" className="w-full h-12 rounded-xl text-base hover-elevate" data-testid="button-back-home">
              Return Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
