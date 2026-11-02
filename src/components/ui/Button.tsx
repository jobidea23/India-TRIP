import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button({ variant = "primary", size = "md", className = "", children, ...rest }: Props) {
  const base = "rounded-xl font-semibold active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-brand-green text-white hover:bg-green-700",
    secondary: "bg-brand-blue text-white hover:bg-blue-700",
    ghost: "bg-transparent text-brand-navy hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
