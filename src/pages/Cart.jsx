
import React, { useState, useEffect } from "react";
import { CartItem } from "@/api/entities";
import { Product } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, X, ShoppingBag, ArrowLeft, CreditCard, BadgePercent } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false); // New state for guest functionality

  const loadCart = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setIsGuest(false); // User is logged in
      const [items, productList] = await Promise.all([CartItem.filter({ user_email: user.email }), Product.list()]);
      setCartItems(items);
      setProducts(productList);
    } catch (error) {
      // User not logged in, treat as guest
      console.error("Error loading cart, likely guest user:", error);
      setIsGuest(true);
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const productList = await Product.list();
      setProducts(productList);
      // Map guest cart items to include an 'id' property for consistent rendering and updates
      // This 'id' is for client-side use, derived from product_id and size
      setCartItems(guestCart.map((item) => ({ ...item, id: `${item.product_id}-${item.size || ''}` })));
    }
    setIsLoading(false);
  };

  useEffect(() => {loadCart();}, []);

  const getProductById = (id) => products.find((p) => p.id === id);

  const updateQuantity = async (id, qty) => {
    if (isGuest) {
      let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      // Find item using the client-side generated 'id'
      const itemIndex = guestCart.findIndex((item) => `${item.product_id}-${item.size || ''}` === id);
      if (itemIndex > -1) {
        if (qty <= 0) {
          guestCart.splice(itemIndex, 1);
        } else {
          guestCart[itemIndex].quantity = qty;
        }
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }
    } else {
      if (qty <= 0) {await CartItem.delete(id);} else
      {await CartItem.update(id, { quantity: qty });}
    }
    loadCart();
    window.dispatchEvent(new Event('cartUpdated')); // Notify other components (e.g., header cart icon)
  };

  const removeItem = async (id) => {
    if (isGuest) {
      let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      // Filter item using the client-side generated 'id'
      guestCart = guestCart.filter((item) => `${item.product_id}-${item.size || ''}` !== id);
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    } else {
      await CartItem.delete(id);
    }
    loadCart();
    window.dispatchEvent(new Event('cartUpdated')); // Notify other components
  };

  const subtotal = cartItems.reduce((total, item) => total + (getProductById(item.product_id)?.price || 0) * item.quantity, 0);

  // Bundle Deal Logic
  const bundleItemCount = cartItems.reduce((count, item) => {
    const product = getProductById(item.product_id);
    if (product && (product.category === 'cups' || product.category === 'makeup_pouches')) {
      return count + item.quantity;
    }
    return count;
  }, 0);
  const numberOfBundles = Math.floor(bundleItemCount / 4);
  const bundleDiscount = numberOfBundles * 10; // $32 (4 * $8) - $22 = $10 discount per bundle

  // Apply only the bundle discount
  const finalDiscount = bundleDiscount;

  let discountLabel = "";
  if (bundleDiscount > 0) {
    discountLabel = `Bundle Deal (${numberOfBundles}x)`;
  }

  const shippingCost = subtotal >= 50 ? 0 : 5;
  const total = subtotal - finalDiscount + shippingCost;

  // Removed 20% discount threshold messaging

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-black text-brand-text font-display uppercase tracking-tighter">Your Goodie Bag</h1>
            <Link to={createPageUrl("Products")}>
              <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary/10 rounded-full font-bold">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Keep Shopping
              </Button>
            </Link>
          </div>

          {cartItems.length === 0 ?
          <div className="text-center py-24 bg-brand-surface rounded-2xl shadow-lg border border-gray-200">
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-brand-text mb-2">Your bag is empty!</h2>
              <p className="text-gray-500 mb-8 text-lg">Let's find a gift that will make someone's day.</p>
              <Link to={createPageUrl("Products")}>
                <Button className="bg-black hover:bg-black/90 rounded-full px-8 py-6 text-lg font-bold border-2 border-brand-primary">
                  Find Gifts
                </Button>
              </Link>
            </div> :

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-4">
              {/* Removed 20% discount upsell banner */}
                 {finalDiscount > 0 &&
              <div className="bg-brand-primary/10 border-l-4 border-brand-primary text-brand-text p-4 rounded-lg mb-4 flex items-center gap-4">
                    <BadgePercent className="w-6 h-6 text-brand-primary" />
                    <p className="font-semibold">Success! Your discount has been applied.</p>
                  </div>
              }
                {cartItems.map((item) => {
                const product = getProductById(item.product_id);
                if (!product) return null;
                return (
                  <Card key={item.id} className="bg-brand-surface border-gray-200 rounded-2xl shadow-md overflow-hidden">
                      <CardContent className="p-4 flex items-center space-x-6">
                        <img
                        src={`${product.image_url}?transform=w_200,h_200,c_cover,q_75`}
                        alt={product.name}
                        className="w-28 h-28 object-cover rounded-lg"
                        loading="lazy"
                        width="200"
                        height="200" />

                        <div className="flex-1">
                          <h3 className="font-bold text-brand-text text-lg">{product.name}</h3>
                          {item.size && <p className="text-gray-600 text-sm">Size: {item.size}</p>}
                          <p className="text-lg text-gray-800 mt-1">Quantity: <span className="font-bold">{item.quantity}</span></p>
                        </div>
                        <div className="flex flex-col items-center space-y-2">
                           <p className="text-2xl font-black text-brand-primary">${(product.price * item.quantity).toFixed(2)}</p>
                          <Button variant="ghost" size="icon" className="text-brand-secondary hover:bg-red-50 rounded-full h-10 w-10" onClick={() => removeItem(item.id)}> <X className="w-5 h-5" /> </Button>
                        </div>
                      </CardContent>
                    </Card>);

              })}
              </div>

              <div className="lg:col-span-1">
                <Card className="bg-brand-surface border-gray-200 rounded-2xl shadow-lg sticky top-24">
                  <CardHeader><CardTitle className="text-brand-text font-display text-2xl">Order Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span>Subtotal:</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>

                    {finalDiscount > 0 &&
                  <div className="flex justify-between text-lg text-brand-primary">
                        <span>{discountLabel}:</span>
                        <span className="font-semibold">-${finalDiscount.toFixed(2)}</span>
                      </div>
                  }

                    <div className="flex justify-between text-lg">
                      <span>Shipping:</span>
                      <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                    </div>

                    <Separator />
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <Link to={createPageUrl("Checkout")}>
                      <Button
                      size="lg" className="w-full bg-black hover:bg-black/90 rounded-full h-14 text-lg font-bold mt-4 border-2 border-brand-primary">

                        <CreditCard className="w-5 h-5 mr-3" />
                        Proceed to Checkout
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          }
        </motion.div>
      </div>
    </div>);

}
