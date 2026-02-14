'use client';

import { IoMdClock } from "react-icons/io";
import { IoCheckmarkDoneCircle, IoFlash, IoShield } from "react-icons/io5";
import { motion } from "framer-motion";

const features = [
  {
    name: "Quality Work",
    description: "Access a global pool of verified talent. Our rating system ensures top-quality deliverables every time.",
    icon: IoCheckmarkDoneCircle,
    className: "md:col-span-2",
    color: "from-blue-500/20 to-cyan-500/20 text-blue-500"
  },
  {
    name: "Safe and Secure",
    description: "Your funds are protected in escrow. Release payment only when you are 100% satisfied with the work.",
    icon: IoShield,
    className: "md:col-span-1",
    color: "from-emerald-500/20 to-green-500/20 text-emerald-500"
  },
  {
    name: "24/7 Support",
    description: "Our dedicated support team is available around the clock to assist you with any questions or issues.",
    icon: IoMdClock,
    className: "md:col-span-1",
    color: "from-purple-500/20 to-pink-500/20 text-purple-500"
  },
  {
    name: "Fast Delivery",
    description: "Get your projects completed on time. Set deadlines and track progress with built-in tools.",
    icon: IoFlash,
    className: "md:col-span-2",
    color: "from-amber-500/20 to-orange-500/20 text-amber-500"
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Features() {
  return (
    <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary1/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:text-center mb-16">
            <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-primary1 bg-primary1/10 mb-4"
          >
            Features
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
          >
            Everything you need to succeed
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-zinc-500 dark:text-zinc-400 lg:mx-auto"
          >
            Powerful tools and features designed to help you find talent, manage work, and pay safely.
          </motion.p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
            {features.map((feature) => (
              <motion.div 
                key={feature.name} 
                variants={item}
                whileHover={{ y: -5 }}
                className={`group relative p-8 rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 ${feature.className}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
                
                <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className={`h-8 w-8 ${feature.color.split(' ').pop()}`} aria-hidden="true" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                        {feature.name}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {feature.description}
                    </p>
                </div>
              </motion.div>
            ))}
        </motion.div>
      </div>
    </section>
  );
}
