import React, { Component } from 'react';
import { Text, View, Image } from 'react-native';
import { connect } from 'react-redux';

import { CardSection } from './common';

class PortfolioItem extends Component {
  state = {
    price: 0,
    loading: false
  }

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  renderItem() {
    if (this.props.exchange === 'BitTrex') {
      if (this.props.item.Balance > 0) {
        let balanceGreaterThanZero = true;
        let price = this.props.price;
        const balance = this.props.item.Balance;
        let finalPrice = 0;
        if (this.props.item.Currency !== 'BTC' && this.props.fiat !== 'BTC') {
          finalPrice = (price * balance * this.props.bitcoinPrice);
        } else if (this.props.item.Currency !== 'BTC' && this.props.fiat === 'BTC') {
          finalPrice = balance * price;
        } else {
          finalPrice = balance;
        }
        if (this.props.fiat !== 'BTC') {
          finalPrice = finalPrice.toFixed(2);
          if (finalPrice > 0) {
            finalPrice = this.numberWithCommas(finalPrice);
            if (this.props.item.Currency !== 'BTC') {
              price *= this.props.bitcoinPrice;
              price = price.toFixed(2);
            }
            price = this.numberWithCommas(price);
          } else {
            balanceGreaterThanZero = false;
          }
        } else {
          if (this.props.item.Currency === 'BTC') {
            price = 1;
          }
          finalPrice = finalPrice.toFixed(8);
        }
        if (balanceGreaterThanZero) {
          let uri = 'https://www.cryptocompare.com';
          uri += this.props.coinInfo.ImageUrl;
          return (
            <CardSection style={{ textAlign: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  style={{ width: 25, height: 25 }}
                  source={{ uri }}
                />
                <Text style={{ width: 65, fontSize: 16, color: 'white', textAlign: 'center' }}>{this.props.item.Currency}</Text>
              </View>

              <Text style={{ width: 130, fontSize: 16, textAlign: 'right', color: 'white' }}>{this.props.fiatSymbol[this.props.fiat] + price}</Text>

              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, color: 'white', textAlign: 'right' }}>{this.props.fiatSymbol[this.props.fiat] + finalPrice}</Text>
                <Text style={{ fontSize: 16, color: 'white', textAlign: 'right' }}>{this.props.item.Balance}</Text>
              </View>
            </CardSection>
          );
        }
      }
    } else if (this.props.exchange === 'Binance') {
      if (this.props.item.free > 0) {
        let balanceGreaterThanZero = true;
        let price = this.props.price;
        const balance = this.props.item.free;
        let finalPrice = 0;
        if (this.props.item.asset !== 'BTC' && this.props.fiat !== 'BTC') {
          finalPrice = (price * balance * this.props.bitcoinPrice);
        } else if (this.props.item.asset !== 'BTC' && this.props.fiat === 'BTC') {
          finalPrice = balance * price;
        } else {
          finalPrice = balance;
        }
        if (this.props.fiat !== 'BTC') {
          if (finalPrice >= 0.01) {
            finalPrice = finalPrice.toFixed(2);
          } else {
            finalPrice = 0.00;
          }
          if (finalPrice > 0) {
            finalPrice = this.numberWithCommas(finalPrice);
            if (this.props.item.asset !== 'BTC') {
              price *= this.props.bitcoinPrice;
              price = price.toFixed(2);
            }
            price = this.numberWithCommas(price);
          } else {
            balanceGreaterThanZero = false;
          }
        } else {
          if (this.props.item.asset === 'BTC') {
            price = 1;
          }
          try {
            finalPrice = finalPrice.toFixed(8);
          } catch (error) {
            console.log(error);
          }
        }
        if (balanceGreaterThanZero) {
          let uri = 'https://www.cryptocompare.com';
          uri += this.props.coinInfo.ImageUrl;
          return (
            <CardSection style={{ textAlign: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <Image
                  style={{ width: 25, height: 25 }}
                  source={{ uri }}
                />
                <Text style={{ width: 65, fontSize: 16, color: 'white', textAlign: 'center' }}>{this.props.item.asset}</Text>
              </View>

              <Text style={{ width: 130, fontSize: 16, textAlign: 'right', color: 'white' }}>{this.props.fiatSymbol[this.props.fiat] + price}</Text>

              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 16, color: 'white', textAlign: 'right' }}>{this.props.fiatSymbol[this.props.fiat] + finalPrice}</Text>
                <Text style={{ fontSize: 16, color: 'white', textAlign: 'right' }}>{this.props.item.free}</Text>
              </View>
            </CardSection>
          );
        }
      }
    }
  }

  render() {
    return (
      <View>
        {this.renderItem()}
      </View>
    );
  }
}

const mapStateToProps = ({ crypto }) => {
  const { exchange, fiat, fiatSymbol } = crypto;
  return { exchange, fiat, fiatSymbol };
};

export default connect(mapStateToProps)(PortfolioItem);
