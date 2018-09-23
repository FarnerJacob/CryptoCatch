import {
  BITCOIN_PRICE_UPDATE,
  UPDATE_API_KEY,
  UPDATE_API_SECRET,
  UPDATE_EXCHANGE,
  UPDATE_ORDER_HISTORY,
  UPDATE_PORTFOLIO,
  UPDATE_RETRIEVE_PORTFOLIO,
  UPDATE_COIN_LIST,
  UPDATE_FIAT,
  FETCH_NOTIFICATIONS_SUCCESS
} from '../actions/types';

const INITIAL_STATE = {
  apiKey: 13,
  apiSecret: 2,
  bitcoinPrice: 0,
  exchange: 'BitTrex',
  portfolioHoldings: [],
  refreshOrderHistory: false,
  retrievePortfolio: true,
  cancelModal: { show: false, orderId: null },
  notifications: [],
  coinList: [],
  fiat: 'USD',
  fiatSymbol: { USD: '$', EUR: '€', BTC: 'BTC ' }
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case BITCOIN_PRICE_UPDATE: {
      return { ...state, bitcoinPrice: action.payload };
    }
    case UPDATE_API_KEY: {
      return { ...state, apiKey: action.payload };
    }
    case UPDATE_API_SECRET: {
      return { ...state, apiSecret: action.payload };
    }
    case UPDATE_EXCHANGE: {
      return { ...state, exchange: action.payload };
    }
    case UPDATE_ORDER_HISTORY: {
      return { ...state, refreshOrderHistory: action.payload };
    }
    case UPDATE_PORTFOLIO: {
      return { ...state, portfolioHoldings: action.payload };
    }
    case UPDATE_RETRIEVE_PORTFOLIO: {
      return { ...state, retrievePortfolio: action.payload };
    }
    case UPDATE_COIN_LIST: {
      return { ...state, coinList: action.payload };
    }
    case UPDATE_FIAT: {
      return { ...state, fiat: action.payload };
    }
    case FETCH_NOTIFICATIONS_SUCCESS: {
      return { ...state, notifications: action.payload };
    }
    default:
      return state;
  }
};
