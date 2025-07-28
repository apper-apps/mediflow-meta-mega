import React, { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { patientService } from "@/services/api/patientService";
import { appointmentService } from "@/services/api/appointmentService";
import { doctorService } from "@/services/api/doctorService";
import { billService } from "@/services/api/billService";
import { format, isToday } from "date-fns";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    availableDoctors: 0,
    pendingBills: 0
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [patients, appointments, doctors, bills] = await Promise.all([
        patientService.getAll(),
        appointmentService.getAll(),
        doctorService.getAll(),
        billService.getAll()
      ]);

      const todayAppts = appointments.filter(apt => 
        isToday(new Date(apt.date))
      );

      setStats({
        totalPatients: patients.length,
        todayAppointments: todayAppts.length,
        availableDoctors: doctors.filter(doc => doc.isAvailable).length,
        pendingBills: bills.filter(bill => bill.status === "pending").length
      });

      setTodayAppointments(todayAppts.slice(0, 5));
      setRecentPatients(patients.slice(-5).reverse());
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getPatientName = (patientId) => {
    const patient = recentPatients.find(p => p.Id === patientId);
    return patient?.name || "Unknown Patient";
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
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {format(new Date(), "EEEE, MMMM dd, yyyy")}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon="Users"
          color="medical"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon="Calendar"
          color="success"
        />
        <StatCard
          title="Available Doctors"
          value={stats.availableDoctors}
          icon="UserCheck"
          color="warning"
        />
        <StatCard
          title="Pending Bills"
          value={stats.pendingBills}
          icon="Receipt"
          color="error"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
            <Button variant="ghost" size="sm" icon="Calendar">
              View All
            </Button>
          </div>
          
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Calendar" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center mr-3">
                      <ApperIcon name="User" className="w-5 h-5 text-medical-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getPatientName(appointment.patientId)}</p>
                      <p className="text-sm text-gray-600">{appointment.time} - {appointment.reason}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Patients */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
            <Button variant="ghost" size="sm" icon="Users">
              View All
            </Button>
          </div>
          
          {recentPatients.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Users" className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No patients registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPatients.map((patient) => (
                <div key={patient.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <ApperIcon name="User" className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {format(new Date(patient.registrationDate), "MMM dd")}
                    </p>
                    <Badge variant="medical">{patient.bloodGroup || "N/A"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-16 flex-col" icon="UserPlus">
            Register Patient
          </Button>
          <Button variant="outline" className="h-16 flex-col" icon="Calendar">
            Schedule Appointment
          </Button>
          <Button variant="outline" className="h-16 flex-col" icon="UserCheck">
            Add Doctor
          </Button>
          <Button variant="outline" className="h-16 flex-col" icon="Receipt">
            Create Bill
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;