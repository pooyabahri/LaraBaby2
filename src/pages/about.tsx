import React from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";

export default function About() {
  return (
    <Layout>
      <section className="pt-40 pb-20 px-6 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl md:text-7xl font-serif text-balance leading-[1.1] mb-8 text-foreground">
            Born from obsession.
          </h1>
          <p className="text-xl text-muted-foreground text-balance leading-relaxed font-light max-w-2xl mx-auto">
            We couldn't find a stroller that was both functional and beautiful. So we built our own.
          </p>
        </motion.div>

        <div className="space-y-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="prose prose-lg prose-neutral mx-auto"
          >
            <h2 className="font-serif text-3xl mb-6 text-foreground">Our Story</h2>
            <p className="text-muted-foreground font-light leading-relaxed mb-6">
              When our CEO welcomed twins into the world, he faced a choice that every parent comes across: settle for a stroller that was incredibly functional but looked like hiking gear, or choose a beautiful one that felt flimsy and broke down after six months.
            </p>
            <p className="text-muted-foreground font-light leading-relaxed">
              Why was there no "both"? Why couldn't a stroller handle cobblestones and airport gates while still looking like a meticulously crafted piece of design? He spent two years sourcing the finest materials globally, studying aerospace engineering for frame strength, and building the stroller he always wanted. LaraBaby was born from that obsession.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-card rounded-3xl p-10 md:p-16 border border-border/50 shadow-xl"
          >
            <h2 className="font-serif text-3xl mb-6 text-foreground text-center">Our Commitment</h2>
            <p className="text-muted-foreground font-light leading-relaxed text-center max-w-2xl mx-auto text-lg">
              We source only the highest-quality materials. Every component is tested, vetted, and chosen for one reason — to give your child the best start possible. Our standards don't just meet industry benchmarks; they exceed them.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            {[
              { title: "Quality First", desc: "No compromises. Only the finest fabrics and aerospace-grade metals." },
              { title: "Design That Lasts", desc: "Timeless aesthetics built to endure multiple children and countless memories." },
              { title: "Built With Love", desc: "Created by parents, for parents, with an intimate understanding of what matters." }
            ].map((value, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                </div>
                <h3 className="font-serif text-xl mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
