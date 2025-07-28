import appointmentsData from "@/services/mockData/appointments.json";

class AppointmentService {
  constructor() {
    this.appointments = [...appointmentsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.appointments];
  }

  async getById(id) {
    await this.delay(200);
    const appointment = this.appointments.find(a => a.Id === parseInt(id));
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    return { ...appointment };
  }

  async create(appointmentData) {
    await this.delay(500);
    const newAppointment = {
      ...appointmentData,
      Id: Math.max(...this.appointments.map(a => a.Id)) + 1,
      patientId: parseInt(appointmentData.patientId),
      doctorId: parseInt(appointmentData.doctorId)
    };
    this.appointments.push(newAppointment);
    return { ...newAppointment };
  }

  async update(id, appointmentData) {
    await this.delay(400);
    const index = this.appointments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Appointment not found");
    }
    this.appointments[index] = { 
      ...this.appointments[index], 
      ...appointmentData,
      patientId: parseInt(appointmentData.patientId),
      doctorId: parseInt(appointmentData.doctorId)
    };
    return { ...this.appointments[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.appointments.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Appointment not found");
    }
    this.appointments.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const appointmentService = new AppointmentService();