import treatmentsData from '@/services/mockData/treatments.json';

let treatments = [...treatmentsData];
let nextId = Math.max(...treatments.map(t => t.Id)) + 1;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class TreatmentService {
  async getAll() {
    await delay(500);
    return [...treatments];
  }

  async getById(id) {
    await delay(300);
    const treatment = treatments.find(t => t.Id === parseInt(id));
    if (!treatment) {
      throw new Error('Treatment not found');
    }
    return { ...treatment };
  }

  async getByPatientId(patientId) {
    await delay(400);
    return treatments
      .filter(t => t.patientId === parseInt(patientId))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(t => ({ ...t }));
  }

  async create(treatmentData) {
    await delay(600);
    const newTreatment = {
      ...treatmentData,
      Id: nextId++,
      date: new Date().toISOString(),
      attachments: treatmentData.attachments || [],
      status: treatmentData.status || 'ongoing'
    };
    treatments.push(newTreatment);
    return { ...newTreatment };
  }

  async update(id, treatmentData) {
    await delay(500);
    const index = treatments.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Treatment not found');
    }
    
    treatments[index] = {
      ...treatments[index],
      ...treatmentData,
      Id: parseInt(id)
    };
    return { ...treatments[index] };
  }

  async delete(id) {
    await delay(400);
    const index = treatments.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error('Treatment not found');
    }
    
    const deleted = treatments.splice(index, 1)[0];
    return { ...deleted };
  }

  async addAttachment(treatmentId, file) {
    await delay(800);
    const treatment = treatments.find(t => t.Id === parseInt(treatmentId));
    if (!treatment) {
      throw new Error('Treatment not found');
    }

    const attachment = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: this.formatFileSize(file.size),
      uploadDate: new Date().toISOString()
    };

    treatment.attachments = treatment.attachments || [];
    treatment.attachments.push(attachment);
    
    return { ...attachment };
  }

  async removeAttachment(treatmentId, attachmentId) {
    await delay(300);
    const treatment = treatments.find(t => t.Id === parseInt(treatmentId));
    if (!treatment) {
      throw new Error('Treatment not found');
    }

    const index = treatment.attachments.findIndex(a => a.id === parseInt(attachmentId));
    if (index === -1) {
      throw new Error('Attachment not found');
    }

    const removed = treatment.attachments.splice(index, 1)[0];
    return { ...removed };
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