export const navigationsWorker = [
  { name: 'Panel główny', path: '/dashboard', icon: 'dashboard' },
  { label: 'Zarządzanie zleceniami', type: 'label' },
  { name: 'Utwórz nowe zlecenie', icon: 'add_box', path: '/repairOrder' },
  { name: 'Wszystkie zlecenia', icon: 'build_circle', path: '/workerRepairOrders' },
  { label: 'Zarządzanie rezerwacjami', type: 'label' },
  { name: 'Utwórz rezerwację', path: '/servicesReservations', icon: 'event_available' },
  { name: 'Wszystkie rezerwacje', icon: 'view_list', path: '/workerServicesReservations' },
  { name: 'Kalendarz rezerwacji', icon: 'event', path: '/workerEventsCalendar' },
  { label: 'System decyzyjny', type: 'label' },
  { name: 'Reguły', icon: 'handyman', path: '/workerShowRules' },
  { name: 'Dodawanie reguł', icon: 'add_box', path: '/workerAddRule' },
];
