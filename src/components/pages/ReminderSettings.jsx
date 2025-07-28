import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { toast } from "react-toastify";
import { notificationService } from "@/services/api/notificationService";

const ReminderSettings = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState({
    patient: { email: { subject: '', body: '' }, sms: '' },
    doctor: { email: { subject: '', body: '' }, sms: '' }
  });
  const [testData, setTestData] = useState({
    recipientType: 'patient',
    method: 'email',
    recipient: '',
    variables: {
      patientName: 'John Doe',
      doctorName: 'Dr. Smith',
      date: '2024-02-15',
      time: '10:00 AM',
      reason: 'Regular Checkup',
      patientPhone: '+1234567890'
    }
  });
  const [reminderTimeOptions, setReminderTimeOptions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load current templates
      const patientEmailTemplate = notificationService.getTemplate('patient', 'email');
      const patientSmsTemplate = notificationService.getTemplate('patient', 'sms');
      const doctorEmailTemplate = notificationService.getTemplate('doctor', 'email');
      const doctorSmsTemplate = notificationService.getTemplate('doctor', 'sms');
      
      setTemplates({
        patient: {
          email: patientEmailTemplate || { subject: '', body: '' },
          sms: patientSmsTemplate || ''
        },
        doctor: {
          email: doctorEmailTemplate || { subject: '', body: '' },
          sms: doctorSmsTemplate || ''
        }
      });

      // Load reminder time options
      const timeOptions = notificationService.getReminderTimeOptions();
      setReminderTimeOptions(timeOptions);
      
    } catch (error) {
      toast.error("Failed to load reminder settings");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateUpdate = async (recipientType, method, template) => {
    try {
      setLoading(true);
      await notificationService.updateTemplate(recipientType, method, template);
      
      setTemplates(prev => ({
        ...prev,
        [recipientType]: {
          ...prev[recipientType],
          [method]: template
        }
      }));
      
      toast.success("Template updated successfully");
    } catch (error) {
      toast.error("Failed to update template");
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      setLoading(true);
      await notificationService.testNotification(
        testData.recipientType,
        testData.method,
        testData.recipient,
        testData.variables
      );
      toast.success("Test notification sent successfully");
    } catch (error) {
      toast.error("Failed to send test notification");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'templates', name: 'Notification Templates', icon: 'FileText' },
    { id: 'settings', name: 'Reminder Settings', icon: 'Settings' },
    { id: 'test', name: 'Test Notifications', icon: 'Send' }
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reminder Settings</h1>
        <Badge variant="info">Notification System</Badge>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-medical-500 text-medical-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Templates */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="User" className="w-5 h-5 mr-2" />
                Patient Templates
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patient-email-subject">Email Subject</Label>
                  <Input
                    id="patient-email-subject"
                    value={templates.patient.email.subject}
                    onChange={(e) => setTemplates(prev => ({
                      ...prev,
                      patient: {
                        ...prev.patient,
                        email: { ...prev.patient.email, subject: e.target.value }
                      }
                    }))}
                    placeholder="Appointment Reminder - {doctorName}"
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient-email-body">Email Body</Label>
                  <textarea
                    id="patient-email-body"
                    rows={8}
                    className="input-field"
                    value={templates.patient.email.body}
                    onChange={(e) => setTemplates(prev => ({
                      ...prev,
                      patient: {
                        ...prev.patient,
                        email: { ...prev.patient.email, body: e.target.value }
                      }
                    }))}
                    placeholder="Dear {patientName}..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="patient-sms">SMS Template</Label>
                  <textarea
                    id="patient-sms"
                    rows={3}
                    className="input-field"
                    value={templates.patient.sms}
                    onChange={(e) => setTemplates(prev => ({
                      ...prev,
                      patient: { ...prev.patient, sms: e.target.value }
                    }))}
                    placeholder="Reminder: Appointment with {doctorName}..."
                  />
                </div>
                
                <Button 
                  onClick={() => handleTemplateUpdate('patient', 'email', templates.patient.email)}
                  icon="Save"
                  className="w-full"
                >
                  Save Patient Templates
                </Button>
              </div>
            </div>

            {/* Doctor Templates */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="UserCheck" className="w-5 h-5 mr-2" />
                Doctor Templates
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="doctor-email-subject">Email Subject</Label>
                  <Input
                    id="doctor-email-subject"
                    value={templates.doctor.email.subject}
                    onChange={(e) => setTemplates(prev => ({
                      ...prev,
                      doctor: {
                        ...prev.doctor,
                        email: { ...prev.doctor.email, subject: e.target.value }
                      }
                    }))}
                    placeholder="Patient Appointment Reminder - {patientName}"
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor-email-body">Email Body</Label>
                  <textarea
                    id="doctor-email-body"
                    rows={8}
                    className="input-field"
                    value={templates.doctor.email.body}
                    onChange={(e) => setTemplates(prev => ({
                      ...prev,
                      doctor: {
                        ...prev.doctor,
                        email: { ...prev.doctor.email, body: e.target.value }
                      }
                    }))}
                    placeholder="Dear Dr. {doctorName}..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="doctor-sms">SMS Template</Label>
                  <textarea
                    id="doctor-sms"
                    rows={3}
                    className="input-field"
                    value={templates.doctor.sms}
                    onChange={(e) => setTemplates(prev => ({
                      ...prev,
                      doctor: { ...prev.doctor, sms: e.target.value }
                    }))}
                    placeholder="Appointment reminder: {patientName}..."
                  />
                </div>
                
                <Button 
                  onClick={() => handleTemplateUpdate('doctor', 'email', templates.doctor.email)}
                  icon="Save"
                  className="w-full"
                >
                  Save Doctor Templates
                </Button>
              </div>
            </div>
          </div>

          {/* Template Variables */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Template Variables</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['{patientName}', '{doctorName}', '{date}', '{time}', '{reason}', '{patientPhone}'].map(variable => (
                <Badge key={variable} variant="outline" className="text-center">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Reminder Times</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reminderTimeOptions.map(option => (
                <div key={option.value} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    <Badge variant="medical">{option.hours}h</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {option.hours >= 24 ? `${option.hours / 24} day(s)` : `${option.hours} hour(s)`} before appointment
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <ApperIcon name="Mail" className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium">Email Notifications</span>
                  <Badge variant="success" className="ml-auto">Active</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Send appointment reminders via email to patients and doctors
                </p>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <ApperIcon name="MessageSquare" className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium">SMS Notifications</span>
                  <Badge variant="success" className="ml-auto">Active</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Send appointment reminders via SMS to patients and doctors
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Notifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient-type">Recipient Type</Label>
                  <Select
                    id="recipient-type"
                    value={testData.recipientType}
                    onChange={(e) => setTestData(prev => ({ ...prev, recipientType: e.target.value }))}
                    options={[
                      { value: 'patient', label: 'Patient' },
                      { value: 'doctor', label: 'Doctor' }
                    ]}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notification-method">Notification Method</Label>
                  <Select
                    id="notification-method"
                    value={testData.method}
                    onChange={(e) => setTestData(prev => ({ ...prev, method: e.target.value }))}
                    options={[
                      { value: 'email', label: 'Email' },
                      { value: 'sms', label: 'SMS' }
                    ]}
                  />
                </div>
                
                <div>
                  <Label htmlFor="test-recipient">
                    {testData.method === 'email' ? 'Email Address' : 'Phone Number'}
                  </Label>
                  <Input
                    id="test-recipient"
                    value={testData.recipient}
                    onChange={(e) => setTestData(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder={testData.method === 'email' ? 'test@example.com' : '+1234567890'}
                  />
                </div>
                
                <Button 
                  onClick={handleTestNotification}
                  icon="Send"
                  disabled={!testData.recipient}
                  className="w-full"
                >
                  Send Test Notification
                </Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Test Variables</h4>
                {Object.entries(testData.variables).map(([key, value]) => (
                  <div key={key}>
                    <Label htmlFor={`var-${key}`}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                    <Input
                      id={`var-${key}`}
                      value={value}
                      onChange={(e) => setTestData(prev => ({
                        ...prev,
                        variables: { ...prev.variables, [key]: e.target.value }
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;