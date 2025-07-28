class PatientService {
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
          { field: { Name: "dateOfBirth" } },
          { field: { Name: "contact" } },
          { field: { Name: "email" } },
          { field: { Name: "emergencyContact" } },
          { field: { Name: "bloodGroup" } },
          { field: { Name: "allergies" } },
          { field: { Name: "registrationDate" } },
          { field: { Name: "Tags" } }
        ],
        orderBy: [
          { fieldName: "registrationDate", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('patient', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching patients:", error?.response?.data?.message);
      } else {
        console.error("Error fetching patients:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "dateOfBirth" } },
          { field: { Name: "contact" } },
          { field: { Name: "email" } },
          { field: { Name: "emergencyContact" } },
          { field: { Name: "bloodGroup" } },
          { field: { Name: "allergies" } },
          { field: { Name: "registrationDate" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await this.apperClient.getRecordById('patient', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching patient with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching patient with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(patientData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: patientData.Name || patientData.name,
          dateOfBirth: patientData.dateOfBirth,
          contact: patientData.contact,
          email: patientData.email,
          emergencyContact: patientData.emergencyContact,
          bloodGroup: patientData.bloodGroup,
          allergies: patientData.allergies,
          registrationDate: new Date().toISOString(),
          Tags: patientData.Tags || ''
        }]
      };

      const response = await this.apperClient.createRecord('patient', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create patients ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating patient:", error?.response?.data?.message);
      } else {
        console.error("Error creating patient:", error.message);
      }
      throw error;
    }
  }

  async update(id, patientData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: patientData.Name || patientData.name,
          dateOfBirth: patientData.dateOfBirth,
          contact: patientData.contact,
          email: patientData.email,
          emergencyContact: patientData.emergencyContact,
          bloodGroup: patientData.bloodGroup,
          allergies: patientData.allergies,
          Tags: patientData.Tags || ''
        }]
      };

      const response = await this.apperClient.updateRecord('patient', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update patients ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating patient:", error?.response?.data?.message);
      } else {
        console.error("Error updating patient:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('patient', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete patients ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting patient:", error?.response?.data?.message);
      } else {
        console.error("Error deleting patient:", error.message);
      }
      throw error;
    }
  }

  async getTreatmentHistory(patientId) {
    // This will use the treatment service to get patient treatments
    const { treatmentService } = await import('./treatmentService');
    return await treatmentService.getByPatientId(patientId);
  }

  async updateNotificationPreferences(patientId, preferences) {
    // For now, this would be handled through the general update method
    // In the future, this could be extended with specific notification fields
    return await this.update(patientId, {
      // Add notification preference fields when they exist in the schema
      Tags: preferences.methods?.join(',') || ''
    });
  }
}

export const patientService = new PatientService();