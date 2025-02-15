import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/ui/Checkbox";
import Link from "next/link";
import { useAuth } from "@/lib/supabase/hooks/useAuth";
import { toast } from "react-toastify";

// Form validation schema
const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is Required"),
  password: yup.string().required("Password is Required"),
}).required();

const LoginForm = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, isLoading, error } = useAuth();
  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "all",
  });

  const onSubmit = async (data) => {
    try {
      const response = await signIn({
        email: data.email,
        password: data.password,
      });

      if (response.success) {
        toast.success("Successfully logged in!", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        // Router push is handled by the hook
      } else {
        toast.error(response.error || "Failed to login", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (err) {
      toast.error("An unexpected error occurred", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Textinput
        name="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        register={register}
        error={errors?.email}
      />
      <Textinput
        name="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        register={register}
        error={errors.password}
      />
      <div className="flex justify-between">
        <Checkbox
          value={rememberMe}
          onChange={() => setRememberMe(!rememberMe)}
          label="Keep me signed in"
        />
        <Link
          href="/forgot-password"
          className="text-sm text-slate-800 dark:text-slate-400 leading-6 font-medium"
        >
          Forgot Password?
        </Link>
      </div>

      <button 
        type="submit" 
        className="btn btn-dark block w-full text-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin h-5 w-5 mr-3">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </span>
            Signing in...
          </span>
        ) : (
          "Sign in"
        )}
      </button>

      {error && (
        <div className="text-sm text-red-500 mt-2">
          {error}
        </div>
      )}
    </form>
  );
};

export default LoginForm;
