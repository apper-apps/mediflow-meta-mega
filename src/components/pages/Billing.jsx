import React, { useState, useCallback, useEffect } from "react";
import SearchBar from "@/components/molecules/SearchBar";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import BillingForm from "@/components/organisms/BillingForm";
import { billService } from "@/services/api/billService";
import { patientService } from "@/services/api/patientService";
import { format } from "date-fns";

const BillingList = ({ onEdit, onAddNew }) => {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [billsData, patientsData] = await Promise.all([
        billService.getAll(),
        patientService.getAll()
      ]);
      setBills(billsData);
      setPatients(patientsData);
    } catch (err) {
      setError("Failed to load billing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPatientName = (patientId) => {
    const patient = patients.find(p => p.Id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "paid": return "success";
      case "pending": return "warning";
      case "partial": return "info";
      case "overdue": return "error";
      default: return "default";
    }
  };

  const filteredBills = bills.filter(bill => {
    const patientName = getPatientName(bill.patientId).toLowerCase();
    const search = searchTerm.toLowerCase();
    return patientName.includes(search) || 
           bill.status.toLowerCase().includes(search) ||
           bill.Id.toString().includes(search);
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Billing</h2>
        <Button onClick={onAddNew} icon="Plus">
          Create Bill
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search bills..."
          className="flex-1"
        />
      </div>

      {filteredBills.length === 0 ? (
        <Empty
          title="No bills found"
          description="Get started by creating your first bill"
          actionLabel="Create Bill"
          onAction={onAddNew}
          icon="Receipt"
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBills.map((bill) => (
                  <tr key={bill.Id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{bill.Id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center mr-4">
                          <ApperIcon name="User" className="w-5 h-5 text-medical-600" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {getPatientName(bill.patientId)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${bill.totalAmount?.toFixed(2) || "0.00"}
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid: ${bill.paidAmount?.toFixed(2) || "0.00"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(bill.status)}>
                        {bill.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(bill.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon="Edit"
                        onClick={() => onEdit(bill)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const Billing = () => {
  const [currentView, setCurrentView] = useState("list");
  const [selectedBill, setSelectedBill] = useState(null);
  const [refreshList, setRefreshList] = useState(0);

  const handleAddNew = useCallback(() => {
    setSelectedBill(null);
    setCurrentView("form");
  }, []);

  const handleEdit = useCallback((bill) => {
    setSelectedBill(bill);
    setCurrentView("form");
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    if (selectedBill) {
      await billService.update(selectedBill.Id, formData);
    } else {
      await billService.create(formData);
    }
    setCurrentView("list");
    setSelectedBill(null);
    setRefreshList(prev => prev + 1);
  }, [selectedBill]);

  const handleCancel = useCallback(() => {
    setCurrentView("list");
    setSelectedBill(null);
  }, []);

  return (
    <div className="space-y-6">
      {currentView === "list" ? (
        <BillingList
          key={refreshList}
          onEdit={handleEdit}
          onAddNew={handleAddNew}
        />
      ) : (
        <BillingForm
          bill={selectedBill}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Billing;