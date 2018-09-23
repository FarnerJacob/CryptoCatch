import React, { Component } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { sha512 } from 'js-sha512';
import { connect } from 'react-redux';


class OrderConfirmation extends Component {

  state = {
    buyOrderPlaced: false,
    buyOrderFilled: false,
    sellOrdersPlaced: false,
    sellOrderPlaced: false,
    buyOrderUuid: null,
    done: false,
    price: 0,
    error: '',
    percentInterval: 0,
    sellPortion: 0,
    sellNumber: 1
  }

  componentWillMount() {
    if (this.props.navigation.state.params.type === 'buy') {
      if (this.props.navigation.state.params.calculated) {
        const { baseCurrency, marketCurrency, ticker, balance } = this.props.navigation.state.params;
        let uri = 'https://bittrex.com/api/v1.1/market/buylimit?apikey=';
        uri += this.props.apiKey;
        uri += '&nonce=';
        uri += new Date().getTime();
        uri += '&market=' + baseCurrency + '-' + marketCurrency;
        const price = ticker * 1.001;
        const quantity = (0.99 * balance) / price;
        console.log('price: ' + price);
        console.log('quantity: ' + quantity);
        console.log('total: ' + (price * quantity));
        console.log('balance: ' + balance);
        uri += '&quantity=' + quantity;
        uri += '&rate=' + price;
        const secret = this.props.apiSecret;
        const encrypted = sha512.hmac.create(secret);
        encrypted.update(uri);
        encrypted.hex();
        fetch(uri, {
          headers: { apisign: encrypted }
        }).then(response => response.json())
          .then(responseJson => {
            if (responseJson.success === true) {
              this.setState({ buyOrderPlaced: true });
              this.setState({ buyOrderUuid: responseJson.result.uuid });
            } else this.setState({ error: responseJson.message });
          })
          .catch(() => console.log('Failed to update portfolio'));
      } else {
        const { baseCurrency, marketCurrency, price, quantity } = this.props.navigation.state.params;
        let uri = 'https://bittrex.com/api/v1.1/market/buylimit?apikey=';
        uri += this.props.apiKey;
        uri += '&nonce=';
        uri += new Date().getTime();
        uri += '&market=' + baseCurrency + '-' + marketCurrency;
        uri += '&quantity=' + quantity;
        uri += '&rate=' + price;
        const secret = this.props.apiSecret;
        const encrypted = sha512.hmac.create(secret);
        encrypted.update(uri);
        encrypted.hex();
        fetch(uri, {
          headers: { apisign: encrypted }
        }).then(response => response.json())
          .then(responseJson => {
            if (responseJson.success === true) {
              this.setState({ buyOrderPlaced: true });
            } else this.setState({ error: responseJson.message });
          })
          .catch(() => console.log('Failed to update portfolio'));
      }
    } else {
      const { baseCurrency, marketCurrency, quantity, price } = this.props.navigation.state.params;
      let uri = 'https://bittrex.com/api/v1.1/market/selllimit?apikey=';
      uri += this.props.apiKey;
      uri += '&nonce=';
      uri += new Date().getTime();
      uri += '&market=' + baseCurrency + '-' + marketCurrency;
      uri += '&quantity=' + quantity;
      uri += '&rate=' + price;
      const secret = this.props.apiSecret;
      const encrypted = sha512.hmac.create(secret);
      encrypted.update(uri);
      encrypted.hex();
      fetch(uri, {
        headers: { apisign: encrypted }
      }).then(sellResponse => sellResponse.json())
        .then(sellResponseJson => {
          if (sellResponseJson.success === true) {
            console.log('Sell placed');
          } else this.setState({ error: sellResponseJson.message });
        });
      this.setState({ sellOrderPlaced: true });
    }
  }

