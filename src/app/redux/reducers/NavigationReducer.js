import { navigationsUser } from 'app/navigations/navigationsUser';
import { navigationsAdmin } from 'app/navigations/navigationsAdmin';
import { navigationsWorker } from 'app/navigations/navigationsWorker';
import { SET_USER_NAVIGATION } from '../actions/NavigationAction';

const userRole = localStorage.getItem('userRole');
const initialState =
  userRole === 'WORKER'
    ? [...navigationsWorker]
    : userRole === 'ADMIN'
    ? [...navigationsAdmin]
    : [...navigationsUser]; // Dla innych ról, np. WORKER

const NavigationReducer = function (state = initialState, action) {
  switch (action.type) {
    case SET_USER_NAVIGATION: {
      return [...action.payload];
    }
    default: {
      return [...state];
    }
  }
};

export default NavigationReducer;
