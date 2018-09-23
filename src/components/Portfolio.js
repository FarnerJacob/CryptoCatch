import React, { Component } from 'react';
import { FlatList, View, AsyncStorage, Text, Button } from 'react-native';
import { sha512 } from 'js-sha512';
import { sha256 } from 'js-sha256';
import { connect } from 'react-redux';
import Modal from 'react-native-modal';

import PortfolioItem from './PortfolioItem';
import OptionsMenu from './OptionsMenu';
import NavigationBar from './NavigationBar';
import { Header, Spinner } from './common';
import { updateApiKey, updateApiSecret, updatePorfolio, updateRetrievePortfolio, updateCoinList } from '../actions';

class Portfolio extends Component {

  constructor(props) {
    super(props);
    this.state = {
      load: true,
      prices: [],
      coinList: [],
      bitcoinPrice: 0,
      exchange: 'BitTrex',
      loading: true,
      errorMessage: null,
      page: 1,
      seed: 1,
      optionsExpanded: false,
      error: null,
      refreshing: false,
      totalValue: 0
    };
  }

  // TODO: get all prices from bittrex in BTC and get the price of BTC from Coinbase and covnert to USD and EUR from there
  componentDidMount() {
    if (this.props.retrievePortfolio) {
      this.getInfo(false);
    }
  }

  componentDidUpdate() {
    if (this.props.retrievePortfolio) {
      this.getInfo(false);
    }
  }

  onRefresh() {
    if (this.props.apiKey !== null && this.props.apiSecret !== null) {
      this.getInfo(true);
    }
  }

  onPressHideModal() {
    if (this.state.optionsExpanded) {
      this.setState({ optionsExpanded: false });
    } else this.setState({ optionsExpanded: true });
  }

  async getApiKey() {
    const api = { key: null, secret: null };
    try {
        api.key = await AsyncStorage.getItem('@' + this.props.exchange + 'Api:key');
        this.props.updateApiKey(api.key);
        api.secret = await AsyncStorage.getItem('@' + this.props.exchange + 'Api:secret');
        this.props.updateApiSecret(api.secret);
    } catch (error) {
      console.log(error);
    }
    return api;
  }

  async getBitcoinPrice() {
    const uri = 'https://api.coinbase.com/v2/prices/BTC-USD/spot';
    fetch(uri)
      .then(response => response.json())
        .then(responseJson => {
          this.setState({ bitcoinPrice: responseJson.data.amount });
        });
  }

  async getCoinList() {
    const url = 'https://www.cryptocompare.com/api/data/coinlist/';
    fetch(url)
      .then(response => response.json())
        .then(responseJson => {
          this.props.updateCoinList(responseJson.Data);
        });
  }

  async getPortfolio() {
    this.setState({ errorMessage: null });
    const api = await this.getApiKey();
    if (api.key !== null && api.secret !== null) {
      if (this.props.exchange === 'BitTrex') {
        let uri = 'https://bittrex.com/api/v1.1/account/getbalances?apikey=';
        uri += api.key;
        uri += '&nonce=';
        uri += new Date().getTime();
        const secret = api.secret;
        const encrypted = sha512.hmac.create(secret);
        encrypted.update(uri);
        encrypted.hex();
        //fetch the portfolio
        await fetch(uri, {
          headers: { apisign: encrypted }
        })
          .then(response => response.json())
            .then(responseJson => {
              if (!responseJson.success) {
                this.setState({ errorMessage: responseJson.message });
              } else {
                this.props.updatePorfolio(responseJson.result, this.props.exchange);
                this.getPrices(responseJson.result);
              }
            })
            .catch((error) => console.log(error));
      } else if (this.props.exchange === 'Binance') {
        let uri = 'https://api.binance.com/api/v1/time';
        const time = await fetch(uri, {
          headers: { 'X-MBX-APIKEY': api.key, verbose: true },
        })
          .then(response => response.json())
            .then(responseJson => responseJson.serverTime);
        const base = 'https://api.binance.com/api/v3/account?';
        uri = 'timestamp=';
        uri += time;
        const secret = api.secret;
        const encrypted = sha256.hmac.create(secret);
        encrypted.update(uri);
        encrypted.hex();
        uri += '&signature=';
        uri += encrypted;
        uri = base + uri;
        //fetch the portfolio
        await fetch(uri, {
          headers: { 'X-MBX-APIKEY': api.key, verbose: true },
        })
          .then(response => {
            return response.json();
          })
            .then(responseJson => {
              if (responseJson.msg) {
                this.setState({ errorMessage: responseJson.msg });
              } else {
                this.props.updatePorfolio(responseJson.balances, this.props.exchange);
                this.getPrices(responseJson.balances);
              }
            })
            .catch((error) => console.log(error));
      }
    } else {
      this.setState({ load: false });
    }
  }

