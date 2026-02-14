'use client';

import { IoBriefcase, IoCard, IoPersonAdd, IoSearch } from "react-icons/io5";
import { motion } from "framer-motion";

const steps = [
  {
    id: 1,
    title: "Create Account",
    description: "Sign up for free, set up your profile, and showcase your skills.",
    icon: IoPersonAdd,
    color: "bg-blue-500"
  },
  {
    id: 2,
    title: "Post or Find Jobs",
    description: "Browse tailored projects or post your requirements to find talent.",
    icon: IoSearch,
    color: "bg-purple-500"
  },
  {
    id: 3,
    title: "Connect & Work",
    description: "Collaborate via our secure platform with built-in tools.",
    icon: IoBriefcase,
    color: "bg-pink-500"
  },
  {
    id: 4,
    title: "Secure Payment",
    description: "Payments are held securely and released only when you're 100% satisfied.",
    icon: IoCard,
    color: "bg-emerald-500"
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-zinc-50 dark:bg-black overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary1/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary2/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-primary1 bg-primary1/10 mb-4"
          >
            Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight"
          >
            How it works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-zinc-500 dark:text-zinc-400"
          >
            Get started in minutes within our simplified workflow designed for speed and security.
          </motion.p>
        </div>
        
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="relative mb-6">
                  <div className={`absolute inset-0 ${step.color} rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-300`}></div>
                  <div className="relative flex items-center justify-center w-24 h-24 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-10 h-10 text-zinc-900 dark:text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm border-4 border-white dark:border-zinc-900">
                    {step.id}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3 group-hover:text-primary1 transition-colors">
                  {step.title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
