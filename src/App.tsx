import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Play, 
  Instagram, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ChevronRight,
  Menu,
  X,
  Phone,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";

// --- Components ---

const AnimatedStroke = ({ 
  className = "", 
  direction = "horizontal", 
  delay = 0, 
  duration = 1.5 
}: { 
  className?: string; 
  direction?: "horizontal" | "vertical"; 
  delay?: number; 
  duration?: number;
}) => {
  return (
    <motion.div
      initial={direction === "horizontal" ? { scaleX: 0 } : { scaleY: 0 }}
      whileInView={direction === "horizontal" ? { scaleX: 1 } : { scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ originX: 0, originY: 0 }}
      className={`bg-white/10 pointer-events-none ${className}`}
    />
  );
};

const Magnetic: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

const Reveal = ({ children, width = "fit-content" }: { children: React.ReactNode; width?: "fit-content" | "100%" }) => {
  return (
    <div style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.5, delay: 0.25 }}
        viewport={{ once: true }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const WipeText = ({ text, className = "" }: { text: string; className?: string }) => {
  return (
    <span className={`relative inline-block ${className}`} style={{ color: "inherit" }}>
      {/* Base Stroke Layer (Always Visible) */}
      <span 
        className="block select-none relative" 
        style={{ 
          WebkitTextStroke: "1px currentColor",
          WebkitTextFillColor: "transparent",
          color: "inherit",
          zIndex: 1,
          opacity: 1,
          visibility: "visible"
        }}
        aria-hidden="true"
      >
        {text}
      </span>
      
      {/* Fill Layer 1 (50% Opacity) - Wipes from right to left to reveal stroke */}
      <motion.div 
        className="absolute inset-0 select-none pointer-events-none opacity-50 overflow-hidden whitespace-nowrap"
        style={{ 
          WebkitTextFillColor: "currentColor",
          color: "inherit",
          zIndex: 2,
          direction: "rtl", // Wipe from right to left
          textAlign: "left"
        }}
        initial={{ width: "100%" }}
        whileInView={{ width: "0%" }}
        viewport={{ once: true }}
        transition={{
          delay: 1.5,
          duration: 1.5,
          ease: [0.645, 0.045, 0.355, 1]
        }}
      >
        <span style={{ direction: "ltr", display: "block" }}>{text}</span>
      </motion.div>

      {/* Fill Layer 2 (Top Layer, 100% Opacity) - Wipes from right to left */}
      <motion.div 
        className="absolute inset-0 select-none pointer-events-none overflow-hidden whitespace-nowrap"
        style={{ 
          WebkitTextFillColor: "currentColor",
          color: "inherit",
          zIndex: 3,
          direction: "rtl",
          textAlign: "left"
        }}
        initial={{ width: "100%" }}
        whileInView={{ width: "0%" }}
        viewport={{ once: true }}
        transition={{
          delay: 0.5,
          duration: 1.5,
          ease: [0.645, 0.045, 0.355, 1]
        }}
      >
        <span style={{ direction: "ltr", display: "block" }}>{text}</span>
      </motion.div>
    </span>
  );
};

const ScrollSection = ({ children, id, className = "" }: { children: React.ReactNode, id?: string, className?: string }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <motion.section
      id={id}
      ref={ref}
      style={{ opacity, scale }}
      className={`relative ${className}`}
    >
      {children}
    </motion.section>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Story", href: "#story" },
    { name: "Services", href: "#services" },
    { name: "Works", href: "#works" },
    { name: "Process", href: "#process" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav 
        className={`transition-all duration-700 ${
          scrolled ? "bg-brand-red/95 backdrop-blur-xl py-6 border-b border-white/5" : "bg-transparent py-10 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <a href="#" className="flex items-center group">
            <img 
              src="https://i.postimg.cc/j250f7G7/logo-white.png" 
              alt="Mellow Production" 
              className="w-[54px] h-[44px] object-contain"
              referrerPolicy="no-referrer"
              decoding="async"
            />
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-16">
            {navLinks.map((link) => (
              <Magnetic key={link.name}>
                <a 
                  href={link.href} 
                  className="text-[10px] font-bold tracking-[0.4em] uppercase opacity-60 hover:opacity-100 transition-opacity"
                >
                  {link.name}
                </a>
              </Magnetic>
            ))}
            <Magnetic>
              <a 
                href="#contact" 
                className="w-10 h-10 flex items-center justify-center border border-white/20 hover:border-white hover:bg-white hover:text-brand-red transition-all duration-500"
                aria-label="Contact"
              >
                <Mail size={16} />
              </a>
            </Magnetic>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-brand-red border-b border-white/10 p-8 flex flex-col gap-6 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold uppercase tracking-tighter"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#contact" 
              onClick={() => setIsOpen(false)}
              className="text-2xl font-bold uppercase tracking-tighter text-white/50"
            >
              Contact
            </a>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <ScrollSection className="h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
      <div ref={ref} className="absolute inset-0 pointer-events-none">
        {/* Background Lines */}
        <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
          <div className="absolute top-0 left-2/4 w-px h-full bg-white" />
          <div className="absolute top-0 left-3/4 w-px h-full bg-white" />
        </motion.div>
        <motion.div style={{ y: y2 }} className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-1/4 left-0 w-full h-px bg-white" />
          <div className="absolute top-2/4 left-0 w-full h-px bg-white" />
          <div className="absolute top-3/4 left-0 w-full h-px bg-white" />
        </motion.div>
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
              delayChildren: 0.3,
            }
          }
        }}
        className="text-center z-10 w-full max-w-4xl mx-auto"
      >
        <h1 className="text-5xl sm:text-7xl md:text-[8vw] lg:text-[6vw] font-display font-extrabold leading-[1] tracking-[-0.05em] uppercase mb-12">
          <span className="sr-only">Creative Video Production Studio in Kerala | Mellow Production</span>
          <motion.span 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="block"
          >
            Crafting
          </motion.span>
          <motion.span 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="block"
          >
            <WipeText text="Visual" />
          </motion.span>
          <motion.span 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="block"
          >
            Impact
          </motion.span>
        </h1>
        
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
          }}
          className="flex gap-4 justify-center items-center"
        >
          <Magnetic>
            <a 
              href="#contact" 
              className="w-14 h-14 group flex items-center justify-center bg-white text-brand-red hover:bg-transparent hover:text-white border border-white transition-all duration-500"
              aria-label="Contact Us"
            >
              <Mail size={20} />
            </a>
          </Magnetic>
          <Magnetic>
            <a 
              href="#works" 
              className="w-14 h-14 flex items-center justify-center border border-white/20 hover:border-white transition-all duration-500"
              aria-label="View Works"
            >
              <Play size={18} fill="currentColor" />
            </a>
          </Magnetic>
          <Magnetic>
            <a 
              href="https://www.instagram.com/mellow.production_/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-14 h-14 flex items-center justify-center border border-white/20 hover:border-white transition-all duration-500"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* Floating Accents */}
      <div className="absolute bottom-16 left-16 hidden lg:block">
        <div className="border border-white/10 p-6 flex flex-col gap-3">
          <span className="text-[9px] uppercase tracking-[0.5em] opacity-30">Est. 2022</span>
          <span className="text-[10px] font-mono opacity-50 tracking-widest">09/04/2026 // KERALA</span>
        </div>
      </div>
    </ScrollSection>
  );
};

const About = () => {
  return (
    <ScrollSection id="about" className="py-20 md:py-40 px-6 border-t border-white/5 relative">
      <AnimatedStroke className="absolute top-0 left-0 w-full h-px bg-white/20" delay={0.2} />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full lg:w-1/2"
        >
          <h2 className="text-[10px] font-mono uppercase tracking-[0.6em] mb-6 md:mb-10 opacity-30">01 // Our Story</h2>
          <h3 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-display font-extrabold tracking-[-0.05em] uppercase leading-[0.9] break-words">
            What is <br /> <WipeText text="Mellow" /> <br /> Production?
          </h3>
          <div className="absolute -top-16 -left-16 w-64 h-64 border border-white/[0.02] pointer-events-none hidden md:block" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
          className="space-y-8 md:space-y-10 lg:mt-24 w-full lg:w-1/2"
        >
          <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed tracking-tight opacity-70">
            <p>
              Mellow Production is a premier creative digital media production studio based in Kerala, serving Malappuram, Calicut, and Valanchery. We specialize in high-impact ads, professional event coverage, reels, and cinematic brand films designed to elevate your brand with impactful visuals.
            </p>
            <p>
              Our journey began with a simple vision: to bring world-class cinematography and storytelling to the heart of Kerala. Today, we are recognized as one of the best video production studios in the region, blending technical precision with an artistic flair that captures the essence of every brand we work with.
            </p>
            <p>
              Whether it's a large-scale commercial ad film or an intimate brand story, our team of dedicated creators works tirelessly to ensure every frame tells a compelling narrative. We don't just produce videos; we craft visual experiences that resonate with audiences and drive real results for businesses.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:gap-12 pt-10 md:pt-12 border-t border-white/5">
            <div>
              <span className="block text-4xl md:text-5xl font-display font-extrabold mb-2 tracking-tighter">100+</span>
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30">Projects Delivered</span>
            </div>
            <div>
              <span className="block text-4xl md:text-5xl font-display font-extrabold mb-2 tracking-tighter">50+</span>
              <span className="text-[10px] uppercase tracking-[0.4em] opacity-30">Happy Clients</span>
            </div>
          </div>
        </motion.div>
      </div>
    </ScrollSection>
  );
};

const Story = () => {
  return (
    <ScrollSection id="story" className="py-20 md:py-40 px-6 bg-white text-brand-red border-t border-brand-red/5 relative">
      <AnimatedStroke 
        direction="vertical" 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-brand-red/10" 
        delay={0.5} 
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.6em] mb-8 md:mb-10 opacity-30">02 // Cinematic Ads & Brand Films</h2>
          <h3 className="text-5xl sm:text-6xl md:text-8xl font-display font-extrabold tracking-[-0.05em] uppercase leading-[0.8]">
            The <br /> <WipeText text="Journey" />
          </h3>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          <div className="w-full lg:w-5/12">
            <p className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight leading-[1.1] uppercase mb-8 md:mb-10">
              Mellow Production didn’t start as a company. It started as a one-person journey.
            </p>
            <div className="w-24 h-px bg-brand-red opacity-20" />
          </div>
          
          <div className="w-full lg:w-7/12 space-y-8 md:space-y-10 text-lg md:text-xl font-light leading-relaxed opacity-80">
            <p>
              Back in 2022, I began working independently — taking up small projects, experimenting with visuals, and learning everything hands-on. There was no big setup, no team, no roadmap. Just curiosity, consistency, and a strong interest in creating content that actually connects.
            </p>
            <p>
              Each project became a stepping stone. Ads, reels, event coverage — every experience shaped the way I approached storytelling. Over time, the focus shifted from just creating visuals to creating impact. Not just content, but purposeful visuals that elevate brands.
            </p>
            <p>
              What started as freelance work slowly evolved into something more structured. Better systems, better quality, clearer direction.
            </p>
            <p className="font-display font-bold uppercase tracking-tighter text-xl sm:text-2xl md:text-3xl opacity-100">
              That’s how Mellow Production was built.
            </p>
            <p>
              Today, it stands as a creative digital media production studio focused on ads, event coverage, reels, and brand films — designed to help brands communicate with clarity and impact.
            </p>
            <div className="pt-8 md:pt-10 border-t border-brand-red/10">
              <p className="italic">
                The journey is still evolving. But the core remains the same — keep it simple, keep it meaningful, and make every visual count.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ScrollSection>
  );
};

const Services = () => {
  const services = [
    { id: "01", title: "Ads", desc: "High-conversion commercial ad films and promotional videos designed to capture attention and drive results for brands across Kerala." },
    { id: "02", title: "Event Coverage", desc: "Professional cinematic coverage for weddings, corporate events, and product launches in Malappuram, Calicut, and beyond." },
    { id: "03", title: "Reels", desc: "Viral-ready short-form video content and social media marketing reels optimized for engagement on Instagram and TikTok." },
    { id: "04", title: "Brand Films", desc: "Cinematic storytelling and high-end corporate films that define your unique brand identity and build trust with your audience." },
    { id: "05", title: "Creative Direction", desc: "Visionary guidance and concept development for visual storytelling, ensuring your project has a clear and impactful message." },
    { id: "06", title: "Content Production", desc: "End-to-end digital media production solutions, from pre-production planning to final post-production and delivery." },
  ];

  return (
    <ScrollSection id="services" className="py-20 md:py-40 px-6 bg-white text-brand-red relative">
      <AnimatedStroke className="absolute top-0 left-0 w-full h-px bg-brand-red/10" delay={0.1} />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between lg:items-end mb-16 md:mb-24 gap-8">
          <div>
            <h2 className="text-xs font-mono uppercase tracking-[0.6em] mb-6 md:mb-8 opacity-40">03 // Our Services</h2>
            <h3 className="text-5xl sm:text-6xl md:text-8xl font-display font-extrabold tracking-[-0.05em] uppercase leading-[0.8]">
              Our <br /> Services
            </h3>
            {/* SEO H2s */}
            <h2 className="sr-only">Event & Wedding Coverage</h2>
            <h2 className="sr-only">Viral Reels & Social Media Content</h2>
          </div>
          <div className="max-w-md space-y-4 text-lg md:text-xl font-light opacity-70 leading-relaxed">
            <p>
              We blend technical precision with creative flair to deliver visuals that don't just look good—they perform. Our services are tailored to meet the unique needs of brands in Kerala and beyond.
            </p>
            <p className="text-sm opacity-60">
              From viral social media content to corporate brand films, we provide end-to-end production solutions that help you stand out in a crowded digital landscape.
            </p>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-red/5 border border-brand-red/5"
        >
          {services.map((service) => (
            <motion.div 
              key={service.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
              }}
              whileHover={{ backgroundColor: "rgba(249, 1, 2, 0.02)" }}
              className="bg-white p-8 md:p-12 transition-colors duration-700 group cursor-pointer border border-brand-red/5"
            >
              <span className="block font-mono text-[10px] mb-8 md:mb-12 opacity-30 tracking-widest">{service.id}</span>
              <h4 className="text-3xl md:text-4xl font-display font-extrabold uppercase tracking-tighter mb-4 md:mb-6">{service.title}</h4>
              <p className="text-sm opacity-50 group-hover:opacity-80 transition-opacity leading-relaxed">{service.desc}</p>
              <div className="mt-8 md:mt-12 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                <ArrowRight strokeWidth={1.5} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </ScrollSection>
  );
};

const Portfolio = () => {
  return (
    <ScrollSection id="works" className="py-20 md:py-40 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24">
          <h2 className="text-sm font-mono uppercase tracking-[0.5em] mb-8 opacity-50">04 // Our Work / Portfolio</h2>
          <h3 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter uppercase leading-none">
            Selected <br /> Works
          </h3>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="py-20 md:py-32 border border-dashed border-white/20 flex flex-col items-center justify-center text-center px-6"
        >
          <p className="text-xl md:text-3xl font-light tracking-tight mb-8 max-w-2xl">
            Our portfolio is updating, check our Instagram page for the latest work.
          </p>
          <Magnetic>
            <a 
              href="https://www.instagram.com/mellow.production_/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-16 h-16 flex items-center justify-center border border-white/20 hover:border-white transition-all duration-500"
              aria-label="Instagram"
            >
              <Instagram size={32} />
            </a>
          </Magnetic>
        </motion.div>
      </div>
    </ScrollSection>
  );
};

const Process = () => {
  const steps = [
    { title: "Discover", desc: "We start by diving deep into your brand's DNA, understanding your core values, target audience, and specific project goals to ensure our creative direction aligns perfectly with your vision." },
    { title: "Concept", desc: "Our creative team develops a unique visual narrative and storyboard, crafting a compelling story that will resonate with your audience and set your brand apart from the competition." },
    { title: "Shoot", desc: "Using state-of-the-art equipment and professional lighting, we capture high-end cinematic visuals across Kerala, focusing on every detail to ensure the highest production quality." },
    { title: "Edit", desc: "In the post-production phase, we refine the story with precision, incorporating professional color grading, sound design, and visual effects to create a polished and impactful final product." },
    { title: "Deliver", desc: "We provide you with final assets optimized for various platforms, ensuring your content is ready to make a significant impact and drive engagement across all digital channels." },
  ];

  return (
    <ScrollSection id="process" className="py-20 md:py-40 px-6 border-y border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-16 md:mb-24">
          <h2 className="text-sm font-mono uppercase tracking-[0.5em] mb-8 opacity-50">05 // Our Production Process</h2>
          <h3 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter uppercase leading-none">
            The <br /> <WipeText text="Process" />
          </h3>
        </div>

        <div className="relative">
          {/* Vertical Line for Mobile */}
          <div className="absolute left-4 top-0 w-px h-full bg-white/10 md:hidden" />
          
          <div className="space-y-0">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group flex flex-col md:flex-row md:items-center border-b border-white/10 py-8 md:py-16 relative"
              >
                <div className="flex items-center gap-8 md:w-1/3">
                  <span className="text-sm font-mono opacity-30">0{idx + 1}</span>
                  <h4 className="text-3xl md:text-5xl font-display font-extrabold uppercase tracking-tighter group-hover:translate-x-4 transition-transform duration-500">
                    {step.title}
                  </h4>
                </div>
                <p className="mt-4 md:mt-0 md:w-2/3 text-base md:text-lg opacity-60 font-light max-w-xl">
                  {step.desc}
                </p>
                <div className="hidden md:block absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={40} strokeWidth={1} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </ScrollSection>
  );
};

const WhyChooseUs = () => {
  return (
    <ScrollSection id="why-us" className="py-20 md:py-40 px-6 bg-white text-brand-red border-t border-brand-red/5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-24">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.6em] mb-8 md:mb-10 opacity-30">05 // Why Choose Us</h2>
          <h3 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter uppercase leading-none">
            Why <br /> Mellow?
          </h3>
          <div className="mt-12 max-w-2xl text-lg opacity-60 font-light leading-relaxed">
            <p>
              Choosing the right video production partner is crucial for your brand's success. At Mellow Production, we combine years of experience in the Kerala media industry with a fresh, creative perspective. Our commitment to quality and storytelling has made us a trusted choice for businesses in Malappuram, Calicut, and beyond.
            </p>
            <p className="mt-4">
              We understand that every project is unique, which is why we offer personalized solutions that align with your specific goals. Whether you're looking to create a viral reel or a cinematic brand film, we have the expertise and passion to bring your vision to life.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-brand-red/5">
          <div className="p-12 md:p-16 bg-white border border-brand-red/5">
            <h3 className="text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tighter mb-6">Creativity</h3>
            <p className="text-sm opacity-60 leading-relaxed">Pushing boundaries with unique visual concepts that stand out in a crowded digital landscape.</p>
          </div>
          <div className="p-12 md:p-16 bg-white border border-brand-red/5">
            <h3 className="text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tighter mb-6">Quality</h3>
            <p className="text-sm opacity-60 leading-relaxed">Uncompromising standards in production and post-production for a premium final result.</p>
          </div>
          <div className="p-12 md:p-16 bg-white border border-brand-red/5">
            <h3 className="text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tighter mb-6">Storytelling</h3>
            <p className="text-sm opacity-60 leading-relaxed">We don't just film; we tell stories that resonate with your audience on a deeper level.</p>
          </div>
        </div>
      </div>
    </ScrollSection>
  );
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    projectType: "Ads",
    message: ""
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const projectTypes = ["Ads", "Event Coverage", "Reels", "Brand Film", "Creative Direction", "Others"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Name: ${formData.name}%0AProject Type: ${formData.projectType}%0AMessage: ${formData.message}`;
    window.open(`https://wa.me/919633384858?text=${text}`, "_blank");
  };

  return (
    <section id="contact" className="py-20 md:py-40 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-20">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-[0.5em] mb-8 opacity-50">06 // Contact / Get a Quote</h2>
          <h3 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter uppercase leading-none mb-12">
            Let's <br /> Create <br /> Magic.
          </h3>
          
          <div className="space-y-6 md:space-y-8">
            <a href="mailto:hello@mellowproduction.in" className="flex items-center gap-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-brand-red transition-all">
                <Mail size={18} />
              </div>
              <span className="text-lg md:text-xl font-bold">hello@mellowproduction.in</span>
            </a>
            <a href="tel:+919633384858" className="flex items-center gap-4 group">
              <div className="w-10 h-10 md:w-12 md:h-12 border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-brand-red transition-all">
                <Phone size={18} />
              </div>
              <span className="text-lg md:text-xl font-bold">+91 96 33 38 48 58</span>
            </a>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 border border-white/20 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <span className="text-lg md:text-xl font-bold">Malappuram | Calicut | Valanchery, Kerala</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-8 md:p-12 border border-white/10 relative">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest opacity-50">Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent border-b border-white/20 py-3 focus:border-white outline-none transition-colors" 
                placeholder="John Doe" 
              />
            </div>

            <div className="space-y-2 relative">
              <label className="text-[10px] uppercase tracking-widest opacity-50">Project Type</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full border-b border-white/20 py-3 flex justify-between items-center cursor-pointer hover:border-white transition-colors"
              >
                <span className={formData.projectType ? "text-white" : "opacity-30"}>
                  {formData.projectType || "Select Type"}
                </span>
                <ChevronRight className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-90" : ""}`} size={16} />
              </div>
              
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 w-full bg-brand-red border border-white/10 z-20 mt-2 overflow-hidden"
                >
                  {projectTypes.map((type) => (
                    <div 
                      key={type}
                      onClick={() => {
                        setFormData({ ...formData, projectType: type });
                        setIsDropdownOpen(false);
                      }}
                      className="px-6 py-4 hover:bg-white hover:text-brand-red transition-colors cursor-pointer text-sm font-bold uppercase tracking-widest"
                    >
                      {type}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest opacity-50">Message</label>
              <textarea 
                rows={4} 
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-transparent border-b border-white/20 py-3 focus:border-white outline-none transition-colors resize-none" 
                placeholder="Tell us about your project..."
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="w-16 h-16 bg-white text-brand-red flex items-center justify-center hover:bg-transparent hover:text-white border border-white transition-all"
                aria-label="Send via WhatsApp"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const internalLinks = [
    { name: "Our Services", href: "#services" },
    { name: "Portfolio", href: "#works" },
    { name: "Contact Us", href: "#contact" }
  ];

  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center">
          <Magnetic>
            <a href="/">
              <img 
                src="https://i.postimg.cc/j250f7G7/logo-white.png" 
                alt="Mellow Production" 
                className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </a>
          </Magnetic>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
          {internalLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity font-bold"
            >
              {link.name}
            </a>
          ))}
          <Link
            to="/admin"
            className="text-[10px] uppercase tracking-widest font-extrabold text-white bg-brand-red/90 hover:bg-brand-red px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-md hover:shadow-brand-red/20"
          >
            <Lock size={11} />
            <span>Client Login</span>
          </Link>
          <a 
            href="https://www.premiumbeat.com/blog/category/video-production/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity font-bold"
          >
            Industry Insights
          </a>
        </div>
        
        <div className="flex gap-8">
          <Magnetic>
            <a href="https://www.instagram.com/mellow.production_/" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity" aria-label="Instagram">
              <Instagram size={20} />
            </a>
          </Magnetic>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="text-[10px] uppercase tracking-widest opacity-30">
            © 2026 Mellow Production. All rights reserved.
          </div>
          <a 
            href="https://instagram.com/heysaneej" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-brand-red/20 border border-white/10 font-bold text-[10px] text-white/80 px-4 py-2 rounded-full uppercase tracking-[0.2em] transition-all hover:bg-white hover:text-brand-red hover:border-white"
          >
            developed by saneejified
          </a>
        </div>
      </div>
    </footer>
  );
};

// --- Main Website Homepage Component ---

export function MainWebsite() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen selection:bg-white selection:text-brand-red overflow-x-hidden relative noise">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[20000] bg-brand-red flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <img 
                src="https://i.postimg.cc/j250f7G7/logo-white.png" 
                alt="Mellow Production" 
                className="h-12 w-auto object-contain"
                referrerPolicy="no-referrer"
                decoding="async"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.65" 
              numOctaves="3" 
              stitchTiles="stitch" 
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <Navbar />
      <Hero />
      <About />
      <Story />
      <Services />
      <Portfolio />
      <Process />
      <WhyChooseUs />
      <Contact />
      <Footer />
      
      {/* Global Stroke Accents */}
      <motion.div 
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
        style={{ originY: 0 }}
        className="fixed top-0 left-6 w-px h-full bg-white/5 pointer-events-none z-0" 
      />
      <motion.div 
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ originY: 0 }}
        className="fixed top-0 right-6 w-px h-full bg-white/5 pointer-events-none z-0" 
      />
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        style={{ originX: 0 }}
        className="fixed top-1/4 left-0 w-full h-px bg-white/5 pointer-events-none z-0" 
      />
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        style={{ originX: 0 }}
        className="fixed top-2/4 left-0 w-full h-px bg-white/5 pointer-events-none z-0" 
      />
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        style={{ originX: 0 }}
        className="fixed top-3/4 left-0 w-full h-px bg-white/5 pointer-events-none z-0" 
      />
    </div>
  );
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./components/common/Toast";
import { OfflineBanner } from "./components/common/OfflineBanner";
import { CommandPalette } from "./components/common/CommandPalette";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ProjectPage } from "./pages/ProjectPage";
import { GalleryPage } from "./pages/GalleryPage";

export default function App() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <OfflineBanner />
          <BrowserRouter>
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
            <Routes>
              <Route path="/" element={<MainWebsite />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/projects/:projectSlug" element={<ProjectPage />} />
              <Route path="/projects/:projectSlug/:eventSlug" element={<GalleryPage />} />
              <Route path="*" element={<MainWebsite />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
