
import type { Metadata } from "next";
import SignUpForm from "./signup-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SignUp | Vbond Contest",
  description: "Securely signup to access your account",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-auto bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 fixed">
         <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary1/20 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-primary2/10 rounded-full blur-[120px] animate-pulse animation-delay-2000"></div>
         <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="w-full max-w-lg relative z-10 my-8">
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-3xl p-8 transform transition-all hover:scale-[1.005]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-2 transform hover:scale-105 transition-transform">
              <img src="/VBONDTALENT.png" alt="Vbond Talent" className="h-12 w-auto mx-auto" />
            </Link>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Create Account</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm">Join us and start your journey</p>
          </div>
          
          <SignUpForm />
        </div>
        
        <div className="text-center mt-6">
           <p className="text-zinc-500 dark:text-zinc-400 text-sm">
             Already have an account?{" "}
             <Link href="/auth/login" className="text-primary1 font-semibold hover:text-primary2 transition-colors">
               Log in
             </Link>
           </p>
        </div>
      </div>
    </div>
  );
}