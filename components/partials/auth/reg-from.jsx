import React, { useState } from "react";
import { toast } from "react-toastify";
import Textinput from "@/components/ui/Textinput";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import Checkbox from "@/components/ui/Checkbox";
import { useAuth } from "@/lib/supabase/hooks/useAuth";

const schema = yup
  .object({
    full_name: yup.string().required("Full name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password shouldn't be more than 20 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      )
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Please confirm your password"),
    terms: yup
      .boolean()
      .oneOf([true], "You must accept the terms and conditions")
      .required(),
  })
  .required();

const RegForm = () => {
  const { signUp, isLoading, error } = useAuth();
  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    try {
      const response = await signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (response.success) {
        toast.success("Registration successful! Please check your email to verify your account.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        router.push("/auth/verify-email");
      } else {
        toast.error(response.error || "Registration failed", {
          position: "top-right",
          autoClose: 5000,
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
        autoClose: 5000,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Textinput
        name="full_name"
        label="Full Name"
        type="text"
        id="full_name"
        placeholder="Enter your full name"
        register={register}
        error={errors.full_name}
        className="h-[48px]"
      />
      <Textinput
        name="email"
        label="Email"
        type="email"
        id="email"
        placeholder="Enter your email"
        register={register}
        error={errors.email}
        className="h-[48px]"
      />
      <Textinput
        name="password"
        label="Password"
        type="password"
        id="password"
        placeholder="Enter your password"
        register={register}
        error={errors.password}
        className="h-[48px]"
        hasicon
      />
      <Textinput
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        placeholder="Confirm your password"
        register={register}
        error={errors.confirmPassword}
        className="h-[48px]"
        hasicon
      />
      <div className="flex items-center">
        <input
          type="checkbox"
          id="terms"
          {...register("terms")}
          className="form-checkbox h-4 w-4 text-primary-500 transition duration-150 ease-in-out"
        />
        <label htmlFor="terms" className="ml-2 block text-sm leading-5 text-slate-500">
          I accept the{" "}
          <a href="/terms" className="text-primary-500 hover:text-primary-600">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary-500 hover:text-primary-600">
            Privacy Policy
          </a>
        </label>
      </div>
      {errors.terms && (
        <p className="mt-1 text-sm text-danger-500" role="alert">
          {errors.terms.message}
        </p>
      )}

      <button 
        type="submit" 
        className="btn btn-dark block w-full text-center h-[48px]"
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
            Creating account...
          </span>
        ) : (
          "Create an account"
        )}
      </button>

      {error && (
        <div className="text-sm text-red-500 mt-2" role="alert">
          {error}
        </div>
      )}
    </form>
  );
};

export default RegForm;