  async getPrices(portfolioHoldings) {
    let uri = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=';
    if (this.props.exchange === 'BitTrex') {
      if (portfolioHoldings.length !== 0) {
        if (portfolioHoldings[0].Currency !== 'BTC') {
          if (portfolioHoldings[0].Currency !== 'BCC') {
            uri += portfolioHoldings[0].Currency;
          } else {
            uri += 'BCH';
          }
        }
        for (let i = 1; i < portfolioHoldings.length; i++) {
          if (portfolioHoldings[i].Currency !== 'BTC') {
            if (portfolioHoldings[i].Currency !== 'BCC') {
              uri += ',' + portfolioHoldings[i].Currency;
            } else {
              uri += ',BCH';
            }
          }
        }
        uri += '&tsyms=BTC&e=' + this.props.exchange;
        fetch(uri)
          .then(priceResponse => priceResponse.json())
            .then(priceResponseJson => {
              this.setState({ prices: priceResponseJson });
              this.getValues(priceResponseJson);
            });
      }
    } else if (this.props.exchange === 'Binance') {
      if (portfolioHoldings.length !== 0) {
        if (portfolioHoldings[0].asset !== 'BTC' && portfolioHoldings[0].free > 0) {
          uri += portfolioHoldings[0].asset;
        }
        for (let i = 1; i < portfolioHoldings.length; i++) {
          if (portfolioHoldings[i].asset !== 'BTC' && portfolioHoldings[i].free > 0) {
            uri += ',' + portfolioHoldings[i].asset;
          }
        }
        uri += '&tsyms=BTC&e=' + this.props.exchange;
        fetch(uri)
          .then(priceResponse => priceResponse.json())
            .then(priceResponseJson => {
              this.setState({ prices: priceResponseJson });
              this.getValues(priceResponseJson);
            });
      }
    }
  }

  async getValues(prices) {
    const { portfolioHoldings } = this.props;
    const { bitcoinPrice } = this.state;
    const totalValue = { USD: 0, BTC: 0 };
    if (this.props.exchange === 'BitTrex') {
      let balance = 0;
      let tempPriceUSD = 0;
      let tempPriceBTC = 0;
      for (let i = 0; i < portfolioHoldings.length; i++) {
        balance = portfolioHoldings[i].Balance;
        if (portfolioHoldings[i].Currency === 'BCC') {
          tempPriceUSD = balance * prices.BCH.BTC * bitcoinPrice;
          totalValue.USD += tempPriceUSD;
          tempPriceBTC = balance * prices.BCH.BTC;
          totalValue.BTC += tempPriceBTC;
        } else if (portfolioHoldings[i].Currency === 'BTC') {
          tempPriceUSD = balance * bitcoinPrice;
          totalValue.USD += tempPriceUSD;
          tempPriceBTC = balance;
          totalValue.BTC += tempPriceBTC;
        } else {
          tempPriceUSD = balance * prices[portfolioHoldings[i].Currency].BTC * bitcoinPrice;
          totalValue.USD += tempPriceUSD;
          tempPriceBTC = balance * prices[portfolioHoldings[i].Currency].BTC;
          totalValue.BTC += tempPriceBTC;
        }
      }
      portfolioHoldings.sort((a, b) => {
        if (a.Currency === 'BCC' && b.Currency === 'BTC') {
          return (b.Balance) - (a.Balance * prices.BCH.BTC);
        }
        if (b.Currency === 'BCC' && a.Currency === 'BTC') {
          return (b.Balance * prices.BCH.BTC) - (a.Balance);
        }
        if (a.Currency === 'BCC') {
          return (b.Balance * prices[b.Currency].BTC) - (a.Balance * prices.BCH.BTC);
        }
        if (b.Currency === 'BCC') {
          return (b.Balance * prices.BCH.BTC) - (a.Balance * prices[a.Currency].BTC);
        }
        if (a.Currency === 'BTC') {
          return (b.Balance * prices[b.Currency].BTC) - (a.Balance);
        }
        if (b.Currency === 'BTC') {
          return (b.Balance) - (a.Balance * prices[a.Currency].BTC);
        }
        return (b.Balance * prices[b.Currency].BTC) - (a.Balance * prices[a.Currency].BTC);
      });
    } else if (this.props.exchange === 'Binance') {
      let balance = 0;
      let tempPriceUSD = 0;
      let tempPriceBTC = 0;
      for (let i = 0; i < portfolioHoldings.length; i++) {
        balance = portfolioHoldings[i].free;
        if (portfolioHoldings[i].asset === 'BTC') {
          tempPriceUSD = balance * bitcoinPrice;
          totalValue.USD += tempPriceUSD;
          tempPriceBTC = balance;
          totalValue.BTC += Number(tempPriceBTC);
        } else {
          tempPriceUSD = balance * prices[portfolioHoldings[i].asset].BTC * bitcoinPrice;
          totalValue.USD += tempPriceUSD;
          tempPriceBTC = balance * prices[portfolioHoldings[i].asset].BTC;
          totalValue.BTC += tempPriceBTC;
        }
      }
      portfolioHoldings.sort((a, b) => {
        if (a.asset === 'BTC') {
          return (b.free * prices[b.asset].BTC) - (a.free);
        }
        if (b.asset === 'BTC') {
          return (b.free) - (a.free * prices[a.asset].BTC);
        }
        return (b.free * prices[b.asset].BTC) - (a.Balance * prices[a.asset].BTC);
      });
    }
    this.setState({ totalValue, load: false });
  }

