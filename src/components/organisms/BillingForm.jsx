import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";
import { patientService } from "@/services/api/patientService";
import { appointmentService } from "@/services/api/appointmentService";

const BillingForm = ({ bill, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: bill?.patientId || "",
    appointmentId: bill?.appointmentId || "",
    items: bill?.items || [{ description: "", amount: 0 }],
    paidAmount: bill?.paidAmount || 0,
    status: bill?.status || "pending"
  });

  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "partial", label: "Partially Paid" },
    { value: "overdue", label: "Overdue" }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [patientsData, appointmentsData] = await Promise.all([
          patientService.getAll(),
          appointmentService.getAll()
        ]);
        setPatients(patientsData);
        setAppointments(appointmentsData);
      } catch (error) {
        toast.error("Failed to load form data");
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: "", amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patientId) newErrors.patientId = "Patient is required";
    
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = "Description is required";
      }
      if (!item.amount || parseFloat(item.amount) <= 0) {
        newErrors[`item_${index}_amount`] = "Amount must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        totalAmount: calculateTotal(),
        date: new Date().toISOString()
      };
      await onSubmit(submitData);
      toast.success(bill ? "Bill updated successfully" : "Bill created successfully");
    } catch (error) {
      toast.error("Failed to save bill");
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

  const appointmentOptions = appointments
    .filter(apt => !formData.patientId || apt.patientId === parseInt(formData.patientId))
    .map(appointment => ({
      value: appointment.Id,
      label: `${appointment.date} at ${appointment.time} - ${appointment.reason}`
    }));

  const totalAmount = calculateTotal();
  const balance = totalAmount - (parseFloat(formData.paidAmount) || 0);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {bill ? "Edit Bill" : "Create Bill"}
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
            label="Appointment (Optional)"
            type="select"
            options={appointmentOptions}
            value={formData.appointmentId}
            onChange={(e) => handleChange("appointmentId", e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Bill Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="Plus"
              onClick={addItem}
            >
              Add Item
            </Button>
          </div>
          
          {formData.items.map((item, index) => (
            <div key={index} className="flex items-end gap-4 p-4 border border-gray-200 rounded-lg">
              <FormField
                label="Description"
                required
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
                error={errors[`item_${index}_description`]}
                placeholder="Service or item description"
                className="flex-1"
              />
              
              <FormField
                label="Amount ($)"
                type="number"
                required
                min="0"
                step="0.01"
                value={item.amount}
                onChange={(e) => updateItem(index, "amount", e.target.value)}
                error={errors[`item_${index}_amount`]}
                placeholder="0.00"
                className="w-32"
              />
              
              {formData.items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon="Trash2"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700"
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <div className="text-2xl font-bold text-gray-900">
                ${totalAmount.toFixed(2)}
              </div>
            </div>
            
            <FormField
              label="Paid Amount ($)"
              type="number"
              min="0"
              step="0.01"
              value={formData.paidAmount}
              onChange={(e) => handleChange("paidAmount", e.target.value)}
              placeholder="0.00"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Balance
              </label>
              <div className={`text-2xl font-bold ${
                balance > 0 ? "text-red-600" : "text-green-600"
              }`}>
                ${balance.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <FormField
          label="Status"
          type="select"
          options={statusOptions}
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
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
            {bill ? "Update Bill" : "Create Bill"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;