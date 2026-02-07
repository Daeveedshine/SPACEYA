import { FormTemplate } from '../types';

export const DEFAULT_TEMPLATE: FormTemplate = {
  id: 'default',
  agentId: 'default',
  title: 'Standard Application Form',
  description: 'This is a standard application form for all tenants.',
  steps: [
    {
      title: 'Personal Information',
      fields: [
        { id: 'firstName', label: 'First Name', type: 'text', required: true },
        { id: 'surname', label: 'Surname', type: 'text', required: true },
        { id: 'dob', label: 'Date of Birth', type: 'date', required: true },
      ],
    },
  ],
};
