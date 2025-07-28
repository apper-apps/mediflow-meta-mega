import React, { useState, useCallback } from "react";
import PatientList from "@/components/organisms/PatientList";
import PatientForm from "@/components/organisms/PatientForm";
import TreatmentTimeline from "@/components/organisms/TreatmentTimeline";
import { patientService } from "@/services/api/patientService";

const Patients = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleAddNew = useCallback(() => {
    setSelectedPatient(null);
    setCurrentView("form");
  }, []);

const handleEdit = useCallback((patient) => {
    setSelectedPatient(patient);
    setCurrentView("form");
  }, []);

  const handleViewHistory = useCallback((patient) => {
    setSelectedPatient(patient);
    setCurrentView("history");
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    if (selectedPatient) {
      await patientService.update(selectedPatient.Id, formData);
    } else {
      await patientService.create(formData);
    }
    setCurrentView("list");
    setSelectedPatient(null);
    setRefreshList(prev => prev + 1);
  }, [selectedPatient]);

const handleCancel = useCallback(() => {
    setCurrentView("list");
    setSelectedPatient(null);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView("list");
    setSelectedPatient(null);
  }, []);

  return (
    <div className="space-y-6">
{currentView === "list" ? (
        <PatientList
          key={refreshList}
          onEdit={handleEdit}
          onAddNew={handleAddNew}
          onViewHistory={handleViewHistory}
        />
      ) : currentView === "form" ? (
        <PatientForm
          patient={selectedPatient}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onViewHistory={handleViewHistory}
        />
      ) : (
        <TreatmentTimeline
          patientId={selectedPatient?.Id}
          patientName={selectedPatient?.name}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default Patients;