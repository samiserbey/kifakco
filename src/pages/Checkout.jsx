
import React, { useState, useEffect } from "react";
import { Product } from "@/api/entities";
import { Order } from "@/api/entities";
import { CartItem } from "@/api/entities";
import { User } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
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
        const emailBody = `
          <div style="font-family: sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 8px;">
            <h1 style="color: #7c3aed; text-align: center; margin-bottom: 25px;">New Order from Kifak Co!</h1>
            <p style="font-size: 16px; line-height: 1.5;">You've received a new order. Here are the details:</p>
            
            <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0; margin-top: 20px;">
              <h2 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; color: #333;">Order #${order.id.substring(0, 8)}</h2>
              
              <h3 style="color: #4a4a4a; margin-top: 20px;">Customer Details</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${order.customer_name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${order.user_email}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.phone_number}</p>
              
              <h3 style="color: #4a4a4a; margin-top: 20px;">Shipping Address</h3>
              <p style="margin: 5px 0;">${order.shipping_address.street}, ${order.shipping_address.building}, Floor ${order.shipping_address.floor || 'N/A'}</p>
              <p style="margin: 5px 0;">${order.shipping_address.city}, ${order.shipping_address.country}</p>
              ${order.shipping_address.zip_code ? `<p style="margin: 5px 0;">Zip Code: ${order.shipping_address.zip_code}</p>` : ''}

              <h3 style="color: #4a4a4a; margin-top: 20px;">Order Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                <thead>
                  <tr style="background-color: #f0f0f0;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">Product</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #e0e0e0;">Size</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #e0e0e0;">Qty</th>
                    <th style="padding: 12px; text-align: right; border: 1px solid #e0e0e0;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${order.items.map(item => `
                    <tr style="border-bottom: 1px solid #eee;">
                      <td style="padding: 10px; border: 1px solid #e0e0e0;">${item.product_name}</td>
                      <td style="padding: 10px; border: 1px solid #e0e0e0;">${item.size || 'N/A'}</td>
                      <td style="padding: 10px; text-align: center; border: 1px solid #e0e0e0;">${item.quantity}</td>
                      <td style="padding: 10px; text-align: right; border: 1px solid #e0e0e0;">$${(item.price_at_purchase * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div style="text-align: right; margin-top: 20px; font-size: 16px;">
                <p style="margin: 5px 0;">Subtotal: <strong>$${subtotal.toFixed(2)}</strong></p>
                ${finalDiscount > 0 ? `<p style="margin: 5px 0; color: #db2777;">Discount: <strong>-$${finalDiscount.toFixed(2)}</strong></p>` : ''}
                <p style="margin: 5px 0;">Shipping: <strong>$${shippingCost.toFixed(2)}</strong></p>
                <h2 style="margin: 15px 0 0; color: #7c3aed;">Total: <strong>$${total.toFixed(2)}</strong></h2>
              </div>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">Thank you for your business!</p>
          </div>
        `;
        await SendEmail({ to: "rabihhibri00@gmail.com", subject: `New Kifak Co. Order #${order.id.substring(0,8)} from ${fullName}`, body: emailBody });
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
