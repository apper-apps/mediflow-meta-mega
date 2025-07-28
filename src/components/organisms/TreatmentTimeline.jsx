import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { treatmentService } from '@/services/api/treatmentService';
import { toast } from 'react-toastify';

const TreatmentTimeline = ({ patientId, patientName, onBack }) => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [uploadingFiles, setUploadingFiles] = useState({});

  useEffect(() => {
    loadTreatments();
  }, [patientId]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await treatmentService.getByPatientId(patientId);
      setTreatments(data);
    } catch (err) {
      setError('Failed to load treatment history');
      console.error('Error loading treatments:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (treatmentId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(treatmentId)) {
      newExpanded.delete(treatmentId);
    } else {
      newExpanded.add(treatmentId);
    }
    setExpandedItems(newExpanded);
  };

  const handleFileUpload = async (treatmentId, event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setUploadingFiles(prev => ({ ...prev, [treatmentId]: true }));
      await treatmentService.addAttachment(treatmentId, file);
      await loadTreatments();
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setUploadingFiles(prev => ({ ...prev, [treatmentId]: false }));
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = async (treatmentId, attachmentId) => {
    if (!window.confirm('Are you sure you want to remove this attachment?')) return;

    try {
      await treatmentService.removeAttachment(treatmentId, attachmentId);
      await loadTreatments();
      toast.success('Attachment removed successfully');
    } catch (err) {
      toast.error('Failed to remove attachment');
      console.error('Remove attachment error:', err);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadTreatments} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            icon="ArrowLeft"
            onClick={onBack}
            className="mb-4"
          >
            Back to Patients
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Treatment History</h1>
          <p className="text-gray-600 mt-1">Patient: {patientName}</p>
        </div>
      </div>

      {treatments.length === 0 ? (
        <Empty 
          title="No Treatment History"
          description="No treatment records found for this patient."
        />
      ) : (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Timeline ({treatments.length} treatments)
          </h2>
          
          <div className="space-y-6">
            {treatments.map((treatment, index) => {
              const isExpanded = expandedItems.has(treatment.Id);
              const isLast = index === treatments.length - 1;
              
              return (
                <div key={treatment.Id} className="relative">
                  {/* Timeline Line */}
                  {!isLast && (
                    <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-200"></div>
                  )}
                  
                  {/* Timeline Item */}
                  <div className="flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className="flex-shrink-0 w-8 h-8 bg-medical-600 rounded-full flex items-center justify-center mt-1">
                      <ApperIcon name="Stethoscope" className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        {/* Header */}
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleExpanded(treatment.Id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-medium text-gray-900">
                                {treatment.diagnosis}
                              </h3>
                              <Badge variant={getStatusBadgeVariant(treatment.status)}>
                                {treatment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {format(new Date(treatment.date), 'PPP p')}
                            </p>
                          </div>
                          <ApperIcon 
                            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                            className="w-5 h-5 text-gray-400" 
                          />
                        </div>
                        
                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                            {/* Symptoms */}
                            {treatment.symptoms && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Symptoms</h4>
                                <p className="text-sm text-gray-700">{treatment.symptoms}</p>
                              </div>
                            )}
                            
                            {/* Treatment */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">Treatment</h4>
                              <p className="text-sm text-gray-700">{treatment.treatment}</p>
                            </div>
                            
                            {/* Prescriptions */}
                            {treatment.prescriptions && treatment.prescriptions.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Prescriptions</h4>
                                <div className="space-y-2">
                                  {treatment.prescriptions.map((prescription, idx) => (
                                    <div key={idx} className="bg-white rounded p-3 border border-gray-200">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900">{prescription.medication}</p>
                                          <p className="text-sm text-gray-600">
                                            {prescription.dosage} • {prescription.duration}
                                          </p>
                                          {prescription.instructions && (
                                            <p className="text-sm text-gray-500 mt-1">
                                              {prescription.instructions}
                                            </p>
                                          )}
                                        </div>
                                        <ApperIcon name="Pill" className="w-4 h-4 text-medical-600 mt-1" />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Notes */}
                            {treatment.notes && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Notes</h4>
                                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                                  {treatment.notes}
                                </p>
                              </div>
                            )}
                            
                            {/* Follow-up */}
                            {treatment.followUpDate && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">Follow-up</h4>
                                <p className="text-sm text-gray-700">
                                  {format(new Date(treatment.followUpDate), 'PPP p')}
                                </p>
                              </div>
                            )}
                            
                            {/* Attachments */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900">Attachments</h4>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="file"
                                    id={`file-upload-${treatment.Id}`}
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(treatment.Id, e)}
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    icon="Upload"
                                    loading={uploadingFiles[treatment.Id]}
                                    onClick={() => document.getElementById(`file-upload-${treatment.Id}`).click()}
                                  >
                                    Upload File
                                  </Button>
                                </div>
                              </div>
                              
                              {treatment.attachments && treatment.attachments.length > 0 ? (
                                <div className="space-y-2">
                                  {treatment.attachments.map((attachment) => (
                                    <div key={attachment.id} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                      <div className="flex items-center space-x-3">
                                        <ApperIcon 
                                          name={attachment.type.includes('pdf') ? 'FileText' : 
                                                attachment.type.includes('image') ? 'Image' : 'File'} 
                                          className="w-4 h-4 text-gray-500" 
                                        />
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {attachment.size} • {format(new Date(attachment.uploadDate), 'MMM d, yyyy')}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        icon="Trash2"
                                        onClick={() => handleRemoveAttachment(treatment.Id, attachment.id)}
                                        className="text-red-600 hover:text-red-700"
                                      />
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No attachments</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentTimeline;