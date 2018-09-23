import firebase from 'firebase';
import _ from 'lodash';
import { AsyncStorage } from 'react-native';

import {
  UPDATE_API_KEY,
  UPDATE_API_SECRET,
  UPDATE_EXCHANGE,
  UPDATE_ORDER_HISTORY,
  BITCOIN_PRICE_UPDATE,
  UPDATE_PORTFOLIO,
  UPDATE_RETRIEVE_PORTFOLIO,
  UPDATE_COIN_LIST,
  UPDATE_FIAT,
  FETCH_NOTIFICATIONS_SUCCESS
} from './types';

export const updateApiKey = (key, exchange) => {
  try {
    AsyncStorage.setItem('@' + exchange + 'Api:key', key);
  } catch (error) {
    console.log(error);
  }
  return {
    type: UPDATE_API_KEY,
    payload: key
  };
};

export const updateApiSecret = (secret, exchange) => {
  try {
    AsyncStorage.setItem('@' + exchange + 'Api:secret', secret);
  } catch (error) {
    console.log(error);
  }
  return {
    type: UPDATE_API_SECRET,
    payload: secret
  };
};

export const updateBitcoinPrice = (price) => {
  return {
    type: BITCOIN_PRICE_UPDATE,
    payload: price
  };
};

export const updateCoinList = (coinList) => {
  return {
    type: UPDATE_COIN_LIST,
    payload: coinList
  };
};

export const updateExchange = (exchange) => {
  return {
    type: UPDATE_EXCHANGE,
    payload: exchange
  };
};

export const updateOrderHistory = (bool) => {
  return {
    type: UPDATE_ORDER_HISTORY,
    payload: bool
  };
};

export const updatePorfolio = (balanceList, exchange) => {
  if (exchange === 'BitTrex') {
    balanceList.sort((a, b) => {
      return b.Balance - a.Balance;
    });
    return {
      type: UPDATE_PORTFOLIO,
      payload: balanceList
    };
  } else if (exchange === 'Binance') {
    balanceList.sort((a, b) => {
      return b.free - a.free;
    });
    const finalList = [];
    for (let i = 0; i < balanceList.length; i++) {
      if (balanceList[i].free > 0) {
        finalList.push(balanceList[i]);
      }
    }
    return {
      type: UPDATE_PORTFOLIO,
      payload: finalList
    };
  }
};

export const updateRetrievePortfolio = (bool) => {
  if (bool) {
    return {
      type: UPDATE_RETRIEVE_PORTFOLIO,
      payload: false
    };
  }
  return {
    type: UPDATE_RETRIEVE_PORTFOLIO,
    payload: true
  };
};

export const updateFiat = (fiat) => {
  return {
    type: UPDATE_FIAT,
    payload: fiat
  };
};

export const fetchNotifications = () => {
  return (dispatch) => {
    firebase.database().ref('/notifications')
      .on('value', (snapshot) => {
        const obj = snapshot.val();
        const arr = _.map(obj);
        arr.sort((a, b) => {
          return b.time - a.time;
        });
        dispatch({ type: FETCH_NOTIFICATIONS_SUCCESS, payload: arr });
      });
  };
};
