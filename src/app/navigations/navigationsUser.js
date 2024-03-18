export const navigationsUser = [
  { name: 'Panel główny', path: '/dashboard', icon: 'dashboard' },
  { label: 'Zlecenia napraw', type: 'label' },
  { name: 'Utwórz nowe zlecenie', icon: 'add_box', path: '/repairOrder' },
  {
    name: 'Przegladaj zlecenia',
    icon: 'pageview',
    children: [
      { name: 'Aktywne', path: '/activeRepairOrders', iconText: 'A' },
      { name: 'Ukończone / Anulowane', path: '/nonActiveRepairOrders', iconText: 'B' },
    ],
  },
  { label: 'Rezerwacje', type: 'label' },
  {
    name: 'Rezerwacje usług',
    icon: 'event_available',
    children: [
      { name: 'Dokonaj rezerwacji', path: '/servicesReservations', iconText: 'R' },
      { name: 'Moje rezerwacje', path: '/checkServicesReservations', iconText: 'M' },
    ],
  },
];
