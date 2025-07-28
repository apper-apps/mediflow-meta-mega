import React from "react";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  type = "text", 
  required = false, 
  error, 
  className,
  options,
  children,
  ...props 
}) => {
  const renderInput = () => {
    if (type === "select" && options) {
      return (
        <Select error={error} {...props}>
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    }
    
    if (children) {
      return children;
    }
    
    return <Input type={type} error={error} {...props} />;
  };

  return (
    <div className={cn("space-y-1", className)}>
      <Label required={required}>{label}</Label>
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;