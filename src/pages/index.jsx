import React from 'react';
import Layout from "./Layout.jsx";

import Home from "./Home";

import Products from "./Products";

import ProductDetail from "./ProductDetail";

import Cart from "./Cart";

import Checkout from "./Checkout";

import OrderConfirmation from "./OrderConfirmation";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    Products: Products,
    
    ProductDetail: ProductDetail,
    
    Cart: Cart,
    
    Checkout: Checkout,
    
    OrderConfirmation: OrderConfirmation,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    React.useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname, location.search]);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/ProductDetail" element={<ProductDetail />} />
                
                <Route path="/Cart" element={<Cart />} />
                
                <Route path="/Checkout" element={<Checkout />} />
                
                <Route path="/OrderConfirmation" element={<OrderConfirmation />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}