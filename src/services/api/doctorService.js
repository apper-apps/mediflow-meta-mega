class DoctorService {
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
          { field: { Name: "specialization" } },
          { field: { Name: "contact" } },
          { field: { Name: "email" } },
          { field: { Name: "isAvailable" } },
          { field: { Name: "workingHours" } },
          { field: { Name: "Tags" } }
        ],
        orderBy: [
          { fieldName: "Name", sorttype: "ASC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('doctor', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching doctors:", error?.response?.data?.message);
      } else {
        console.error("Error fetching doctors:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "specialization" } },
          { field: { Name: "contact" } },
          { field: { Name: "email" } },
          { field: { Name: "isAvailable" } },
          { field: { Name: "workingHours" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await this.apperClient.getRecordById('doctor', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching doctor with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching doctor with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(doctorData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: doctorData.Name || doctorData.name,
          specialization: doctorData.specialization,
          contact: doctorData.contact,
          email: doctorData.email,
          isAvailable: doctorData.isAvailable !== undefined ? doctorData.isAvailable : true,
          workingHours: doctorData.workingHours || '',
          Tags: doctorData.Tags || ''
        }]
      };

      const response = await this.apperClient.createRecord('doctor', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create doctors ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating doctor:", error?.response?.data?.message);
      } else {
        console.error("Error creating doctor:", error.message);
      }
      throw error;
    }
  }

  async update(id, doctorData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: doctorData.Name || doctorData.name,
          specialization: doctorData.specialization,
          contact: doctorData.contact,
          email: doctorData.email,
          isAvailable: doctorData.isAvailable,
          workingHours: doctorData.workingHours || '',
          Tags: doctorData.Tags || ''
        }]
      };

      const response = await this.apperClient.updateRecord('doctor', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update doctors ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating doctor:", error?.response?.data?.message);
      } else {
        console.error("Error updating doctor:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('doctor', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete doctors ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting doctor:", error?.response?.data?.message);
      } else {
        console.error("Error deleting doctor:", error.message);
      }
      throw error;
    }
  }
}

export const doctorService = new DoctorService();