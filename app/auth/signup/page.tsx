
import type { Metadata } from "next";
import SignUpForm from "./signup-form";

export const metadata: Metadata = {
  title: "SignUp | Vbond Contest",
  description: "Securely signup to access your account",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-white">
       {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#E67817] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E67817] to-[#b05a0b] z-0" />
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="relative z-10 text-white text-center px-8">
            <h1 className="text-5xl font-bold mb-4 tracking-tight">Join the Fun!</h1>
            <p className="text-xl text-orange-100 max-w-md mx-auto">
              Create your account today and start your journey with Vbond.
            </p>
        </div>
        
        {/* Abstract shapes for visual interest */}
        <div className="absolute -bottom-24 -left-20 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -top-24 -right-20 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Right side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 my-8">
           <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-2">Sign up to get started.</p>
           </div>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}