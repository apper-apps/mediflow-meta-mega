import billsData from "@/services/mockData/bills.json";

class BillService {
  constructor() {
    this.bills = [...billsData];
  }

  async getAll() {
    await this.delay(300);
    return [...this.bills];
  }

  async getById(id) {
    await this.delay(200);
    const bill = this.bills.find(b => b.Id === parseInt(id));
    if (!bill) {
      throw new Error("Bill not found");
    }
    return { ...bill };
  }

  async create(billData) {
    await this.delay(500);
    const newBill = {
      ...billData,
      Id: Math.max(...this.bills.map(b => b.Id)) + 1,
      patientId: parseInt(billData.patientId),
      appointmentId: billData.appointmentId ? parseInt(billData.appointmentId) : null
    };
    this.bills.push(newBill);
    return { ...newBill };
  }

  async update(id, billData) {
    await this.delay(400);
    const index = this.bills.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Bill not found");
    }
    this.bills[index] = { 
      ...this.bills[index], 
      ...billData,
      patientId: parseInt(billData.patientId),
      appointmentId: billData.appointmentId ? parseInt(billData.appointmentId) : null
    };
    return { ...this.bills[index] };
  }

  async delete(id) {
    await this.delay(300);
    const index = this.bills.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Bill not found");
    }
    this.bills.splice(index, 1);
    return true;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const billService = new BillService();