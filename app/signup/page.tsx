
import type { Metadata } from "next";
import SignUpForm from "./signup-form";
export const metadata: Metadata = {
  title: "SignUp to the talent hunt",
  description: "Securely signup to access your account",
};
export default function LoginPage() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <h1 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Sign In
        </h1>
        {/* <LoginForm /> */}
        <SignUpForm />
      </div>
    </div>
  );
}