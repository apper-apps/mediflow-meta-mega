class TreatmentService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patientId" } },
          { field: { Name: "date" } },
          { field: { Name: "diagnosis" } },
          { field: { Name: "symptoms" } },
          { field: { Name: "treatment" } },
          { field: { Name: "prescriptions" } },
          { field: { Name: "notes" } },
          { field: { Name: "doctorId" } },
          { field: { Name: "attachments" } },
          { field: { Name: "followUpDate" } },
          { field: { Name: "status" } },
          { field: { Name: "Tags" } }
        ],
        orderBy: [
          { fieldName: "date", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('treatment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching treatments:", error?.response?.data?.message);
      } else {
        console.error("Error fetching treatments:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patientId" } },
          { field: { Name: "date" } },
          { field: { Name: "diagnosis" } },
          { field: { Name: "symptoms" } },
          { field: { Name: "treatment" } },
          { field: { Name: "prescriptions" } },
          { field: { Name: "notes" } },
          { field: { Name: "doctorId" } },
          { field: { Name: "attachments" } },
          { field: { Name: "followUpDate" } },
          { field: { Name: "status" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await this.apperClient.getRecordById('treatment', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching treatment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching treatment with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async getByPatientId(patientId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "patientId" } },
          { field: { Name: "date" } },
          { field: { Name: "diagnosis" } },
          { field: { Name: "symptoms" } },
          { field: { Name: "treatment" } },
          { field: { Name: "prescriptions" } },
          { field: { Name: "notes" } },
          { field: { Name: "doctorId" } },
          { field: { Name: "attachments" } },
          { field: { Name: "followUpDate" } },
          { field: { Name: "status" } },
          { field: { Name: "Tags" } }
        ],
        where: [
          {
            FieldName: "patientId",
            Operator: "EqualTo",
            Values: [parseInt(patientId)]
          }
        ],
        orderBy: [
          { fieldName: "date", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('treatment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching treatments by patient:", error?.response?.data?.message);
      } else {
        console.error("Error fetching treatments by patient:", error.message);
      }
      throw error;
    }
  }

  async create(treatmentData) {
    try {
      // Only include Updateable fields and ensure lookup fields are integers
      const params = {
        records: [{
          Name: treatmentData.Name || `Treatment - ${treatmentData.diagnosis}`,
          patientId: parseInt(treatmentData.patientId),
          date: treatmentData.date || new Date().toISOString(),
          diagnosis: treatmentData.diagnosis,
          symptoms: treatmentData.symptoms || '',
          treatment: treatmentData.treatment || '',
          prescriptions: typeof treatmentData.prescriptions === 'string' ? treatmentData.prescriptions : JSON.stringify(treatmentData.prescriptions || []),
          notes: treatmentData.notes || '',
          doctorId: parseInt(treatmentData.doctorId),
          attachments: typeof treatmentData.attachments === 'string' ? treatmentData.attachments : JSON.stringify(treatmentData.attachments || []),
          followUpDate: treatmentData.followUpDate || null,
          status: treatmentData.status || 'ongoing',
          Tags: treatmentData.Tags || ''
        }]
      };

      const response = await this.apperClient.createRecord('treatment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create treatments ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulRecords[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating treatment:", error?.response?.data?.message);
      } else {
        console.error("Error creating treatment:", error.message);
      }
      throw error;
    }
  }

  async update(id, treatmentData) {
    try {
      // Only include Updateable fields and ensure lookup fields are integers
      const params = {
        records: [{
          Id: parseInt(id),
          Name: treatmentData.Name || `Treatment - ${treatmentData.diagnosis}`,
          patientId: parseInt(treatmentData.patientId),
          date: treatmentData.date,
          diagnosis: treatmentData.diagnosis,
          symptoms: treatmentData.symptoms || '',
          treatment: treatmentData.treatment || '',
          prescriptions: typeof treatmentData.prescriptions === 'string' ? treatmentData.prescriptions : JSON.stringify(treatmentData.prescriptions || []),
          notes: treatmentData.notes || '',
          doctorId: parseInt(treatmentData.doctorId),
          attachments: typeof treatmentData.attachments === 'string' ? treatmentData.attachments : JSON.stringify(treatmentData.attachments || []),
          followUpDate: treatmentData.followUpDate || null,
          status: treatmentData.status,
          Tags: treatmentData.Tags || ''
        }]
      };

      const response = await this.apperClient.updateRecord('treatment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update treatments ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulUpdates[0]?.data;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating treatment:", error?.response?.data?.message);
      } else {
        console.error("Error updating treatment:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('treatment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete treatments ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting treatment:", error?.response?.data?.message);
      } else {
        console.error("Error deleting treatment:", error.message);
      }
      throw error;
    }
  }

  // Attachment handling - these will work with the attachments field as JSON
  async addAttachment(treatmentId, file) {
    try {
      // Get current treatment
      const treatment = await this.getById(treatmentId);
      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Parse existing attachments
      let attachments = [];
      try {
        attachments = typeof treatment.attachments === 'string' ? 
          JSON.parse(treatment.attachments) : 
          (treatment.attachments || []);
      } catch (e) {
        attachments = [];
      }

      // Create new attachment
      const attachment = {
        id: Date.now(),
        name: file.name,
        type: file.type,
        size: this.formatFileSize(file.size),
        uploadDate: new Date().toISOString()
      };

      // Add to attachments array
      attachments.push(attachment);

      // Update treatment with new attachments
      await this.update(treatmentId, {
        ...treatment,
        attachments: JSON.stringify(attachments)
      });
      
      return attachment;
    } catch (error) {
      console.error("Error adding attachment:", error.message);
      throw error;
    }
  }

  async removeAttachment(treatmentId, attachmentId) {
    try {
      // Get current treatment
      const treatment = await this.getById(treatmentId);
      if (!treatment) {
        throw new Error('Treatment not found');
      }

      // Parse existing attachments
      let attachments = [];
      try {
        attachments = typeof treatment.attachments === 'string' ? 
          JSON.parse(treatment.attachments) : 
          (treatment.attachments || []);
      } catch (e) {
        attachments = [];
      }

      // Find and remove attachment
      const index = attachments.findIndex(a => a.id === parseInt(attachmentId));
      if (index === -1) {
        throw new Error('Attachment not found');
      }

      const removed = attachments.splice(index, 1)[0];

      // Update treatment with modified attachments
      await this.update(treatmentId, {
        ...treatment,
        attachments: JSON.stringify(attachments)
      });
      
      return removed;
    } catch (error) {
      console.error("Error removing attachment:", error.message);
      throw error;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}

export const treatmentService = new TreatmentService();