import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { Order } from '@/api/entities';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function OrderConfirmation() {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchOrder = async () => {
      const params = new URLSearchParams(location.search);
      const orderId = params.get('id');
      if (orderId) {
        try {
          const fetchedOrder = await Order.get(orderId);
          setOrder(fetchedOrder);
        } catch (error) {
          console.error("Failed to fetch order:", error);
        }
      }
      setIsLoading(false);
    };
    fetchOrder();
  }, [location]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the order details. Please check your email for confirmation.</p>
        <Link to={createPageUrl("Home")}>
          <Button className="bg-brand-primary hover:bg-brand-primary/90 rounded-full font-bold px-8">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-brand-surface rounded-2xl shadow-2xl p-8 md:p-12 text-center border border-gray-200/80"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
          >
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black text-brand-text font-display uppercase tracking-tighter">Thank You!</h1>
          <p className="mt-4 text-lg text-gray-600">Your order has been placed successfully.</p>
          
          <div className="mt-8 text-left bg-gray-50 p-6 rounded-xl border">
            <p className="text-lg font-bold text-brand-text">Order #{order.id.substring(0, 8)}</p>
            <p className="text-gray-600">An email confirmation has been sent to <span className="font-semibold text-brand-primary">{order.user_email}</span>.</p>
            <p className="text-gray-600 mt-2">Your order will be delivered within 2 business days. Payment is cash on delivery.</p>
          </div>
          
          <div className="mt-10">
            <Link to={createPageUrl("Products")}>
              <Button size="lg" className="bg-black hover:bg-black/90 text-white rounded-full px-10 py-7 text-xl font-bold shadow-lg transition-all hover:shadow-xl">
                <ShoppingBag className="mr-3 w-6 h-6" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}