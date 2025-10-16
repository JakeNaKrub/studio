import type { Reservation } from './types';

// In-memory 'database' for demonstration purposes.
// In a real application, this would be replaced with a connection to Firestore or another database.
const reservations: Reservation[] = [
    {
        id: '1',
        meetingName: 'Weekly Sync',
        personName: 'Alice',
        mobileNumber: '123-456-7890',
        date: new Date().toISOString(),
        startTime: '10:00',
        endTime: '11:00',
        roomSize: 'small',
        pin: '1234'
    },
    {
        id: '2',
        meetingName: 'Project Brainstorm',
        personName: 'Bob',
        mobileNumber: '234-567-8901',
        date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
        startTime: '14:00',
        endTime: '15:30',
        roomSize: 'large',
        pin: '5678'
    }
];

export const db = {
  reservations,
};
