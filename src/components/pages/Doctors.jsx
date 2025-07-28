import React, { useState, useCallback } from "react";
import DoctorList from "@/components/organisms/DoctorList";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";
import { doctorService } from "@/services/api/doctorService";
import { toast } from "react-toastify";

const DoctorForm = ({ doctor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: doctor?.name || "",
    specialization: doctor?.specialization || "",
    contact: doctor?.contact || "",
    email: doctor?.email || "",
    isAvailable: doctor?.isAvailable ?? true,
    workingHours: doctor?.workingHours || { start: "09:00", end: "17:00" }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const specializations = [
    { value: "General Medicine", label: "General Medicine" },
    { value: "Cardiology", label: "Cardiology" },
    { value: "Neurology", label: "Neurology" },
    { value: "Orthopedics", label: "Orthopedics" },
    { value: "Pediatrics", label: "Pediatrics" },
    { value: "Gynecology", label: "Gynecology" },
    { value: "Dermatology", label: "Dermatology" },
    { value: "ENT", label: "ENT" },
    { value: "Psychiatry", label: "Psychiatry" },
    { value: "Surgery", label: "Surgery" }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.specialization) newErrors.specialization = "Specialization is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(doctor ? "Doctor updated successfully" : "Doctor added successfully");
    } catch (error) {
      toast.error("Failed to save doctor information");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleWorkingHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: { ...prev.workingHours, [field]: value }
    }));
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {doctor ? "Edit Doctor" : "Add Doctor"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="Enter doctor's full name"
          />
          
          <FormField
            label="Specialization"
            type="select"
            required
            options={specializations}
            value={formData.specialization}
            onChange={(e) => handleChange("specialization", e.target.value)}
            error={errors.specialization}
          />
          
          <FormField
            label="Contact Number"
            required
            value={formData.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
            error={errors.contact}
            placeholder="Enter phone number"
          />
          
          <FormField
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
            placeholder="Enter email address"
          />
          
          <FormField
            label="Start Time"
            type="time"
            value={formData.workingHours.start}
            onChange={(e) => handleWorkingHoursChange("start", e.target.value)}
          />
          
          <FormField
            label="End Time"
            type="time"
            value={formData.workingHours.end}
            onChange={(e) => handleWorkingHoursChange("end", e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) => handleChange("isAvailable", e.target.checked)}
            className="h-4 w-4 text-medical-600 focus:ring-medical-500 border-gray-300 rounded"
          />
          <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
            Available for appointments
          </label>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            icon="Save"
          >
            {doctor ? "Update Doctor" : "Add Doctor"}
          </Button>
        </div>
      </form>
    </div>
  );
};

const Doctors = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleAddNew = useCallback(() => {
    setSelectedDoctor(null);
    setCurrentView("form");
  }, []);

  const handleEdit = useCallback((doctor) => {
    setSelectedDoctor(doctor);
    setCurrentView("form");
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    if (selectedDoctor) {
      await doctorService.update(selectedDoctor.Id, formData);
    } else {
      await doctorService.create(formData);
    }
    setCurrentView("list");
    setSelectedDoctor(null);
    setRefreshList(prev => prev + 1);
  }, [selectedDoctor]);

  const handleCancel = useCallback(() => {
    setCurrentView("list");
    setSelectedDoctor(null);
  }, []);

  return (
    <div className="space-y-6">
      {currentView === "list" ? (
        <DoctorList
          key={refreshList}
          onEdit={handleEdit}
          onAddNew={handleAddNew}
        />
      ) : (
        <DoctorForm
          doctor={selectedDoctor}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Doctors;