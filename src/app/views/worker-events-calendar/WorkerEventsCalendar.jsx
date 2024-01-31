import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  DayView,
  WeekView,
  Appointments,
  Toolbar,
  ViewSwitcher,
} from '@devexpress/dx-react-scheduler-material-ui';
import { collection, getDocs } from 'firebase/firestore';
import { db } from 'firebase';

export default function Demo() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, 'services-reservations'));
      const events = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const title = data.serviceType;
        //zamiana daty złożenia rezerwacji na obiekt date
        const startDate = new Date(data.date.seconds * 1000);
        const hour = parseInt(data.time, 10);
        startDate.setHours(hour, 0, 0, 0);
        //dodanie dwóch godzin
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
        return { title, startDate, endDate };
      });
      setReservations(events);
    };

    fetchEvents();
  }, []);

  return (
    <Paper>
      <Scheduler data={reservations} height={660} locale="pl-PL">
        <ViewState defaultCurrentDate={new Date()} defaultCurrentViewName="Day" />
        <DayView startDayHour={9} endDayHour={18} displayName="Dzisiaj" />
        {/* wykluczenie niedzieli */}
        <WeekView startDayHour={10} endDayHour={19} displayName="Cały tydzień" excludedDays={[0]} />
        <Toolbar />
        <ViewSwitcher />
        <Appointments />
      </Scheduler>
    </Paper>
  );
}
