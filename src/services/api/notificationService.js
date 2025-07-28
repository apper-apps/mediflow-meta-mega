class NotificationService {
  constructor() {
    this.reminderTemplates = {
      patient: {
        email: {
          subject: "Appointment Reminder - {doctorName}",
          body: `Dear {patientName},

This is a reminder that you have an appointment scheduled with {doctorName} on {date} at {time}.

Appointment Details:
- Doctor: {doctorName}
- Date: {date}
- Time: {time}  
- Reason: {reason}
- Location: MediFlow Pro Clinic

Please arrive 15 minutes early for check-in.

If you need to reschedule or cancel, please contact us as soon as possible.

Best regards,
MediFlow Pro Team`
        },
        sms: "Reminder: Appointment with {doctorName} on {date} at {time}. Reason: {reason}. Please arrive 15 mins early. MediFlow Pro"
      },
      doctor: {
        email: {
          subject: "Patient Appointment Reminder - {patientName}",
          body: `Dear Dr. {doctorName},

You have an upcoming appointment with {patientName} on {date} at {time}.

Patient Details:
- Name: {patientName}
- Date: {date}
- Time: {time}
- Reason: {reason}
- Contact: {patientPhone}

Please review the patient's medical history if needed.

Best regards,
MediFlow Pro System`
        },
        sms: "Appointment reminder: {patientName} on {date} at {time}. Reason: {reason}. MediFlow Pro"
      }
    };
    
    this.reminderTimeOptions = [
      { value: '24h', label: '24 hours before', hours: 24 },
      { value: '12h', label: '12 hours before', hours: 12 },
      { value: '6h', label: '6 hours before', hours: 6 },
      { value: '2h', label: '2 hours before', hours: 2 },
      { value: '1h', label: '1 hour before', hours: 1 },
      { value: '30m', label: '30 minutes before', hours: 0.5 }
    ];
    
    this.scheduledReminders = new Map();
  }

  async scheduleReminders(appointment) {
    try {
      const { patientService } = await import('./patientService');
      const { doctorService } = await import('./doctorService');
      
      const [patient, doctor] = await Promise.all([
        patientService.getById(appointment.patientId),
        doctorService.getById(appointment.doctorId)
      ]);

      const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
      const reminderId = `appointment_${appointment.Id}`;
      
      // Schedule patient reminders
      if (appointment.reminderSettings?.patientReminders) {
        for (const reminderTime of appointment.reminderSettings.patientReminders) {
          const timeOption = this.reminderTimeOptions.find(opt => opt.value === reminderTime);
          if (timeOption) {
            const reminderDateTime = new Date(appointmentDateTime.getTime() - (timeOption.hours * 60 * 60 * 1000));
            
            if (reminderDateTime > new Date()) {
              this.scheduleNotification(
                `${reminderId}_patient_${reminderTime}`,
                reminderDateTime,
                'patient',
                appointment,
                patient,
                doctor,
                appointment.reminderSettings.notificationMethods || ['email']
              );
            }
          }
        }
      }

      // Schedule doctor reminders  
      if (appointment.reminderSettings?.doctorReminders) {
        for (const reminderTime of appointment.reminderSettings.doctorReminders) {
          const timeOption = this.reminderTimeOptions.find(opt => opt.value === reminderTime);
          if (timeOption) {
            const reminderDateTime = new Date(appointmentDateTime.getTime() - (timeOption.hours * 60 * 60 * 1000));
            
            if (reminderDateTime > new Date()) {
              this.scheduleNotification(
                `${reminderId}_doctor_${reminderTime}`,
                reminderDateTime,
                'doctor', 
                appointment,
                patient,
                doctor,
                ['email'] // Doctors typically prefer email
              );
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
      return false;
    }
  }

  scheduleNotification(id, dateTime, recipientType, appointment, patient, doctor, methods) {
    const delay = dateTime.getTime() - new Date().getTime();
    
    if (delay > 0) {
      const timeoutId = setTimeout(() => {
        this.sendNotification(recipientType, appointment, patient, doctor, methods);
        this.scheduledReminders.delete(id);
      }, delay);
      
      this.scheduledReminders.set(id, timeoutId);
    }
  }

  async sendNotification(recipientType, appointment, patient, doctor, methods) {
    try {
      const template = this.reminderTemplates[recipientType];
      const recipient = recipientType === 'patient' ? patient : doctor;
      
      const variables = {
        patientName: patient.name,
        doctorName: doctor.name,
        date: new Date(appointment.date).toLocaleDateString(),
        time: appointment.time,
        reason: appointment.reason,
        patientPhone: patient.phone || 'N/A'
      };

      for (const method of methods) {
        if (method === 'email' && recipient.email) {
          await this.sendEmail(
            recipient.email,
            this.replaceVariables(template.email.subject, variables),
            this.replaceVariables(template.email.body, variables)
          );
        } else if (method === 'sms' && recipient.phone) {
          await this.sendSMS(
            recipient.phone,
            this.replaceVariables(template.sms, variables)
          );
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  async sendEmail(to, subject, body) {
    // In a real implementation, this would integrate with an email service
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }

  async sendSMS(to, message) {
    // In a real implementation, this would integrate with an SMS service  
    console.log('Sending SMS to:', to);
    console.log('Message:', message);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  }

  replaceVariables(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  async cancelReminders(appointment) {
    const reminderId = `appointment_${appointment.Id}`;
    
    // Cancel all scheduled reminders for this appointment
    for (const [id, timeoutId] of this.scheduledReminders.entries()) {
      if (id.startsWith(reminderId)) {
        clearTimeout(timeoutId);
        this.scheduledReminders.delete(id);
      }
    }
    
    return true;
  }

  getReminderTimeOptions() {
    return [...this.reminderTimeOptions];
  }

  async updateTemplate(recipientType, method, template) {
    if (this.reminderTemplates[recipientType] && this.reminderTemplates[recipientType][method]) {
      this.reminderTemplates[recipientType][method] = template;
      return true;
    }
    return false;
  }

  getTemplate(recipientType, method) {
    return this.reminderTemplates[recipientType]?.[method] || null;
  }

  async testNotification(recipientType, method, recipient, variables) {
    const template = this.reminderTemplates[recipientType]?.[method];
    if (!template) {
      throw new Error('Template not found');
    }

    if (method === 'email') {
      await this.sendEmail(
        recipient,
        this.replaceVariables(template.subject, variables),
        this.replaceVariables(template.body, variables)
      );
    } else if (method === 'sms') {
      await this.sendSMS(
        recipient,
        this.replaceVariables(template, variables)
      );
    }

    return true;
  }
}

export const notificationService = new NotificationService();