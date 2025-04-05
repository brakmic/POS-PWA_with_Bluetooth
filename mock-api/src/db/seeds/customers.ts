import { Customer } from '../../models';

export const customers: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    phone: '555-123-4567',
    loyaltyPoints: 250,
    lastVisit: '2023-03-15T13:45:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '555-987-6543',
    loyaltyPoints: 480,
    lastVisit: '2023-03-20T09:15:00Z'
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@example.com',
    loyaltyPoints: 120,
    lastVisit: '2023-02-28T11:30:00Z'
  }
];
