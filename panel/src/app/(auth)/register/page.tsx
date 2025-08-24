"use client";
import { useState } from "react";
import { register } from "@/services/auth";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Todos los campos son requeridos");
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined
      });
      
      // Use the new auth store instead of localStorage
      setAuth(response.user);
      
      setSuccess(true);
      
      // Redirect after a brief success message
      setTimeout(() => {
        // Small delay to ensure cookie is sent to Next.js server before redirect
        setTimeout(() => {
          window.location.replace("/dashboard");
        }, 100);
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("email_already_taken")) {
        setError("Este email ya está registrado");
      } else if (errorMessage.includes("validation_failed")) {
        setError("Datos de entrada inválidos");
      } else {
        setError("Error al crear la cuenta. Intenta nuevamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-gray-700">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta creada exitosamente!</h2>
        <p className="text-gray-300 mb-6">Redirigiendo al dashboard...</p>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Entelequia Track</h1>
        <p className="text-gray-300 text-lg">Únete a la revolución logística</p>
      </div>

      {/* Form */}
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
              Nombre completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-white"
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-white"
              placeholder="tu@email.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-white"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-white"
              placeholder="Repite tu contraseña"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-xl p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-500/25"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando cuenta...
              </div>
            ) : (
              "Crear cuenta"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link 
              href="/login" 
              className="text-green-400 hover:text-green-300 font-medium transition-colors duration-200"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          Al crear una cuenta, aceptas nuestros{" "}
          <a href="#" className="text-green-400 hover:text-green-300 underline">términos de servicio</a>
        </p>
      </div>
    </div>
  );
}
