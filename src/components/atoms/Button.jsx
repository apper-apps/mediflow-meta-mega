import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-medical-600 hover:bg-medical-700 text-white focus:ring-medical-500 shadow-md hover:shadow-lg",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500",
    outline: "border-2 border-medical-600 text-medical-600 hover:bg-medical-50 focus:ring-medical-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const renderIcon = (iconName) => (
    <ApperIcon 
      name={iconName} 
      className={cn(
        "w-4 h-4",
        children && iconPosition === "left" && "mr-2",
        children && iconPosition === "right" && "ml-2"
      )} 
    />
  );

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && iconPosition === "left" && renderIcon(icon)}
      {children}
      {!loading && icon && iconPosition === "right" && renderIcon(icon)}
    </button>
  );
});

Button.displayName = "Button";

export default Button;