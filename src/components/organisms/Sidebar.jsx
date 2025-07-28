import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Patients", href: "/patients", icon: "Users" },
    { name: "Appointments", href: "/appointments", icon: "Calendar" },
    { name: "Doctors", href: "/doctors", icon: "UserCheck" },
    { name: "Billing", href: "/billing", icon: "Receipt" },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-medical-100 text-medical-700 shadow-sm"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )
      }
      onClick={() => onClose?.()}
    >
      <ApperIcon name={item.icon} className="mr-3 h-5 w-5" />
      {item.name}
    </NavLink>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5">
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="w-8 h-8 bg-medical-600 rounded-lg flex items-center justify-center mr-3">
            <ApperIcon name="Heart" className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">MediFlow Pro</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center text-sm text-gray-500">
            <ApperIcon name="Shield" className="w-4 h-4 mr-2" />
            Hospital Management
          </div>
        </div>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <div className={cn(
      "lg:hidden fixed inset-0 z-50 transition-opacity duration-300",
      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
    )}>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
      <div className={cn(
        "fixed inset-y-0 left-0 flex flex-col w-64 bg-white transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-medical-600 rounded-lg flex items-center justify-center mr-3">
              <ApperIcon name="Heart" className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">MediFlow Pro</h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;