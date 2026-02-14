'use client';

import { motion } from "framer-motion";


const testimonials = [
  {
    content: "FreeLance has been a game-changer for our business. We found the perfect developer for our project within days.",
    author: "Sarah Thompson",
    role: "CEO at TechStart",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Thompson&background=0D8ABC&color=fff"
  },
  {
    content: "As a freelancer, this platform provides me with consistent high-quality work. The payment security is top-notch.",
    author: "Michael Chen",
    role: "Senior Graphic Designer",
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=random"
  },
  {
    content: "The support team is incredibly helpful. Any issues I've had were resolved quickly and professionally.",
    author: "Emily Rodriguez",
    role: "Marketing Director",
    avatar: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=random"
  },
  {
     content: "I love how easy it is to communicate with clients. The built-in tools make project management a breeze.",
     author: "David Kim",
     role: "Full Stack Developer",
     avatar: "https://ui-avatars.com/api/?name=David+Kim&background=random"
  },
  {
      content: "Found an amazing copywriter for my website. The process was smooth and the results exceeded my expectations.",
      author: "Jessica Lee",
      role: "Small Business Owner",
      avatar: "https://ui-avatars.com/api/?name=Jessica+Lee&background=random"
  },
  {
      content: "The platform's interface is intuitive and user-friendly. Simplifies the entire hiring process significantly.",
      author: "Robert Fox",
      role: "Project Manager",
      avatar: "https://ui-avatars.com/api/?name=Robert+Fox&background=random"
  }
];

// Duplicate testimonials to create a seamless loop
const duplicatedTestimonials = [...testimonials, ...testimonials];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-zinc-50 dark:bg-zinc-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        <div className="text-center">
            <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-primary1 bg-primary1/10 mb-4"
          >
            Testimonials
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-4xl"
          >
            Trusted by businesses worldwide
          </motion.h2>
          <motion.p
             initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 max-w-2xl text-xl text-zinc-500 dark:text-zinc-400 lg:mx-auto"
          >
             Don't just take our word for it — hear what our community has to say.
          </motion.p>
        </div>
      </div>
        
      <div className="relative w-full overflow-hidden mask-image-gradient">
        {/* Gradients for fading edges */}
        <div className="absolute top-0 left-0 z-10 h-full w-32 bg-gradient-to-r from-zinc-50 dark:from-zinc-900 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 z-10 h-full w-32 bg-gradient-to-l from-zinc-50 dark:from-zinc-900 to-transparent pointer-events-none"></div>

        <div className="flex overflow-hidden">
             <MarqueeContent direction="left" speed={40} />
        </div>
      </div>
    </section>
  );
}

function MarqueeContent({ direction = "left", speed = 20 }: { direction?: "left" | "right", speed?: number }) {
  return (
    <motion.div
      className="flex gap-6 py-4"
      initial={{ x: direction === "left" ? 0 : "-50%" }}
      animate={{ x: direction === "left" ? "-50%" : 0 }}
      transition={{
        duration: speed,
        ease: "linear",
        repeat: Infinity,
      }}
      style={{ width: "max-content" }}
    >
      {[...duplicatedTestimonials, ...duplicatedTestimonials].map((testimonial, index) => (
        <div 
          key={index} 
          className="w-[350px] md:w-[400px] flex-shrink-0 bg-white dark:bg-zinc-800 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center mb-6">
            <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary1/20">
                 <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="ml-4">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">{testimonial.author}</h4>
              <p className="text-sm text-primary1 font-medium">{testimonial.role}</p>
            </div>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 italic leading-relaxed">"{testimonial.content}"</p>
          
          <div className="mt-6 flex space-x-1">
             {[1,2,3,4,5].map(star => (
                 <svg key={star} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                     <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                 </svg>
             ))}
          </div>
        </div>
      ))}
    </motion.div>
  )
}
