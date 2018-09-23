import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
//import { sha512 } from 'js-sha512';
import Autocomplete from 'react-native-autocomplete-input';
import { Dropdown } from 'react-native-material-dropdown';
import { connect } from 'react-redux';
import { CheckBox } from 'react-native-elements';

import { Input, Button, Spinner } from './common';

class OrderForm extends Component {

  state = {
    loading: true,
    error: false,
    bases: [{ value: 'BTC' }, { value: 'ETH' }, { value: 'USDT' }, { value: 'USD' }],
    data: [],
    validMarket: false,
    USDTMarkets: [],
    USDMarkets: [],
    ETHMarkets: [],
    BTCMarkets: [],
    upperBound: 100,
    lowerBound: 0,
    calculated: false,
    balance: null,
    minimum: 0,
    ticker: [],
    query: '',
    price: 0,
    quantity: 0,
    baseCurrency: 'BTC',
    marketCurrency: '',
    expandedFrom: false,
    time: null
  }

  componentWillMount() {
    const uri = 'https://bittrex.com/api/v1.1/public/getmarkets';
    fetch(uri).then(response => response.json())
      .then(responseJson => {
        const data = responseJson.result;
        this.setState({ data });
        const USDMarkets = [];
        const BTCMarkets = [];
        const ETHMarkets = [];
        const USDTMarkets = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i].BaseCurrency === 'BTC') {
            BTCMarkets.push(data[i].MarketCurrency);
          } else if (data[i].BaseCurrency === 'ETH') {
            ETHMarkets.push(data[i].MarketCurrency);
          } else if (data[i].BaseCurrency === 'USDT') {
            USDTMarkets.push(data[i].MarketCurrency);
          } else if (data[i].BaseCurrency === 'USD') {
            USDMarkets.push(data[i].MarketCurrency);
          }
        }
        this.setState({ USDMarkets, USDTMarkets, ETHMarkets, BTCMarkets, loading: false });
      })
        .catch(() => console.log('Failed to update portfolio'));
    if (this.props.navigation.state.params === 'buy') {
      const { portfolioHoldings } = this.props;
      for (let i = 0; i < portfolioHoldings.length; i++) {
        if (portfolioHoldings[i].Currency === this.state.baseCurrency) {
          const balance = portfolioHoldings[i].Balance;
          this.setState({ balance });
        }
      }
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => this.getTicker(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onButtonPress() {
    const { validMarket, calculated, baseCurrency, marketCurrency, price, quantity, lowerBound, upperBound, ticker, balance } = this.state;
    if (!calculated && validMarket && price > 0 && quantity > 0 && balance - (price * quantity) >= 0) {
      this.props.navigation.navigate('OrderConfirmation', { type: this.props.navigation.state.params, calculated, baseCurrency, marketCurrency, price, quantity });
    } else if (calculated && validMarket) {
      this.props.navigation.navigate('OrderConfirmation', { type: this.props.navigation.state.params, calculated, baseCurrency, marketCurrency, lowerBound, upperBound, ticker: ticker.Ask, balance });
    } else {
      this.setState({ error: true });
    }
  }

  async getTicker() {
    let uri = 'https://bittrex.com/api/v1.1/public/getticker?market=';
    uri += this.state.baseCurrency + '-' + this.state.marketCurrency;
    fetch(uri).then(response => response.json())
      .then(responseJson => {
        if (responseJson.result !== null) {
          this.setState({ ticker: responseJson.result, validMarket: true });
        } else {
          this.setState({ ticker: responseJson.result, validMarket: false });
        }
      })
        .catch(() => console.log('Failed to update portfolio'));
  }

  check() {
    if (this.state.calculated === false) {
      this.setState({ calculated: true });
    } else {
      this.setState({ calculated: false });
    }
  }

  // TODO: check the minimum order requirements before placing an order
  findMinimum() {
    const { baseCurrency, marketCurrency, data } = this.state;
    const findMatchingMarket = (element) => {
      return element.BaseCurrency === baseCurrency && element.MarketCurrency === marketCurrency;
    };
    const index = data.findIndex(findMatchingMarket);
    return data[index].MinTradeSize;
  }

  findBalance(base) {
    if (this.props.navigation.state.params === 'buy') {
      const { portfolioHoldings } = this.props;
      for (let i = 0; i < portfolioHoldings.length; i++) {
        if (portfolioHoldings[i].Currency === this.state.baseCurrency) {
          const balance = portfolioHoldings[i].Balance;
          this.setState({ balance });
        }
      }
    } else {
      const { portfolioHoldings } = this.props;
      for (let i = 0; i < portfolioHoldings.length; i++) {
        if (portfolioHoldings[i].Currency === base) {
          const balance = portfolioHoldings[i].Balance;
          this.setState({ balance });
        }
      }
    }
  }

  findMarkets(query) {
    if (this.state.baseCurrency === 'BTC') {
      const { BTCMarkets } = this.state;
      if (query === '') {
        return BTCMarkets;
      }

      const regex = new RegExp(`${query.trim()}`, 'i');
      return BTCMarkets.filter(market => market.search(regex) >= 0);
    } else if (this.state.baseCurrency === 'ETH') {
      const { ETHMarkets } = this.state;
      if (query === '') {
        return ETHMarkets;
      }

      const regex = new RegExp(`${query.trim()}`, 'i');
      return ETHMarkets.filter(market => market.search(regex) >= 0);
    } else if (this.state.baseCurrency === 'USDT') {
      const { USDTMarkets } = this.state;
      if (query === '') {
        return USDTMarkets;
      }

      const regex = new RegExp(`${query.trim()}`, 'i');
      return USDTMarkets.filter(market => market.search(regex) >= 0);
    } else if (this.state.baseCurrency === 'USD') {
      const { USDMarkets } = this.state;
      if (query === '') {
        return USDMarkets;
      }

      const regex = new RegExp(`${query.trim()}`, 'i');
      return USDMarkets.filter(market => market.search(regex) >= 0);
    }
  }

  renderMarkets() {
    if (this.props.navigation.state.params === 'buy') {
      const marketList = this.findMarkets(this.state.query);
      const autocompleteHeight = marketList.length <= 7 ? marketList.length * 24 : 168;
      const comp = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
      return (
        <View>
          <Dropdown
            label='Base Currency'
            data={this.state.bases}
            dropdownPosition={0}
            textColor='white'
            baseColor='white'
            animationDuration={100}
            value={this.state.bases[0].value}
            onChangeText={(base) => {
              this.setState({ baseCurrency: base });
              this.findBalance();
            }
            }
          />
          <View style={{ height: autocompleteHeight + 50 }}>
            <Autocomplete
              autoCapitalize='characters'
              autoCorrect={false}
              data={marketList.length === 1 && comp(this.state.query, marketList[0]) ? [] : marketList}
              defaultValue={this.state.query}
              listContainerStyle={{ height: autocompleteHeight }}
              onChangeText={text => this.setState({ query: text, marketCurrency: text })}
              placeholder='Market Currency'
              renderItem={data => (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({ query: data, marketCurrency: data });
                  }
                }
                >
                  <Text>{data}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      );
    }

    const marketList = [];
    for (let i = 0; i < this.props.portfolioHoldings.length; i++) {
      if (this.props.portfolioHoldings[i].Balance > 0) {
        marketList.push({ value: this.props.portfolioHoldings[i].Currency });
      }
    }
    return (
      <View>
        <Dropdown
          label='Market Currency'
          data={marketList}
          dropdownPosition={0}
          animationDuration={100}
          textColor='white'
          baseColor='white'
          value={marketList[0].value}
          onChangeText={(base) => this.setState({ marketCurrency: base }, this.findBalance(base))}
        />
        <Dropdown
          label='Base Currency'
          data={this.state.bases}
          dropdownPosition={0}
          textColor='white'
          baseColor='white'
          animationDuration={100}
          value={this.state.bases[0].value}
          onChangeText={(base) => this.setState({ baseCurrency: base })}
        />
      </View>
    );
  }

  renderTicker() {
    if (this.state.ticker !== null) {
      return (
        <View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: 120, color: 'white', textAlign: 'center', fontSize: 18 }}>Bid</Text>
            <Text style={{ width: 120, color: 'white', textAlign: 'center', fontSize: 18 }}>Last</Text>
            <Text style={{ width: 120, color: 'white', textAlign: 'center', fontSize: 18 }}>Ask</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ width: 120, color: 'white', textAlign: 'center' }}>{this.state.ticker.Bid}</Text>
            <Text style={{ width: 120, color: 'white', textAlign: 'center' }}>{this.state.ticker.Last}</Text>
            <Text style={{ width: 120, color: 'white', textAlign: 'center' }}>{this.state.ticker.Ask}</Text>
          </View>
        </View>
      );
    }
    return (
      <View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ width: 120, color: 'white', textAlign: 'center', fontSize: 18 }}>Bid</Text>
          <Text style={{ width: 120, color: 'white', textAlign: 'center', fontSize: 18 }}>Last</Text>
          <Text style={{ width: 120, color: 'white', textAlign: 'center', fontSize: 18 }}>Ask</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={{ width: 120, color: 'white', textAlign: 'center' }}>Not a valid market</Text>
          <Text style={{ width: 120, color: 'white', textAlign: 'center' }}>Not a valid market</Text>
          <Text style={{ width: 120, color: 'white', textAlign: 'center' }}>Not a valid market</Text>
        </View>
      </View>
    );
  }

  renderButton() {
    if (this.props.navigation.state.params === 'buy') {
      return (
        <Button onPress={this.onButtonPress.bind(this)}>
          Buy
        </Button>
      );
    }
    return (
      <Button onPress={this.onButtonPress.bind(this)}>
        Sell
      </Button>
    );
  }

  renderCost() {
    if (this.props.navigation.state.params === 'buy') {
      const cost = this.state.quantity * this.state.price;
      if (cost <= this.state.balance) {
        return <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Cost: {cost}</Text>;
      }
      return <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>Cost: {cost}</Text>;
    }
    if (this.state.quantity <= this.state.balance) {
      return <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Cost: {this.state.quantity}</Text>;
    }
    return <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>Cost: {this.state.quantity}</Text>;
  }

  renderChoice() {
    if (this.state.calculated === false) {
      return (
        <View>
          {this.renderCost()}
          <View style={{ height: 35 }}>
            <Input
              label="Quantity"
              placeholder="0"
              onChangeText={quantity => this.setState({ quantity })}
              value={this.state.quantity}
            />
          </View>

          <View style={{ height: 35 }}>
            <Input
              label="Price"
              placeholder="0"
              onChangeText={price => this.setState({ price })}
              value={this.state.price}
            />
          </View>
        </View>
      );
    }
    return (
      <View>
        <View style={{ height: 35 }}>
          <Input
            label="Upper Bound"
            placeholder="100"
            onChangeText={upperBound => this.setState({ upperBound })}
            value={this.state.quantity}
          />
        </View>

        <View style={{ height: 35 }}>
          <Input
            label="Lower Bound"
            placeholder="0"
            onChangeText={lowerBound => this.setState({ lowerBound })}
            value={this.state.price}
          />
        </View>
      </View>
    );
  }

  renderError() {
    if (this.state.error) {
      return <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>Invalid order.</Text>;
    }
  }

  renderBalance() {
    if (this.props.navigation.state.params === 'buy') {
      return <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>{this.state.baseCurrency} Balance: {this.state.balance}</Text>;
    } else if (this.state.balance !== null) {
      return <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>{this.state.marketCurrency} Balance: {this.state.balance}</Text>;
    }
    return <Text style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>Please choose a market currency.</Text>;
  }

  renderCalculated() {
    if (this.props.navigation.state.params === 'buy') {
      return (
        <CheckBox
          title='Calculated Buy and Sell'
          checked={this.state.calculated}
          onPress={() => this.check()}
        />
      );
    }
  }

  render() {
    if (this.state.loading) {
      return <Spinner />;
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#183016' }}>
        {this.renderError()}
        {this.renderTicker()}
        {this.renderBalance()}

        {this.renderMarkets()}
        {this.renderChoice()}
        {this.renderCalculated()}
        <View style={{ height: 45 }}>
          {this.renderButton()}
        </View>
      </View>
    );
  }
}

const mapStateToProps = ({ crypto }) => {
  const { exchange, portfolioHoldings, coinList, fiat, fiatSymbol } = crypto;
  return { exchange, portfolioHoldings, coinList, fiat, fiatSymbol };
};

export default connect(mapStateToProps)(OrderForm);
