import React from 'react';
import Calendar from '../components/Calendar';

const CalendarPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-6 py-8">
        <Calendar />
      </div>
    </div>
  );
};

export default CalendarPage;
