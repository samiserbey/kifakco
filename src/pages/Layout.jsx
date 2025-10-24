

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [cartCount, setCartCount] = React.useState(0);

  const navigationItems = [
  { name: "Home", url: createPageUrl("Home") },
  { name: "Shop", url: createPageUrl("Products") }];


  const isActive = (url) => location.pathname === url;

  const loadCartCount = React.useCallback(async () => {
    try {
      const { User } = await import("@/api/entities");
      const { CartItem } = await import("@/api/entities");
      const user = await User.me();
      const cartItems = await CartItem.filter({ user_email: user.email });
      const count = cartItems.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const count = guestCart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    }
  }, []);

  React.useEffect(() => {
    loadCartCount();
    window.addEventListener('cartUpdated', loadCartCount);
    return () => {
      window.removeEventListener('cartUpdated', loadCartCount);
    };
  }, [loadCartCount]);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          :root {
            --brand-bg: #e8e3d8;
            --brand-text: #000000;
            --brand-primary: #000000;
            --brand-secondary: #4a4a4a;
            --brand-accent: #d4502f;
            --brand-surface: #f5f1e8;
            --brand-dark-surface: #1a1a1a;
            --radius: 0;
          }
          
          .font-display { 
            font-family: 'Bebas Neue', sans-serif; 
            letter-spacing: 0.05em;
          }
          .font-sans { font-family: 'Inter', sans-serif; }
          
          /* Paper texture */
          body {
            background-color: #e8e3d8;
            background-image: 
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
          }
          
          .paper-texture {
            background-color: #f5f1e8;
            background-image: 
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
          }
          
          .paper-dark {
            background-color: #d8d3c8;
            background-image: 
              url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E");
          }
          
          /* Urban distressed effect */
          .distressed-border {
            position: relative;
            border: 4px solid #000000;
          }
          
          .distressed-border::before {
            content: '';
            position: absolute;
            top: -4px;
            left: -4px;
            right: -4px;
            bottom: -4px;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 8px,
              #000000 8px,
              #000000 12px
            );
            z-index: -1;
          }
          
          /* Spray paint effect */
          .spray-paint-bg {
            position: relative;
            overflow: hidden;
          }
          
          .spray-paint-bg::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 60%;
            height: 150%;
            background: radial-gradient(ellipse at center, rgba(212, 80, 47, 0.15) 0%, transparent 60%);
            transform: rotate(-15deg);
            pointer-events: none;
          }
          
          /* Corner tape effect */
          .corner-tape {
            position: relative;
          }
          
          .corner-tape::before,
          .corner-tape::after {
            content: '';
            position: absolute;
            width: 80px;
            height: 25px;
            background: rgba(255, 255, 255, 0.4);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 10;
          }
          
          .corner-tape::before {
            top: 20px;
            left: -10px;
            transform: rotate(-45deg);
          }
          
          .corner-tape::after {
            top: 20px;
            right: -10px;
            transform: rotate(45deg);
          }
          
          /* Stencil text effect */
          .stencil-text {
            text-shadow: 
              3px 3px 0px rgba(0,0,0,0.1),
              -1px -1px 0px rgba(255,255,255,0.3);
            letter-spacing: 0.1em;
          }
          
          /* Ripped edge effect */
          .ripped-edge {
            position: relative;
          }
          
          .ripped-edge::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(
              to right,
              transparent 0%,
              transparent 25%,
              #e8e3d8 25%,
              #e8e3d8 50%,
              transparent 50%,
              transparent 75%,
              #e8e3d8 75%,
              #e8e3d8 100%
            );
          }
        `}
      </style>

      {/* Header */}
      <header className="sticky top-0 left-0 right-0 w-full z-[9999] paper-texture border-b-4 border-black shadow-lg">
        <div className="absolute top-0 left-0 w-32 h-1 bg-brand-accent"></div>
        <div className="absolute top-0 right-0 w-32 h-1 bg-brand-accent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={createPageUrl("Home")} onClick={(e) => { if (isActive(createPageUrl("Home"))) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
              <motion.img
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/686ced9f85654a8ac847289f/97514f1b1_kifakco-01.png?transform=h_64,q_90"
                alt="Kifak Co."
                className="h-12 sm:h-14" />

            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) =>
              <Link key={item.name} to={item.url} onClick={(e) => { if (isActive(item.url)) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }} className={`relative px-6 py-2 font-bold text-lg transition-all duration-200 uppercase font-display tracking-wider ${isActive(item.url) ? 'text-brand-accent' : 'text-black hover:text-brand-accent'}`}>
                  {item.name}
                  {isActive(item.url) &&
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-brand-accent"
                  layoutId="underline"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }} />

                }
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <Link to={createPageUrl("Cart")} onClick={(e) => { if (isActive(createPageUrl("Cart"))) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="relative bg-black hover:bg-gray-800 w-12 h-12 transform hover:rotate-6 transition-all">
                    <ShoppingCart className="w-5 h-5 text-white" />
                    <AnimatePresence>
                      {cartCount > 0 &&
                      <motion.div
                        initial={{ scale: 0, y: -10, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 30 } }}
                        exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                        className="absolute -top-1 -right-1 bg-brand-accent text-white text-xs font-bold w-6 h-6 flex items-center justify-center border-2 border-brand-surface transform -rotate-12">
                          {cartCount}
                        </motion.div>
                      }
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </Link>
              
              <div className="md:hidden">
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="bg-black text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground w-12 h-12 hover:bg-gray-800">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={isMenuOpen ? "x" : "menu"}
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}>

                      {isMenuOpen ?
                      <X className="w-5 h-5 text-white" /> :

                      <Menu className="w-5 h-5 text-white" />
                      }
                    </motion.div>
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t-2 border-black paper-dark overflow-hidden">

              <nav className="px-4 py-4 space-y-2">
                {navigationItems.map((item) =>
              <Link key={item.name} to={item.url} onClick={(e) => { if (isActive(item.url)) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } setIsMenuOpen(false); }}>
                     <div className={`block py-3 px-4 font-bold text-lg transition-colors duration-200 uppercase font-display tracking-wider ${isActive(item.url) ? 'text-brand-accent bg-white/30' : 'text-black hover:bg-white/20'}`}>
                       {item.name}
                     </div>
                  </Link>
              )}
              </nav>
            </motion.div>
          }
        </AnimatePresence>
      </header>

      <main className="flex-1 pt-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}>

            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-brand-surface text-black border-t-4 border-brand-accent relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-brand-accent"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center">
            <motion.img
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ type: "spring", stiffness: 300 }}
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/686ced9f85654a8ac847289f/97514f1b1_kifakco-01.png?transform=h_64,q_90"
              alt="Kifak Co."
              className="h-14 mx-auto mb-4" />

             <p className="mt-4 text-gray-700 max-w-md mx-auto font-medium">
              Gifts with a Lebanese accent. Perfect for your habibis, your family, and yourself.
            </p>
            <div className="mt-6">
              <Link to={createPageUrl("Products")}>
                <Button className="bg-black hover:bg-black/90 text-white px-8 py-6 font-bold uppercase tracking-wider font-display text-lg transform hover:scale-105 hover:-rotate-1 transition-all border-2 border-brand-primary">
                  Browse Gifts
                </Button>
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-300 mt-8 pt-8 text-center text-gray-600">
            <p className="font-medium">&copy; {new Date().getFullYear()} Kifak Co. Made with حب in Lebanon.</p>
          </div>
        </div>
      </footer>
    </div>);

}

