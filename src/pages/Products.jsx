
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Frown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import ProductCard from "@/components/products/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const location = useLocation();

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    const productList = await Product.list();
    setProducts(productList);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("all");
    }
  }, [location.search]);

  const filterProducts = useCallback(() => {
    let filtered = [...products];
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    filtered.sort((a, b) => {
      if (sortBy === "price_low") return a.price - b.price;
      if (sortBy === "price_high") return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy, selectedCategory]);

  useEffect(() => {
    filterProducts();
  }, [filterProducts]);
  
  const categories = [
    { value: "all", label: "ALL ITEMS" },
    { value: "t_shirts", label: "T-SHIRTS" },
    { value: "cups", label: "MUGS" },
    { value: "makeup_pouches", label: "POUCHES" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-brand-accent"></div>
          
          <motion.div 
            className="inline-block bg-black text-white px-8 py-3 border-2 border-brand-primary mb-4 font-black text-sm uppercase tracking-wider transform -rotate-2 shadow-xl"
            whileHover={{ rotate: 0, scale: 1.05 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            THE COLLECTION
          </motion.div>
          <h1 className="text-7xl md:text-8xl font-black text-brand-primary font-display uppercase tracking-tight leading-none stencil-text">SHOP ALL</h1>
          <p className="mt-4 text-xl text-brand-secondary font-bold uppercase tracking-wide">Find your perfect vibe</p>
          
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-brand-accent"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 paper-texture p-8 border-4 border-brand-primary shadow-2xl relative spray-paint-bg corner-tape"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-accent opacity-50"></div>
          <div className="absolute top-0 right-0 w-2 h-full bg-brand-accent opacity-50"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 transform -rotate-3 border-2 border-brand-primary">
              <SlidersHorizontal className="w-6 h-6 text-black"/>
            </div>
            <h2 className="text-3xl font-black text-brand-primary font-display uppercase tracking-wider stencil-text">FILTER & SORT</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="SEARCH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-4 border-brand-primary bg-white shadow-md font-bold uppercase tracking-wide"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-14 text-lg border-4 border-brand-primary bg-white font-black uppercase tracking-wide shadow-md">
                <SelectValue placeholder="CATEGORY" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => <SelectItem key={cat.value} value={cat.value} className="text-lg font-bold uppercase">{cat.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-14 text-lg border-4 border-brand-primary bg-white font-black uppercase tracking-wide shadow-md">
                <SelectValue placeholder="SORT BY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name" className="text-lg font-bold uppercase">NAME</SelectItem>
                <SelectItem value="price_low" className="text-lg font-bold uppercase">PRICE: LOW TO HIGH</SelectItem>
                <SelectItem value="price_high" className="text-lg font-bold uppercase">PRICE: HIGH TO LOW</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
        

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-24 paper-texture border-4 border-brand-primary shadow-2xl mt-10 corner-tape">
             <Frown className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-4xl font-black text-brand-primary font-display uppercase tracking-tight stencil-text">NO ITEMS FOUND</h3>
            <p className="text-brand-secondary mt-4 mb-8 max-w-sm mx-auto text-lg font-bold">TRY ADJUSTING YOUR FILTERS</p>
            <motion.div
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                  onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSortBy("name");
                  }}
                  className="bg-brand-accent hover:bg-brand-accent/90 border-4 border-brand-primary px-10 py-6 text-xl font-black uppercase tracking-wider font-display shadow-xl transform transition-all"
              >
                  CLEAR FILTERS
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
