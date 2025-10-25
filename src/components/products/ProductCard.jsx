import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CartItem, User } from '@/api/entities';

const ProductCard = ({ product, isSlideshow = false }) => {
  if (!product) return null;

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const [added, setAdded] = React.useState(false);

  return (
    <motion.div
      variants={cardVariants}
      className={`group relative flex flex-col ${isSlideshow ? 'w-72 md:w-80 flex-shrink-0' : 'w-full'}`}
      whileHover={{ y: -8, rotate: -1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
    >
      <Link to={createPageUrl("ProductDetail") + `?id=${product.id}`} className="block h-full">
        <div className="paper-texture border-4 border-brand-primary shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col overflow-hidden relative group-hover:border-brand-accent corner-tape">
          <motion.div 
            className="absolute top-3 right-3 z-10 bg-black text-white px-4 py-2 border-2 border-brand-primary text-xs font-black uppercase tracking-wider transform -rotate-6"
            whileHover={{ rotate: 0, scale: 1.1 }}
          >
            NEW
          </motion.div>
          
          {product.category === 't_shirts' && (
            <div className="absolute top-3 left-3 z-10 bg-black text-white px-3 py-1 border-2 border-brand-accent text-xs font-black uppercase tracking-wider">
              UNISEX
            </div>
          )}
          {added && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="hidden">
              Item Added
            </motion.div>
          )}
          
          <div className="relative overflow-hidden bg-white p-6 border-b-4 border-brand-primary">
            <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-gray-200 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-gray-200 opacity-50"></div>
            
            <img 
              src={`${product.image_url}?transform=w_400,h_400,q_85`} 
              alt={product.name} 
              className="w-full h-72 object-contain transition-transform duration-500 group-hover:scale-110" 
              loading="lazy"
              width="400"
              height="400"
            />
          </div>
          <div className="p-6 flex-grow flex flex-col paper-texture relative">
            <div className="absolute top-2 left-2 w-8 h-1 bg-brand-accent transform -rotate-45"></div>
            <div className="absolute top-2 right-2 w-8 h-1 bg-brand-accent transform rotate-45"></div>
            
            <h4 className="font-black text-xl text-brand-primary flex-grow leading-tight uppercase font-display tracking-wide stencil-text">
              {product.name}
            </h4>
            <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-brand-primary">
              <p className="text-3xl font-black text-brand-primary font-display stencil-text">${product.price}</p>
              <Button 
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const chosenSize = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : undefined;
                  try {
                    const user = await User.me();
                    const filter = { user_email: user.email, product_id: product.id, ...(chosenSize && { size: chosenSize }) };
                    const existing = await CartItem.filter(filter);
                    if (existing.length > 0) {
                      await CartItem.update(existing[0].id, { quantity: existing[0].quantity + 1 });
                    } else {
                      await CartItem.create({ product_id: product.id, quantity: 1, user_email: user.email, ...(chosenSize && { size: chosenSize }) });
                    }
                  } catch (error) {
                    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
                    const existingIndex = guestCart.findIndex(item => item.product_id === product.id && (item.size === chosenSize || (!item.size && !chosenSize)));
                    if (existingIndex > -1) {
                      guestCart[existingIndex].quantity += 1;
                    } else {
                      guestCart.push({ product_id: product.id, quantity: 1, size: chosenSize, name: product.name, price: product.price, image_url: product.image_url });
                    }
                    localStorage.setItem('guestCart', JSON.stringify(guestCart));
                  }
                  window.dispatchEvent(new Event('cartUpdated'));
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="bg-black hover:bg-black/90 text-white border-2 border-brand-primary px-4 py-2 text-xs font-black uppercase tracking-wider transform -rotate-3 relative overflow-hidden"
              >
                <div className="inline-block" style={{ perspective: 800 }}>
                  <motion.div
                    initial={false}
                    animate={{ rotateY: added ? 180 : 0 }}
                    transition={{ duration: 0.4 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="relative"
                  >
                    <span
                      className="block"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      Add to Cart
                    </span>
                    <span
                      className="block absolute inset-0"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      Item Added
                    </span>
                  </motion.div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;