import React, { useState } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { toast } from "react-toastify";

const PatientForm = ({ patient, onSubmit, onCancel, onViewHistory }) => {
  const [formData, setFormData] = useState({
    name: patient?.name || "",
    dateOfBirth: patient?.dateOfBirth || "",
    contact: patient?.contact || "",
    email: patient?.email || "",
    emergencyContact: patient?.emergencyContact || "",
    bloodGroup: patient?.bloodGroup || "",
    allergies: patient?.allergies || ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const bloodGroups = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = "Emergency contact is required";
    
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
      toast.success(patient ? "Patient updated successfully" : "Patient registered successfully");
    } catch (error) {
      toast.error("Failed to save patient information");
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

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {patient ? "Edit Patient" : "Patient Registration"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="Enter patient's full name"
          />
          
          <FormField
            label="Date of Birth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            error={errors.dateOfBirth}
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
            label="Emergency Contact"
            required
            value={formData.emergencyContact}
            onChange={(e) => handleChange("emergencyContact", e.target.value)}
            error={errors.emergencyContact}
            placeholder="Emergency contact number"
          />
          
          <FormField
            label="Blood Group"
            type="select"
            options={bloodGroups}
            value={formData.bloodGroup}
            onChange={(e) => handleChange("bloodGroup", e.target.value)}
            error={errors.bloodGroup}
          />
        </div>
        
        <FormField
          label="Allergies"
          value={formData.allergies}
          onChange={(e) => handleChange("allergies", e.target.value)}
          placeholder="List any known allergies (optional)"
        />
        
<div className="flex justify-between">
          <div>
            {patient && onViewHistory && (
              <Button
                type="button"
                variant="outline"
                icon="Clock"
                onClick={() => onViewHistory(patient)}
              >
                View Treatment History
              </Button>
            )}
          </div>
          <div className="flex space-x-4">
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
              {patient ? "Update Patient" : "Register Patient"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;