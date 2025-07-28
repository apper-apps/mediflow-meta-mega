import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { toast } from "react-toastify";
import { patientService } from "@/services/api/patientService";
import { doctorService } from "@/services/api/doctorService";
import { format } from "date-fns";

const AppointmentForm = ({ appointment, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: appointment?.patientId || "",
    doctorId: appointment?.doctorId || "",
    date: appointment?.date || format(new Date(), "yyyy-MM-dd"),
    time: appointment?.time || "",
    reason: appointment?.reason || "",
    notes: appointment?.notes || "",
    status: appointment?.status || "pending"
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, doctorsData] = await Promise.all([
          patientService.getAll(),
          doctorService.getAll()
        ]);
        setPatients(patientsData);
        setDoctors(doctorsData);
      } catch (error) {
        toast.error("Failed to load form data");
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) newErrors.patientId = "Patient is required";
    if (!formData.doctorId) newErrors.doctorId = "Doctor is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(appointment ? "Appointment updated successfully" : "Appointment scheduled successfully");
    } catch (error) {
      toast.error("Failed to save appointment");
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

  if (dataLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const patientOptions = patients.map(patient => ({
    value: patient.Id,
    label: patient.name
  }));

  const doctorOptions = doctors.filter(doctor => doctor.isAvailable).map(doctor => ({
    value: doctor.Id,
    label: `Dr. ${doctor.name} - ${doctor.specialization}`
  }));

  const timeOptions = timeSlots.map(time => ({
    value: time,
    label: time
  }));

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {appointment ? "Edit Appointment" : "Schedule Appointment"}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Patient"
            type="select"
            required
            options={patientOptions}
            value={formData.patientId}
            onChange={(e) => handleChange("patientId", e.target.value)}
            error={errors.patientId}
          />
          
          <FormField
            label="Doctor"
            type="select"
            required
            options={doctorOptions}
            value={formData.doctorId}
            onChange={(e) => handleChange("doctorId", e.target.value)}
            error={errors.doctorId}
          />
          
          <FormField
            label="Date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            error={errors.date}
          />
          
          <FormField
            label="Time"
            type="select"
            required
            options={timeOptions}
            value={formData.time}
            onChange={(e) => handleChange("time", e.target.value)}
            error={errors.time}
          />
          
          <FormField
            label="Status"
            type="select"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => handleChange("status", e.target.value)}
          />
        </div>
        
        <FormField
          label="Reason for Visit"
          required
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          error={errors.reason}
          placeholder="Brief description of the appointment reason"
        />
        
        <FormField
          label="Additional Notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Any additional notes or instructions (optional)"
        />
        
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
            {appointment ? "Update Appointment" : "Schedule Appointment"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;