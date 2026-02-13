import LoginForm from "./login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Vbond Contest",
  description: "Securely login to access your account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#01458E] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01458E] to-[#002f61] z-0" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#E67817_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 text-white text-center px-8">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Welcome Back!</h1>
            <p className="text-xl text-blue-100 max-w-md mx-auto">
              Join the contest and showcase your talent to the world.
            </p>
        </div>
        
        {/* Abstract shapes for visual interest */}
        <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-[#E67817] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -top-24 -right-20 w-80 h-80 bg-[#E67817] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
           <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
              <p className="text-gray-500 mt-2">Please enter your details to continue.</p>
           </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}