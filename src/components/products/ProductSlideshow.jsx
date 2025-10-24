
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

const ProductSlideshow = ({ title, products, category }) => {
  const [dragConstraint, setDragConstraint] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const calculateDragConstraint = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = containerRef.current.scrollWidth;
        const newConstraint = contentWidth > containerWidth ? -(contentWidth - containerWidth) : 0;
        setDragConstraint(newConstraint);
      }
    };

    calculateDragConstraint();
    window.addEventListener('resize', calculateDragConstraint);
    const timer = setTimeout(calculateDragConstraint, 500);

    return () => {
      window.removeEventListener('resize', calculateDragConstraint);
      clearTimeout(timer);
    };
  }, [products]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-28 bg-brand-bg overflow-hidden relative border-t-2 border-brand-primary spray-paint-bg">
      <div className="absolute top-0 left-0 w-full h-2 bg-brand-accent"></div>
      <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent/30"></div>
      <div className="absolute top-0 right-0 w-2 h-full bg-brand-accent/30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex items-center justify-between">
          <div>
            <motion.div
              className="inline-block bg-black text-white px-6 py-2 border-2 border-brand-primary mb-4 font-black text-xs uppercase tracking-wider transform -rotate-2 shadow-lg"
              whileHover={{ rotate: 0, scale: 1.05 }}>

              NEW COLLECTION
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-black text-brand-primary font-display uppercase tracking-tight leading-none stencil-text">{title}</h2>
          </div>
          <Link to={`${createPageUrl("Products")}?category=${category}`}>
            <motion.div whileHover={{ scale: 1.05, rotate: 1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="bg-slate-950 text-slate-50 px-8 py-6 text-lg font-display uppercase tracking-wider rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 border-4 border-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-lg">
                VIEW ALL <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </div>
      </div>
      
      <div className="w-full relative">
        <div className="absolute top-0 bottom-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-bg to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 bottom-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-bg to-transparent z-10 pointer-events-none"></div>
        <motion.div
          ref={containerRef}
          className="flex gap-6 md:gap-8 cursor-grab px-4 sm:px-6 lg:px-8"
          drag="x"
          dragConstraints={{ right: 0, left: dragConstraint }}
          whileTap={{ cursor: "grabbing" }}>

          {products.map((product, index) =>
          <ProductCard key={`${product.id}-${index}`} product={product} isSlideshow={true} />
          )}
        </motion.div>
      </div>
    </section>);

};

export default ProductSlideshow;