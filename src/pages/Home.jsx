
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/api/entities";
import ProductSlideshow from "@/components/products/ProductSlideshow";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Home() {
  const [mugs, setMugs] = useState([]);
  const [pouches, setPouches] = useState([]);
  const [tshirts, setTshirts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAndCategorizeProducts = async () => {
      try {
        setIsLoading(true);
        const products = await Product.list();
        setMugs(products.filter((p) => p.category === 'cups'));
        setPouches(products.filter((p) => p.category === 'makeup_pouches'));
        setTshirts(products.filter((p) => p.category === 't_shirts'));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAndCategorizeProducts();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-brand-bg relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-primary border-b-4 border-brand-dark-surface">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,.03) 10px, rgba(0,0,0,.03) 20px)`
          }}></div>
        </div>
        
        {/* Spray paint accents */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-accent/15 rounded-full blur-3xl"></div>
        
        {/* Corner accent stripes */}
        <div className="absolute top-0 left-0 w-2 h-32 bg-brand-accent"></div>
        <div className="absolute top-0 right-0 w-2 h-32 bg-brand-accent"></div>
        <div className="absolute bottom-0 left-0 w-32 h-2 bg-brand-accent"></div>
        <div className="absolute bottom-0 right-0 w-32 h-2 bg-brand-accent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}>

            <motion.div 
              className="inline-block bg-black text-white px-8 py-3 mb-6 border-2 border-brand-dark-surface font-black text-sm uppercase tracking-wider transform -rotate-2 shadow-xl"
              whileHover={{ rotate: 0, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              LEBANESE STREETWEAR
            </motion.div>

            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/686ced9f85654a8ac847289f/97514f1b1_kifakco-01.png?transform=h_160,q_90"
              alt="Kifak Co. Logo"
              className="h-32 md:h-40 mx-auto mb-8 drop-shadow-2xl"
              loading="eager" />


            <h1 className="text-7xl md:text-9xl font-black text-black font-display uppercase tracking-tight leading-none mb-6 stencil-text">
              GIFTS WITH
              <span className="block text-brand-accent mt-2 transform -rotate-1 inline-block">AN ACCENT</span>
            </h1>
            
            <p className="mt-6 text-xl md:text-2xl text-black max-w-3xl mx-auto font-bold leading-relaxed">
              Boring gifts are a thing of the past. Give them a laugh, a memory, and a piece of home.
            </p>
          
            <motion.div
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white border-4 border-brand-dark-surface mt-10 px-12 py-8 text-2xl font-black uppercase tracking-wider font-display shadow-2xl transform hover:-rotate-1 transition-all">
                <Link to={createPageUrl("Products")}>
                  SHOP NOW
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-brand-accent"></div>
      </section>

      {/* Featured Strip */}
      <section className="py-6 bg-black border-b-2 border-brand-primary relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-full bg-brand-accent/5"></div>
        <div className="absolute top-0 right-0 w-24 h-full bg-brand-accent/5"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 text-white font-black text-sm uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-accent transform rotate-45"></span>
              <span>FREE SHIPPING ON ORDERS $50+</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/30"></div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-brand-accent transform rotate-45"></span>
              <span>FRESH DROPS WEEKLY</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Slideshows */}
      <ProductSlideshow title="T-SHIRTS" products={tshirts} category="t_shirts" />
      <ProductSlideshow title="MUGS" products={mugs} category="cups" />
      <ProductSlideshow title="POUCHES" products={pouches} category="makeup_pouches" />
      
      {/* CTA Banner */}
      <section className="py-20 relative overflow-hidden paper-dark border-t-4 border-brand-primary spray-paint-bg">
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent"></div>
        <div className="absolute top-0 right-0 w-2 h-full bg-brand-accent"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}>

            <motion.div 
              className="inline-block bg-black text-white px-8 py-3 mb-6 border-2 border-brand-primary font-black text-sm uppercase tracking-wider transform rotate-2 shadow-xl"
              whileHover={{ rotate: 0, scale: 1.05 }}
            >
              REP YOUR ROOTS
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-black text-brand-primary font-display uppercase tracking-tight leading-none mb-6 stencil-text">
              EVERY PIECE<br />TELLS A STORY
            </h2>
            <p className="text-xl text-brand-secondary mb-10 max-w-2xl mx-auto font-bold">
              Find your vibe. Spark a conversation. Celebrate your culture.
            </p>
            <motion.div
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-black hover:bg-black/90 text-white border-4 border-brand-primary px-12 py-8 text-xl font-black uppercase tracking-wider font-display shadow-xl hover:shadow-2xl transform transition-all">
                <Link to={createPageUrl("Products")}>
                  BROWSE ALL ITEMS
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>);

}