  componentDidMount() {
    if (this.props.navigation.state.params.calculated && this.props.navigation.state.params.type === 'buy') {
      this.interval = setInterval(() => this.checkBuyOrder(), 500);
      this.interval = setInterval(() => this.placeSellOrders(), 500);
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  // TODO: if the order isn't filled immediately it should cancel and reorder with an adjusted price
  async checkBuyOrder() {
    if (!this.state.buyOrderFilled && this.state.buyOrderPlaced) {
      const uuid = this.state.buyOrderUuid;
      let uri = 'https://bittrex.com/api/v1.1/account/getorder?apikey=';
      uri += this.props.apiKey;
      uri += '&nonce=';
      uri += new Date().getTime();
      uri += '&uuid=' + uuid;
      const secret = this.props.apiSecret;
      const encrypted = sha512.hmac.create(secret);
      encrypted.update(uri);
      encrypted.hex();
      fetch(uri, {
        headers: { apisign: encrypted }
      }).then(buyResponse => buyResponse.json())
        .then(buyResponseJson => {
          if (buyResponseJson.success === true) {
            if (buyResponseJson.result.Closed !== null) {
              const { lowerBound, upperBound } = this.props.navigation.state.params;
              const percentInterval = (upperBound - lowerBound) / 4000;
              const price = buyResponseJson.result.PricePerUnit;
              const sellPortion = buyResponseJson.result.Quantity / 40;
              this.setState({ buyOrderFilled: true, percentInterval, price, sellPortion });
            }
          } else this.setState({ error: buyResponseJson.message });
        });
    }
  }

  async placeSellOrders() {
    if (this.state.buyOrderFilled && !this.state.sellOrdersPlaced) {
      const { baseCurrency, marketCurrency } = this.props.navigation.state.params;
      const { sellPortion, price, percentInterval } = this.state;
      for (let sellNumber = 1; sellNumber <= 40; sellNumber++) {
        let uri = 'https://bittrex.com/api/v1.1/market/selllimit?apikey=';
        uri += this.props.apiKey;
        uri += '&nonce=';
        uri += new Date().getTime();
        uri += '&market=' + baseCurrency + '-' + marketCurrency;
        uri += '&quantity=' + sellPortion;
        const sellPrice = (1 + (percentInterval * sellNumber)) * price;
        uri += '&rate=' + sellPrice;
        console.log(sellPrice);
        console.log(price);
        const secret = this.props.apiSecret;
        const encrypted = sha512.hmac.create(secret);
        encrypted.update(uri);
        encrypted.hex();
        fetch(uri, {
          headers: { apisign: encrypted }
        }).then(sellResponse => sellResponse.json())
          .then(sellResponseJson => {
            if (sellResponseJson.success === true) {
              console.log('Sell ' + sellNumber + ' placed');
            } else this.setState({ error: sellResponseJson.message });
          });
      }
      this.setState({ sellOrdersPlaced: true });
    }
  }

  renderBuyOrderPlaced() {
    if (this.state.buyOrderPlaced) {
      return (
        <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
          <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Buy order placed: </Text>
          <Image
            style={{ width: 25, height: 25 }}
            source={require('./images/checkMark.png')}
          />
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
        <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Buy order placed: </Text>
        <ActivityIndicator size='small' />
      </View>
    );
  }

  renderBuyOrderFilled() {
    if (this.state.buyOrderFilled) {
      return (
        <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
          <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Buy order filled: </Text>
          <Image
            style={{ width: 25, height: 25 }}
            source={require('./images/checkMark.png')}
          />
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
        <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Buy order filled: </Text>
        <ActivityIndicator size='small' />
      </View>
    );
  }

  renderSellOrdersPlaced() {
    if (this.state.sellOrdersPlaced) {
      return (
        <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
          <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Sell orders placed: </Text>
          <Image
            style={{ width: 25, height: 25 }}
            source={require('./images/checkMark.png')}
          />
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
        <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Sell orders placed: </Text>
        <ActivityIndicator size='small' />
      </View>
    );
  }

  renderSellOrderPlaced() {
    if (this.state.sellOrderPlaced) {
      return (
        <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
          <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Sell order placed: </Text>
          <Image
            style={{ width: 25, height: 25 }}
            source={require('./images/checkMark.png')}
          />
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
        <Text style={{ paddingLeft: 50, width: 300, fontSize: 20, textAlign: 'left', color: 'white' }}>Sell orders placed: </Text>
        <ActivityIndicator size='small' />
      </View>
    );
  }

  renderError() {
    if (this.state.error !== '') {
      return <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>Invalid order.</Text>;
    }
  }

  render() {
    if (this.props.navigation.state.params.type === 'buy') {
      if (this.props.navigation.state.params.calculated) {
        return (
          <View style={{ flex: 1, backgroundColor: '#001e00', alignItems: 'center', justifyContent: 'center' }}>
            {this.renderError()}
            {this.renderBuyOrderPlaced()}
            {this.renderBuyOrderFilled()}
            {this.renderSellOrdersPlaced()}
          </View>
        );
      }
      return (
        <View style={{ flex: 1, backgroundColor: '#001e00', alignItems: 'center', justifyContent: 'center' }}>
          {this.renderError()}
          {this.renderBuyOrderPlaced()}
        </View>
      );
    }
    return (
      <View style={{ flex: 1, backgroundColor: '#001e00', alignItems: 'center', justifyContent: 'center' }}>
        {this.renderError()}
        {this.renderSellOrderPlaced()}
      </View>
    );
  }
}

const mapStateToProps = ({ crypto }) => {
  const { apiKey, apiSecret } = crypto;
  return { apiKey, apiSecret };
};

export default connect(mapStateToProps)(OrderConfirmation);
