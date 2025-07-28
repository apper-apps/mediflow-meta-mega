import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ title, onMobileMenuToggle }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            icon="Menu"
            onClick={onMobileMenuToggle}
            className="lg:hidden mr-3"
          />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" icon="Bell" />
          <Button variant="ghost" size="sm" icon="Settings" />
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-medical-600 rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">Dr. Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;