class AppointmentService {
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
          { field: { Name: "date" } },
          { field: { Name: "time" } },
          { field: { Name: "status" } },
          { field: { Name: "reason" } },
          { field: { Name: "notes" } },
          { field: { Name: "patientId" } },
          { field: { Name: "doctorId" } },
          { field: { Name: "Tags" } }
        ],
        orderBy: [
          { fieldName: "date", sorttype: "DESC" }
        ]
      };

      const response = await this.apperClient.fetchRecords('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching appointments:", error?.response?.data?.message);
      } else {
        console.error("Error fetching appointments:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date" } },
          { field: { Name: "time" } },
          { field: { Name: "status" } },
          { field: { Name: "reason" } },
          { field: { Name: "notes" } },
          { field: { Name: "patientId" } },
          { field: { Name: "doctorId" } },
          { field: { Name: "Tags" } }
        ]
      };

      const response = await this.apperClient.getRecordById('appointment', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching appointment with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching appointment with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(appointmentData) {
    try {
      // Only include Updateable fields and ensure lookup fields are integers
      const params = {
        records: [{
          Name: appointmentData.Name || `Appointment - ${appointmentData.reason}`,
          date: appointmentData.date,
          time: appointmentData.time,
          status: appointmentData.status || 'pending',
          reason: appointmentData.reason,
          notes: appointmentData.notes || '',
          patientId: parseInt(appointmentData.patientId),
          doctorId: parseInt(appointmentData.doctorId),
          Tags: appointmentData.Tags || ''
        }]
      };

      const response = await this.apperClient.createRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create appointments ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const newAppointment = successfulRecords[0]?.data;
        
        // Schedule reminders if configured (using notification service)
        if (appointmentData.reminderSettings && (
            appointmentData.reminderSettings.patientReminders?.length > 0 || 
            appointmentData.reminderSettings.doctorReminders?.length > 0)) {
          try {
            const { notificationService } = await import('./notificationService');
            await notificationService.scheduleReminders({
              ...newAppointment,
              reminderSettings: appointmentData.reminderSettings
            });
          } catch (notificationError) {
            console.error('Failed to schedule reminders:', notificationError);
            // Don't fail the appointment creation if reminders fail
          }
        }
        
        return newAppointment;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating appointment:", error?.response?.data?.message);
      } else {
        console.error("Error creating appointment:", error.message);
      }
      throw error;
    }
  }

  async update(id, appointmentData) {
    try {
      // Only include Updateable fields and ensure lookup fields are integers
      const params = {
        records: [{
          Id: parseInt(id),
          Name: appointmentData.Name || `Appointment - ${appointmentData.reason}`,
          date: appointmentData.date,
          time: appointmentData.time,
          status: appointmentData.status,
          reason: appointmentData.reason,
          notes: appointmentData.notes || '',
          patientId: parseInt(appointmentData.patientId),
          doctorId: parseInt(appointmentData.doctorId),
          Tags: appointmentData.Tags || ''
        }]
      };

      const response = await this.apperClient.updateRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update appointments ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const updatedAppointment = successfulUpdates[0]?.data;
        
        // Reschedule reminders if settings changed
        if (appointmentData.reminderSettings) {
          try {
            const { notificationService } = await import('./notificationService');
            // Cancel old reminders and schedule new ones
            await notificationService.cancelReminders({ Id: parseInt(id) });
            await notificationService.scheduleReminders({
              ...updatedAppointment,
              reminderSettings: appointmentData.reminderSettings
            });
          } catch (notificationError) {
            console.error('Failed to reschedule reminders:', notificationError);
            // Don't fail the appointment update if reminders fail
          }
        }
        
        return updatedAppointment;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating appointment:", error?.response?.data?.message);
      } else {
        console.error("Error updating appointment:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete appointments ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        // Cancel reminders for deleted appointment
        try {
          const { notificationService } = await import('./notificationService');
          await notificationService.cancelReminders({ Id: parseInt(id) });
        } catch (notificationError) {
          console.error('Failed to cancel reminders for deleted appointment:', notificationError);
          // Don't fail the deletion if reminder cancellation fails
        }
        
        return successfulDeletions.length > 0;
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting appointment:", error?.response?.data?.message);
      } else {
        console.error("Error deleting appointment:", error.message);
      }
      throw error;
    }
  }
}

export const appointmentService = new AppointmentService();