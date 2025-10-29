
import React, { useState, useEffect } from "react";
import { Product } from "@/api/entities";
import { Order } from "@/api/entities";
import { CartItem } from "@/api/entities";
import { User } from "@/api/entities";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Truck, Clock, DollarSign, ShoppingCart } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Prefer env vars; set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment
const supabase = createClient(
  'https://kbgdwdaymwykzkzorjbb.supabase.co/functions/v1/kifakco-order-confirmation',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ2R3ZGF5bXd5a3prem9yamJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1ODc2NTIsImV4cCI6MjA3NzE2MzY1Mn0.pKWuAvH_94LTg1ca3jPe22pZ5V02K3Xro4QKjTwIlEk'
);

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [shippingAddress, setShippingAddress] = useState({ city: "", street: "", building: "", floor: "", zip_code: "", country: "Lebanon" });
  const { toast } = useToast();

  useEffect(() => {
    const loadCartAndUser = async () => {
        setIsLoading(true);
        const productList = await Product.list();
        setProducts(productList);
        
        try {
            const user = await User.me();
            const items = await CartItem.filter({ user_email: user.email });
            if (items.length === 0) { window.location.href = createPageUrl("Products"); return; }
            setCartItems(items);
            setFullName(user.full_name || "");
            setEmail(user.email);
            setIsGuest(false);
        } catch (error) {
            // Not logged in, load from guest cart
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            if (guestCart.length === 0) { window.location.href = createPageUrl("Products"); return; }
            setCartItems(guestCart.map(item => ({...item, id: `${item.product_id}-${item.size || ''}`})));
            setIsGuest(true);
        }
        setIsLoading(false);
    };

    loadCartAndUser();
  }, []);
  
  const getProductById = (id) => products.find(p => p.id === id);
  
  const subtotal = cartItems.reduce((total, item) => total + (getProductById(item.product_id)?.price || item.price || 0) * item.quantity, 0);
  
  const bundleItemCount = cartItems.reduce((count, item) => {
    const product = getProductById(item.product_id);
    if (product && (product.category === 'cups' || product.category === 'makeup_pouches')) { return count + item.quantity; }
    return count;
  }, 0);
  const numberOfBundles = Math.floor(bundleItemCount / 4);
  const bundleDiscount = numberOfBundles * 10;
  const finalDiscount = bundleDiscount;
  let discountLabel = "";
  if (bundleDiscount > 0) { discountLabel = `Bundle Deal (${numberOfBundles}x)`; }

  const shippingCost = subtotal >= 50 ? 0 : 5;
  const total = subtotal - finalDiscount + shippingCost;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fullName.trim() || !email.trim() || !phoneNumber.trim() || !shippingAddress.city.trim() || !shippingAddress.street.trim() || !shippingAddress.building.trim()) {
        toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
        return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = cartItems.map(item => {
        const product = getProductById(item.product_id);
        return { 
          product_id: item.product_id, 
          product_name: item.name || product?.name || "Unknown Product", 
          quantity: item.quantity, 
          price_at_purchase: item.price || product?.price || 0, 
          size: item.size || null 
        };
      });

      const orderData = {
        customer_name: fullName.trim(),
        user_email: email.trim(),
        phone_number: phoneNumber.trim(),
        items: orderItems,
        shipping_address: {
          city: shippingAddress.city.trim(),
          street: shippingAddress.street.trim(),
          building: shippingAddress.building.trim(),
          floor: shippingAddress.floor.trim() || "",
          zip_code: shippingAddress.zip_code.trim() || "",
          country: shippingAddress.country || "Lebanon"
        },
        shipping_cost: shippingCost,
        discount_amount: finalDiscount,
        total_amount: total,
        status: "pending"
      };

      const order = await Order.create(orderData);
      
      try {
        const { data, error } = await supabase.functions.invoke('kifakco-order-confirmation', {
          body: {
            id: order.id,
            customer_name: order.customer_name,
            user_email: order.user_email,
            phone_number: order.phone_number,
            shipping_address: order.shipping_address,
            items: order.items,
            subtotal,
            shipping_cost: shippingCost,
            discount_amount: finalDiscount,
            total_amount: total
          }
        });
        if (error) { console.error("Supabase function error:", error); }
      } catch (emailError) { console.error("Email notification failed, but order was created successfully:", emailError); }

      // Clear cart
      if (isGuest) {
        localStorage.removeItem('guestCart');
      } else {
        await Promise.all(cartItems.map(item => CartItem.delete(item.id)));
      }
      window.dispatchEvent(new Event('cartUpdated')); // Update header icon

      toast({ 
        title: "Order Placed Successfully!", 
        description: "Your order is confirmed! You'll pay cash on delivery.", 
        className: "bg-green-500 text-white" 
      });
      
      setTimeout(() => { 
        window.location.href = createPageUrl(`OrderConfirmation?id=${order.id}`); 
      }, 1500);
    } catch (error) {
      console.error("Order creation error:", error);
      toast({ title: "Order Failed", description: "There was an issue placing your order. Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-brand-bg">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold text-brand-text font-display text-center mb-8">Final Step! Where are we sending the goodies?</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <Card className="rounded-2xl shadow-lg bg-brand-surface border border-stone-200">
              <CardHeader><CardTitle className="text-brand-text flex items-center font-display text-2xl"><Truck className="w-6 h-6 mr-3 text-brand-primary"/>Your Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="name">Full Name *</Label><Input id="name" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="h-12"/></div>
                <div><Label htmlFor="email">Email Address *</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For order updates" className="h-12" readOnly={!isGuest} /></div>
                <div><Label htmlFor="phone">Phone Number *</Label><Input id="phone" type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="For delivery coordination" className="h-12"/></div>
                <div><Label htmlFor="city">City *</Label><Input id="city" required value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} placeholder="e.g. Beirut" className="h-12"/></div>
                <div><Label htmlFor="street">Street Name *</Label><Input id="street" required value={shippingAddress.street} onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})} placeholder="e.g. Hamra Street" className="h-12"/></div>
                <div><Label htmlFor="building">Building/House *</Label><Input id="building" required value={shippingAddress.building} onChange={(e) => setShippingAddress({...shippingAddress, building: e.target.value})} placeholder="Building name or number" className="h-12"/></div>
                <div><Label htmlFor="floor">Floor (Optional)</Label><Input id="floor" value={shippingAddress.floor} onChange={(e) => setShippingAddress({...shippingAddress, floor: e.target.value})} className="h-12"/></div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card className="rounded-2xl shadow-lg bg-brand-surface border border-stone-200">
                <CardHeader><CardTitle className="text-brand-text font-display text-2xl">Your Order</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {cartItems.map((item) => {
                    const product = getProductById(item.product_id);
                    const price = item.price || product?.price || 0;
                    const name = item.name || product?.name || "Unknown Product";
                    return <div key={item.id} className="flex justify-between items-center"><span className="font-semibold text-sm">{name} x{item.quantity}</span> <span className="font-bold">${(price * item.quantity).toFixed(2)}</span></div>;
                  })}
                  <Separator/>
                  <div className="flex justify-between"><span className="text-stone-600">Subtotal:</span> <span className="font-semibold">${subtotal.toFixed(2)}</span></div>
                  {finalDiscount > 0 && <div className="flex justify-between text-brand-primary"><span className="text-brand-primary">{discountLabel}:</span> <span className="font-semibold">-${finalDiscount.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="text-stone-600">Shipping:</span> <span className="font-semibold">${shippingCost.toFixed(2)}</span></div>
                  <Separator/>
                  <div className="flex justify-between text-2xl font-bold"><span className="font-display">Total:</span> <span>${total.toFixed(2)}</span></div>
                  <div className="bg-gray-100 p-3 rounded-lg mt-4 space-y-2">
                     <p className="text-sm text-brand-text font-semibold flex items-center"><DollarSign className="w-4 h-4 mr-2 text-brand-primary"/>💰 Payment is Cash on Delivery</p>
                     <p className="text-sm text-brand-text font-semibold flex items-center"><Clock className="w-4 h-4 mr-2 text-brand-primary"/>🚀 Delivery within 2 business days</p>
                  </div>
                </CardContent>
              </Card>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full bg-green-500 hover:bg-green-600 text-white h-16 rounded-full text-lg font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all"
              >
                {isSubmitting ? "Placing Order..." : <><ShoppingCart className="w-6 h-6 mr-3" /> Confirm & Place Order</>}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
