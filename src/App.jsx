import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ReminderSettings from "@/components/pages/ReminderSettings";
import "@/index.css";
import Layout from "@/components/Layout";
import Doctors from "@/components/pages/Doctors";
import Billing from "@/components/pages/Billing";
import Dashboard from "@/components/pages/Dashboard";
import Appointments from "@/components/pages/Appointments";
import Patients from "@/components/pages/Patients";
function App() {
  return (
    <BrowserRouter>
      <div className="App">
<Routes>
<Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="billing" element={<Billing />} />
            <Route path="reminders" element={<ReminderSettings />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="patients" element={<Patients />} />
          </Route>
        </Routes>
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;