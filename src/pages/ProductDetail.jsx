
import React, { useState, useEffect } from "react";
import { Product } from "@/api/entities";
import { CartItem } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import imageMap from "@/data/imageMap.json";

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadProduct(); }, []);

  const loadProduct = async () => {
    setIsLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
      const productList = await Product.list();
      const foundProduct = productList.find(p => p.id === productId);
      setProduct(foundProduct);
      if (foundProduct?.sizes?.length > 0) {
        setSelectedSize(foundProduct.sizes[1] || foundProduct.sizes[0]);
      }
    }
    setIsLoading(false);
  };

  const handleAddToCart = async () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast({ title: "Hold Up!", description: "Please pick a size first.", variant: "destructive" });
      return;
    }
    
    try {
      const user = await User.me();
      const filter = { user_email: user.email, product_id: product.id, ...(selectedSize && { size: selectedSize }) };
      const existing = await CartItem.filter(filter);
      if (existing.length > 0) {
        await CartItem.update(existing[0].id, { quantity: existing[0].quantity + 1 });
      } else {
        await CartItem.create({ product_id: product.id, quantity: 1, user_email: user.email, ...(selectedSize && { size: selectedSize }) });
      }
    } catch (e) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItemIndex = guestCart.findIndex(item => item.product_id === product.id && (item.size === selectedSize || (!item.size && !selectedSize)));
      if (existingItemIndex > -1) {
          guestCart[existingItemIndex].quantity += 1;
      } else {
          guestCart.push({ product_id: product.id, quantity: 1, size: selectedSize, name: product.name, price: product.price, image_url: imageMap[product.id]?.main || product.image_url });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    }
    window.location.href = createPageUrl("Cart");
  };

  const mapped = product ? imageMap[product.id] : undefined;
  const productImages = mapped?.gallery && mapped.gallery.length > 0
    ? mapped.gallery
    : (product?.image_gallery?.length > 0 ? product.image_gallery : (product?.image_url ? [product.image_url] : []));

  const withTransform = (url, transformParams) =>
    url && url.startsWith('/products/') ? url : `${url}?transform=${transformParams}`;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold mb-4">Oops! Gift Not Found</h1>
        <Link to={createPageUrl("Products")}>
          <Button className="bg-brand-primary hover:bg-brand-primary/90">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 relative overflow-hidden">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-8">
          <Link to={createPageUrl("Products")} className="text-brand-secondary hover:text-brand-accent font-bold flex items-center group uppercase tracking-wide">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> BACK TO SHOP
          </Link>
        </div>
        
        <motion.div 
            className="paper-texture border-4 border-brand-primary shadow-2xl p-6 lg:p-12 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
              <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <div className="overflow-hidden shadow-2xl bg-white p-8 border-4 border-brand-primary">
                  <img 
                    src={withTransform(productImages[selectedImage], 'w_800,q_90')} 
                    alt={product.name} 
                    className="w-full h-96 lg:h-[600px] object-contain" 
                    loading="eager"
                    width="800"
                    height="800"
                  />
                </div>
                {productImages.length > 1 && (
                  <div className="flex space-x-4 mt-6">
                    {productImages.map((img, i) => (
                      <button key={i} onClick={() => setSelectedImage(i)} className={`w-24 h-24 overflow-hidden border-4 transition-all transform hover:scale-105 ${selectedImage === i ? 'border-brand-accent shadow-lg' : 'border-brand-primary hover:border-brand-secondary'}`}>
                        <img 
                          src={withTransform(img, 'w_150,h_150,q_80')} 
                          alt={`${product.name} ${i + 1}`} 
                          className="w-full h-full object-contain bg-white p-2" 
                          loading="lazy"
                          width="150"
                          height="150"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-6 flex flex-col">
                <div className="relative">
                  <div className="flex gap-3 mb-4">
                    <div className="inline-block bg-black text-white px-4 py-1 border-2 border-brand-primary font-black text-sm uppercase tracking-wider">
                      FRESH DROP
                    </div>
                    {product.category === 't_shirts' && (
                      <div className="inline-block bg-black text-white px-4 py-1 border-2 border-brand-accent font-black text-sm uppercase tracking-wider">
                        UNISEX FIT
                      </div>
                    )}
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black text-brand-primary font-display leading-none uppercase tracking-tight">{product.name}</h1>
                </div>
                
                <div className="flex items-baseline gap-3 border-b-4 border-brand-primary pb-4">
                  <p className="text-6xl font-black text-brand-primary font-display">${product.price}</p>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed flex-grow border-l-4 border-brand-accent pl-4 py-2 font-medium">{product.description}</p>
                
                {product.sizes?.length > 0 && (
                  <div className="space-y-4 paper-dark p-6 border-2 border-brand-primary">
                    <Label className="text-2xl font-black text-brand-primary uppercase tracking-wide font-display">
                      SELECT SIZE:
                    </Label>
                    <div className="flex items-center gap-3 flex-wrap">
                      {product.sizes.map(size => (
                        <Button 
                          key={size} 
                          variant={selectedSize === size ? "default" : "outline"} 
                          onClick={() => setSelectedSize(size)} 
                          className={`px-8 py-6 text-xl font-black transition-all transform hover:scale-105 uppercase tracking-wider font-display ${selectedSize === size ? 'bg-black text-white border-2 border-black' : 'bg-white border-2 border-brand-primary hover:border-brand-accent'}`}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-auto pt-6">
                  <Button size="lg" className="flex-1 bg-black hover:bg-black/90 border-2 border-brand-primary h-16 text-xl font-black uppercase tracking-wider font-display shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all" onClick={handleAddToCart}>
                    <ShoppingCart className="w-6 h-6 mr-3" />
                    ADD TO CART
                  </Button>
                </div>
              </motion.div>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
