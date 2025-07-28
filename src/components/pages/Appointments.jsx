import React, { useState, useCallback } from "react";
import Button from "@/components/atoms/Button";
import AppointmentCalendar from "@/components/organisms/AppointmentCalendar";
import AppointmentForm from "@/components/organisms/AppointmentForm";
import { appointmentService } from "@/services/api/appointmentService";

const Appointments = () => {
  const [currentView, setCurrentView] = useState("calendar");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refreshCalendar, setRefreshCalendar] = useState(0);

  const handleScheduleNew = useCallback(() => {
    setSelectedAppointment(null);
    setCurrentView("form");
  }, []);

  const handleEditAppointment = useCallback((appointment) => {
    setSelectedAppointment(appointment);
    setCurrentView("form");
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    if (selectedAppointment) {
      await appointmentService.update(selectedAppointment.Id, formData);
    } else {
      await appointmentService.create(formData);
    }
    setCurrentView("calendar");
    setSelectedAppointment(null);
    setRefreshCalendar(prev => prev + 1);
  }, [selectedAppointment]);

  const handleCancel = useCallback(() => {
    setCurrentView("calendar");
    setSelectedAppointment(null);
  }, []);

  const toggleView = () => {
    setCurrentView(currentView === "calendar" ? "list" : "calendar");
  };

  return (
    <div className="space-y-6">
      {currentView === "calendar" ? (
        <>
          <div className="flex justify-between items-center">
            <div></div>
            <Button
              variant="outline"
              icon={currentView === "calendar" ? "List" : "Calendar"}
              onClick={toggleView}
            >
              {currentView === "calendar" ? "List View" : "Calendar View"}
            </Button>
          </div>
          <AppointmentCalendar
            key={refreshCalendar}
            onScheduleNew={handleScheduleNew}
            onEditAppointment={handleEditAppointment}
          />
        </>
      ) : (
        <AppointmentForm
          appointment={selectedAppointment}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Appointments;