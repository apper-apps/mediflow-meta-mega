import React, { useState, useEffect } from "react";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { doctorService } from "@/services/api/doctorService";

const DoctorList = ({ onEdit, onAddNew }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadDoctors = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await doctorService.getAll();
      setDoctors(data);
    } catch (err) {
      setError("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDoctors} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Doctors</h2>
        <Button onClick={onAddNew} icon="Plus">
          Add Doctor
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search doctors..."
          className="flex-1"
        />
      </div>

      {filteredDoctors.length === 0 ? (
        <Empty
          title="No doctors found"
          description="Get started by adding your first doctor"
          actionLabel="Add Doctor"
          onAction={onAddNew}
          icon="UserCheck"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.Id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center mr-4">
                    <ApperIcon name="UserCheck" className="w-6 h-6 text-medical-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.name}</h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                </div>
                <Badge variant={doctor.isAvailable ? "success" : "error"}>
                  {doctor.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="Phone" className="w-4 h-4 mr-2" />
                  {doctor.contact}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                  {doctor.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ApperIcon name="Clock" className="w-4 h-4 mr-2" />
                  {doctor.workingHours?.start || "9:00 AM"} - {doctor.workingHours?.end || "5:00 PM"}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon="Edit"
                  onClick={() => onEdit(doctor)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="Calendar"
                >
                  Schedule
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorList;