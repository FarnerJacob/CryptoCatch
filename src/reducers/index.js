import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import CryptoReducer from './CryptoReducer';

export default combineReducers({
  auth: AuthReducer,
  crypto: CryptoReducer
});
