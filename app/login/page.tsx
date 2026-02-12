import LoginForm from "./login-form";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Login | My App",
  description: "Securely login to access your account",
};
export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Welcome Back
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}