  async getInfo(refresh) {
    if (refresh) {
      this.setState({ exchange: this.props.exchange });
    } else {
      this.setState({ exchange: this.props.exchange, load: true });
    }
    this.props.updateRetrievePortfolio(this.props.retrievePortfolio);
    this.getCoinList();
    this.getBitcoinPrice();
    this.getPortfolio();
  }

  renderItem(item) {
    if (this.props.exchange === 'BitTrex') {
      if (item.Currency === 'BCC') {
        return <PortfolioItem item={item} price={this.state.prices.BCH.BTC} coinInfo={this.props.coinList.BCH} bitcoinPrice={this.state.bitcoinPrice} />;
      }
      if (item.Currency === 'BTC') {
        return <PortfolioItem item={item} price={this.state.bitcoinPrice} coinInfo={this.props.coinList.BTC} bitcoinPrice={this.state.bitcoinPrice} />;
      }
      return <PortfolioItem item={item} price={this.state.prices[item.Currency].BTC} coinInfo={this.props.coinList[item.Currency]} bitcoinPrice={this.state.bitcoinPrice} />;
    } else if (this.props.exchange === 'Binance') {
      if (item.asset === 'BTC') {
        return <PortfolioItem item={item} price={this.state.bitcoinPrice} coinInfo={this.props.coinList.BTC} bitcoinPrice={this.state.bitcoinPrice} />;
      }
      return <PortfolioItem item={item} price={this.state.prices[item.asset].BTC} coinInfo={this.props.coinList[item.asset]} bitcoinPrice={this.state.bitcoinPrice} />;
    }
  }

  render() {
    if (this.state.errorMessage !== null) {
      return (
        <View style={{ flex: 1, backgroundColor: '#183016' }}>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#183016' }}>
            <Text style={{ textAlign: 'center', color: 'white' }}>{this.state.errorMessage}</Text>
          </View>
          <Modal isVisible={this.state.optionsExpanded} animationIn='slideInLeft' onBackdropPress={this.onPressHideModal.bind(this)}>
            <OptionsMenu />
          </Modal>
          <Button title='Drawer' onPress={this.onPressHideModal.bind(this)} />
        </View>
      );
    } else if (this.state.load || this.props.exchange !== this.state.exchange || this.props.retrievePortfolio) {
      return (
          <Spinner />
      );
    } else if (this.props.apiKey == null || this.props.apiSecret == null) {
      return (
        <View style={{ flex: 1, backgroundColor: '#183016' }}>
          <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#183016' }}>
            <Text style={{ textAlign: 'center', color: 'white' }}>Please input a valid API key and secret.</Text>
          </View>
          <Modal isVisible={this.state.optionsExpanded} animationIn='slideInLeft' onBackdropPress={this.onPressHideModal.bind(this)}>
            <OptionsMenu />
          </Modal>
          <Button title='Drawer' onPress={this.onPressHideModal.bind(this)} />
        </View>
      );
    }
    const { portfolioHoldings } = this.props;
    const numberWithCommas = (x) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    let totalValue = this.state.totalValue[this.props.fiat];
    if (totalValue !== null) {
      if (this.props.fiat !== 'BTC') {
        totalValue = totalValue.toFixed(2);
        totalValue = numberWithCommas(totalValue);
      } else {
        try {
          totalValue = totalValue.toFixed(8);
        } catch (error) {
          console.log(error);
        }
      }
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#183016' }}>
        <Header headerText={this.props.fiatSymbol[this.props.fiat] + totalValue} />
        <FlatList
          data={portfolioHoldings}
          refreshing={this.state.refreshing}
          onRefresh={() => this.onRefresh()}
          keyExtractor={item => item.Currency}
          renderItem={({ item }) => this.renderItem(item)}
        />
        <Modal isVisible={this.state.optionsExpanded} animationIn='slideInLeft' animationOut='slideOutRight' onBackdropPress={this.onPressHideModal.bind(this)}>
          <OptionsMenu />
        </Modal>
        <Button title='Drawer' onPress={this.onPressHideModal.bind(this)} />
        <NavigationBar navigation={this.props.navigation} activeTab={1} />
      </View>
    );
  }
}

const mapStateToProps = ({ crypto }) => {
  const { apiKey, apiSecret, exchange, portfolioHoldings, retrievePortfolio, coinList, fiat, fiatSymbol } = crypto;
  return { apiKey, apiSecret, exchange, portfolioHoldings, retrievePortfolio, coinList, fiat, fiatSymbol };
};

export default connect(mapStateToProps, { updateApiKey, updateApiSecret, updatePorfolio, updateRetrievePortfolio, updateCoinList })(Portfolio);
