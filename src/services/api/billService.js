class BillService {
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
          { field: { Name: "appointmentId" } },
          { field: { Name: "items" } },
          { field: { Name: "totalAmount" } },
          { field: { Name: "paidAmount" } },
          { field: { Name: "status" } },
          { field: { Name: "date" } },
          { field: { Name: "Tags" } }
        ],
        orderBy: [
          { fieldName: "date", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching bills:", error?.response?.data?.message);
      } else {
        console.error("Error fetching bills:", error.message);
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
          { field: { Name: "appointmentId" } },
          { field: { Name: "items" } },
          { field: { Name: "totalAmount" } },
          { field: { Name: "paidAmount" } },
          { field: { Name: "status" } },
          { field: { Name: "date" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await this.apperClient.getRecordById('bill', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching bill with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching bill with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(billData) {
    try {
      // Only include Updateable fields and ensure lookup fields are integers
      const params = {
        records: [{
          Name: billData.Name || `Bill - ${new Date().toLocaleDateString()}`,
          patientId: parseInt(billData.patientId),
          appointmentId: billData.appointmentId ? parseInt(billData.appointmentId) : null,
          items: typeof billData.items === 'string' ? billData.items : JSON.stringify(billData.items || []),
          totalAmount: parseFloat(billData.totalAmount) || 0,
          paidAmount: parseFloat(billData.paidAmount) || 0,
          status: billData.status || 'pending',
          date: billData.date || new Date().toISOString(),
          Tags: billData.Tags || ''
        }]
      };

      const response = await this.apperClient.createRecord('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create bills ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
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
        console.error("Error creating bill:", error?.response?.data?.message);
      } else {
        console.error("Error creating bill:", error.message);
      }
      throw error;
    }
  }

  async update(id, billData) {
    try {
      // Only include Updateable fields and ensure lookup fields are integers
      const params = {
        records: [{
          Id: parseInt(id),
          Name: billData.Name || `Bill - ${new Date().toLocaleDateString()}`,
          patientId: parseInt(billData.patientId),
          appointmentId: billData.appointmentId ? parseInt(billData.appointmentId) : null,
          items: typeof billData.items === 'string' ? billData.items : JSON.stringify(billData.items || []),
          totalAmount: parseFloat(billData.totalAmount) || 0,
          paidAmount: parseFloat(billData.paidAmount) || 0,
          status: billData.status,
          date: billData.date || new Date().toISOString(),
          Tags: billData.Tags || ''
        }]
      };

      const response = await this.apperClient.updateRecord('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update bills ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
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
        console.error("Error updating bill:", error?.response?.data?.message);
      } else {
        console.error("Error updating bill:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('bill', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete bills ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting bill:", error?.response?.data?.message);
      } else {
        console.error("Error deleting bill:", error.message);
      }
      throw error;
    }
  }
}

export const billService = new BillService();