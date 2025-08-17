"use client";

import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Column - Form Area */}
      <div className="flex-1 bg-gray-900 flex items-center justify-center p-8">
        {children}
      </div>
      
      {/* Right Column - Branding Area */}
      <div className="flex-1 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-16 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        {/* Logo and Branding */}
        <div className="text-center z-10">
          <div className="mb-8">
            <Image 
              src="/assets/Logo-entelequia-Vector.png" 
              alt="Entelequia" 
              width={192}
              height={192}
              className="w-48 h-auto mx-auto drop-shadow-2xl"
              priority
              onError={(e) => {
                console.error('Logo failed to load:', e);
                // Fallback to text if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-48 h-48 mx-auto mb-4 flex items-center justify-center bg-white/20 rounded-full';
                fallback.innerHTML = '<span class="text-6xl font-bold text-white">E</span>';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Entelequia Track
          </h1>
          
          <p className="text-xl text-green-100 max-w-md mx-auto leading-relaxed drop-shadow-md">
            Tu plataforma logística inteligente para el seguimiento y gestión de entregas en tiempo real
          </p>
          
          {/* Feature Highlights */}
          <div className="mt-12 grid grid-cols-1 gap-4 max-w-sm mx-auto">
            <div className="flex items-center text-green-100">
              <svg className="w-5 h-5 mr-3 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Seguimiento en tiempo real</span>
            </div>
            <div className="flex items-center text-green-100">
              <svg className="w-5 h-5 mr-3 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Gestión inteligente de rutas</span>
            </div>
            <div className="flex items-center text-green-100">
              <svg className="w-5 h-5 mr-3 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Analytics avanzados</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
