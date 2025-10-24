import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center">
      <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/686ced9f85654a8ac847289f/97514f1b1_kifakco-01.png" 
          alt="Kifak Co. Logo" 
          className="h-28 md:h-32 mx-auto mb-6 animate-pulse"
      />
      <p className="text-xl text-brand-text/70 font-semibold">Please wait...</p>
    </div>
  );
}