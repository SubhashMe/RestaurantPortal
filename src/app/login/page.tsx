"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Utensils, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear errors on typing
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!formData.email || !formData.password || (isSignup && !formData.name)) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setLoading(true);

    try {
      if (isSignup) {
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", formData.email)
          .maybeSingle();

        if (existingUser) {
          setError("User with this email already exists. Please log in.");
          setLoading(false);
          return;
        }

        // Insert new user
        const { error: insertError } = await supabase
          .from("users")
          .insert({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: "Customer"
          });

        if (insertError) {
          if (insertError.code === '23505') {
            setError("User with this email already exists. Please log in.");
            setLoading(false);
            return;
          }
          throw insertError;
        }

        setSuccess("Account created successfully! Please log in.");
        setIsSignup(false);
        setFormData(prev => ({ ...prev, password: "" }));
      } else {
        // Login
        const { data, error: loginError } = await supabase
          .from("users")
          .select("*")
          .eq("email", formData.email)
          .eq("password", formData.password)
          .maybeSingle();

        if (loginError || !data) {
          setError("Invalid email or password.");
        } else {
          setSuccess(`Login successful! Redirecting as ${data.role}...`);
          setTimeout(() => router.push(`/?role=${data.role}&email=${encodeURIComponent(data.email)}`), 1000);
        }
      }
    } catch (err: any) {
      console.log("Login Error:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#181a1f] rounded-2xl shadow-xl overflow-hidden">
        {/* Header styling */}
        <div className="bg-black px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
          
          <button 
            onClick={() => router.push('/')}
            className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors z-20"
          >
            <ArrowRight size={16} className="rotate-180" /> Back
          </button>

          <div className="relative z-10 flex flex-col items-center mt-2">
            <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/40">
              <Utensils size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {isSignup ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="text-slate-400 text-sm">
              {isSignup ? "Join RestoPortal today" : "Sign in to your Restaurant Portal"}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-start">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#0f1115] border border-[#2c3038] rounded-lg text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isSignup && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-[#363b45] text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-slate-400 select-none">Remember me</span>
                </label>
                <Link href="#" className="text-sm font-medium text-amber-500 hover:text-blue-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignup ? "Create Account" : "Sign In"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setSuccess("");
              }}
              className="font-medium text-amber-500 hover:text-blue-500 transition-colors"
            >
              {isSignup ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
