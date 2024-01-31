export const navigationsAdmin = [
  { name: 'Panel główny', path: '/dashboard', icon: 'dashboard' },
  { label: 'Zarządzanie zleceniami', type: 'label' },
  { name: 'Wszystkie zlecenia', icon: 'build_circle', path: '/workerRepairOrders' },
  { label: 'Zarządzanie rezerwacjami', type: 'label' },
  { name: 'Wszystkie rezerwacje', icon: 'view_list', path: '/workerServicesReservations' },
  { name: 'Kalendarz rezerwacji', icon: 'event', path: '/workerEventsCalendar' },
  { label: 'Zarządzanie użytkownkami', type: 'label' },
  { name: 'Użytkownicy', icon: 'supervised_user_circle', path: '/adminUsersConfig' },
  {
    name: 'Dodaj uzytkownika',
    icon: 'person_add_alt',
    path: '/adminUsersConfigAddNewUser',
  },
];
