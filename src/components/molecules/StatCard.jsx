import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue, 
  className,
  color = "medical"
}) => {
  const colorClasses = {
    medical: "bg-medical-50 text-medical-600",
    success: "bg-green-50 text-green-600",
    warning: "bg-yellow-50 text-yellow-600",
    error: "bg-red-50 text-red-600"
  };

  return (
    <div className={cn("card p-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                className={cn(
                  "w-4 h-4 mr-1",
                  trend === "up" ? "text-green-500" : "text-red-500"
                )}
              />
              <span className={cn(
                "text-sm font-medium",
                trend === "up" ? "text-green-600" : "text-red-600"
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center",
          colorClasses[color]
        )}>
          <ApperIcon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;