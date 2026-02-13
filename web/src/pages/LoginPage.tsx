import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  FaEye,
  FaEyeSlash,
  FaExclamationCircle
} from "react-icons/fa";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "../config/auth.schema";
import { AlertCircle } from "lucide-react";

const LoginPage: React.FC = () => {
  const { login, register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstname: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleLoginSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        navigate({ to: "/overview" });
      } else {
        loginForm.setError("root", { message: "Invalid email or password" });
      }
    } catch (err) {
      loginForm.setError("root", {
        message: "An unexpected error occurred during login. Please try again.",
      });
    }
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    try {
      const success = await registerUser(
        data.email,
        data.password,
        data.firstname,
        data.lastName
      );
      if (success) {
        setShowRegisterSuccess(true);
        setIsRegisterMode(false);
        registerForm.reset();
      } else {
        registerForm.setError("root", {
          message:
            "Registration failed. Email might already be in use or another error occurred.",
        });
      }
    } catch (err: any) {
      if (err?.response?.message) {
        registerForm.setError("root", { message: err.response.message });
      } else {
        registerForm.setError("root", {
          message:
            "Registration failed. Email might already be in use or another error occurred.",
        });
      }
    }
  };

  return (
      <div className="min-h-screen h-screen flex flex-col justify-center items-center p-5 box-border bg-[#f4f7fc] font-sans overflow-hidden">
      <div className="flex w-full max-w-[1400px] min-w-[320px] h-fit max-h-[95vh] bg-white rounded-2xl shadow-[0_20px_80px_rgba(173,179,199,0.45)] overflow-hidden relative z-10 mx-auto">
        {/* Welcome Panel */}
        <div className="flex-1 min-w-0 flex flex-col justify-between items-center text-center relative bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-6 overflow-hidden">
          <div className="mt-6 z-10 text-center">
            <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
              {isRegisterMode ? "Join Our AI LPR" : "Welcome to AI LPR"}
            </h1>
            <p className="text-white/95 text-lg font-light tracking-wide drop-shadow-md">
              {isRegisterMode
                ? "Sign up for the AI LPR system to enhance security and efficiency"
                : "Advanced License Plate Recognition System"}
            </p>
          </div>
          <div className="flex-1 flex items-center justify-center w-full">
            <img
              src="/AI-LPR.png"
              alt="AI LPR System"
              className="w-full h-auto max-w-[600px] max-h-[500px] md:max-h-[550px] object-contain"
            />
          </div>
          <div className="h-4" />
        </div>

        {/* Login/Register Panel */}
        <div className="flex-1 p-6 min-w-0 min-h-[320px] box-border flex flex-col justify-center items-center bg-white">
          {isRegisterMode ? (
            <form
              className="w-full max-w-[380px] flex flex-col items-center text-center min-h-[620px] justify-center"
              onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
            >
              <img
                src="/LPR Eye-logo.png"
                alt="Register Logo"
                className="w-[260px] h-auto mx-auto mb-4"
              />
              <div className="w-full flex gap-2 mb-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="First Name"
                    {...registerForm.register("firstname")}
                    className={`w-full p-3 border rounded-xl bg-white text-base text-gray-800 transition focus:outline-none focus:border-indigo-500 ${registerForm.formState.errors.firstname ? "border-red-500" : "border-gray-200"}`}
                  />
                  <div className="h-5">
                    {registerForm.formState.errors.firstname && (
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {registerForm.formState.errors.firstname.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Last Name"
                    {...registerForm.register("lastName")}
                    className={`w-full p-3 border rounded-xl bg-white text-base text-gray-800 transition focus:outline-none focus:border-indigo-500 ${registerForm.formState.errors.lastName ? "border-red-500" : "border-gray-200"}`}
                  />
                  <div className="h-5">
                    {registerForm.formState.errors.lastName && (
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {registerForm.formState.errors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full mb-2">
                <input
                  type="email"
                  placeholder="Email"
                  {...registerForm.register("email")}
                  className={`w-full p-3 border rounded-xl bg-white text-base text-gray-800 transition focus:outline-none focus:border-indigo-500 ${registerForm.formState.errors.email ? "border-red-500" : "border-gray-200"}`}
                />
                <div className="h-5">
                  {registerForm.formState.errors.email && (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {registerForm.formState.errors.email.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full mb-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...registerForm.register("password")}
                  className={`w-full p-3 border rounded-xl bg-white text-base text-gray-800 transition focus:outline-none focus:border-indigo-500 ${registerForm.formState.errors.password ? "border-red-500" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[24px] -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="h-5">
                  {registerForm.formState.errors.password && (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {registerForm.formState.errors.password.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full mb-2 relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...registerForm.register("confirmPassword")}
                  className={`w-full p-3 border rounded-xl bg-white text-base text-gray-800 transition focus:outline-none focus:border-indigo-500 ${registerForm.formState.errors.confirmPassword ? "border-red-500" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[24px] -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="h-5">
                  {registerForm.formState.errors.confirmPassword && (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {registerForm.formState.errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>
              {registerForm.formState.errors.root && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 flex items-center gap-2 mb-5">
                  <FaExclamationCircle className="w-4 h-4" />
                  <span>{registerForm.formState.errors.root.message}</span>
                </div>
              )}
              <button
                type="submit"
                className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 !text-gray-100 font-bold uppercase shadow-lg hover:-translate-y-1 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={isLoading || registerForm.formState.isSubmitting}
              >
                {isLoading || registerForm.formState.isSubmitting
                  ? "Registering..."
                  : "REGISTER"}
              </button>
              <div className="mt-2">
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-indigo-500 hover:underline font-medium"
                    onClick={() => setIsRegisterMode(false)}
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form
              className="w-full max-w-[380px] flex flex-col items-center text-center justify-center min-h-[620px]"
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
            >
              <img
                src="/LPR Eye-logo.png"
                alt="Unit Icon"
                className="w-[260px] h-auto mx-auto mb-4"
              />
              <div className="w-full mb-2">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  {...loginForm.register("email")}
                  className={`w-full p-3 border rounded-xl bg-white text-base text-gray-800 transition focus:outline-none focus:border-indigo-500 ${loginForm.formState.errors.email ? "border-red-500" : "border-gray-200"}`}
                />
                <div className="h-5">
                  {loginForm.formState.errors.email && (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {loginForm.formState.errors.email.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full mb-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...loginForm.register("password")}
                  className={`w-full p-3 border rounded-xl bg-white text-base text-gray-800 transition focus:outline-none focus:border-indigo-500 ${loginForm.formState.errors.password ? "border-red-500" : "border-gray-200"}`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-[24px] -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                <div className="h-5">
                  {loginForm.formState.errors.password && (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {loginForm.formState.errors.password.message}
                    </span>
                  )}
                </div>
              </div>
                {loginForm.formState.errors.root && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 flex items-center gap-2 mb-5">
                    <FaExclamationCircle className="w-4 h-4" />
                    <span>{loginForm.formState.errors.root.message}</span>
                  </div>
                )}
                <div className="w-full flex items-center justify-between text-sm mb-3">
                  <label className="flex items-center gap-2 font-medium text-gray-700 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      {...loginForm.register("rememberMe")}
                      disabled={isLoading}
                      className="accent-indigo-500 flex-shrink-0"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 hover:underline font-medium transition-colors whitespace-nowrap ml-2"
                    onClick={() =>
                      alert(
                        "Forgot password functionality would be implemented here."
                      )
                    }
                    disabled={isLoading}
                  >
                    Forgot your password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 !text-gray-100 font-bold uppercase shadow-lg hover:-translate-y-1 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={loginForm.formState.isSubmitting}
                >
                  {isLoading || loginForm.formState.isSubmitting
                    ? "Signing in..."
                    : "LOGIN"}
                </button>
                <div className="mt-2">
                  <p>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-indigo-500 hover:underline font-medium"
                      onClick={() => setIsRegisterMode(true)}
                    >
                      Register now
                    </button>
                  </p>
                </div>
              </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-gray-400 text-xs mt-8">
        © 2024 - {new Date().getFullYear()} RMUTP All rights reserved..
      </footer>

      {/* Registration Success Popup */}
      {showRegisterSuccess && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
          <div className="bg-gray-900 text-white p-8 rounded-xl min-w-[320px] shadow-2xl text-center">
            <h2 className="text-xl font-bold mb-4">Registration Successful!</h2>
            <p className="mb-6">Please login with your new account.</p>
            <button
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-8 py-2 text-lg font-semibold"
              onClick={() => setShowRegisterSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;