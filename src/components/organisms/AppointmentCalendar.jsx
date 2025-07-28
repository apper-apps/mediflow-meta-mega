import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { appointmentService } from "@/services/api/appointmentService";
import { patientService } from "@/services/api/patientService";
import { doctorService } from "@/services/api/doctorService";
import { format, startOfWeek, addDays, isSameDay, isToday } from "date-fns";

const AppointmentCalendar = ({ onScheduleNew, onEditAppointment }) => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
        doctorService.getAll()
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      setError("Failed to load calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getAppointmentsForDay = (date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.Id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.Id === doctorId);
    return doctor ? doctor.name : "Unknown Doctor";
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "confirmed": return "success";
      case "pending": return "warning";
      case "completed": return "info";
      case "cancelled": return "error";
      default: return "default";
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Appointment Calendar</h2>
        <Button onClick={onScheduleNew} icon="Plus">
          Schedule Appointment
        </Button>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Week of {format(weekDays[0], "MMM dd, yyyy")}
          </h3>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              icon="ChevronLeft"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentWeek(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="ChevronRight"
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            return (
              <div
                key={day.toISOString()}
                className={`border rounded-lg p-3 min-h-[200px] ${
                  isToday(day) ? "bg-medical-50 border-medical-200" : "bg-white border-gray-200"
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-sm font-medium text-gray-600">
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-lg font-semibold ${
                    isToday(day) ? "text-medical-600" : "text-gray-900"
                  }`}>
                    {format(day, "dd")}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayAppointments.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-4">
                      No appointments
                    </div>
                  ) : (
                    dayAppointments.map((appointment) => (
                      <div
                        key={appointment.Id}
                        className="bg-white border border-gray-200 rounded p-2 cursor-pointer hover:shadow-sm transition-shadow"
                        onClick={() => onEditAppointment(appointment)}
                      >
                        <div className="text-xs font-medium text-gray-900 mb-1">
                          {appointment.time}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {getPatientName(appointment.patientId)}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          Dr. {getDoctorName(appointment.doctorId)}
                        </div>
                        <Badge variant={getStatusVariant(appointment.status)} className="text-xs">
                          {appointment.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;