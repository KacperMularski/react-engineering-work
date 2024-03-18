import { navigationsUser } from 'app/navigations/navigationsUser';
import { navigationsAdmin } from 'app/navigations/navigationsAdmin';
import { navigationsWorker } from 'app/navigations/navigationsWorker';
import { SET_USER_NAVIGATION } from '../actions/NavigationAction';

//ładowanie roli z sesji przeglądarki
const userRole = localStorage.getItem('userRole');
const initialState =
  userRole === 'WORKER'
    ? [...navigationsWorker]
    : userRole === 'ADMIN'
    ? [...navigationsAdmin]
    : [...navigationsUser];

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
