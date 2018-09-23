import React from 'react';
import { Text, View } from 'react-native';

const Header = (props) => {
  const { textStyle, viewStyle } = styles;
  return (
    <View style={{ backgroundColor: '#00600e' }}>
      <View style={viewStyle}>
        <Text style={textStyle}>Total Value: </Text>
        <Text style={textStyle}>{props.headerText}</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Text style={{ fontSize: 14, flex: 1, textAlign: 'left', paddingLeft: 10, color: 'white' }}>Currency</Text>
        <Text style={{ fontSize: 14, flex: 1, textAlign: 'center', color: 'white' }}>Price</Text>
        <Text style={{ fontSize: 14, flex: 1, textAlign: 'right', paddingRight: 10, color: 'white' }}>Balance</Text>
      </View>
    </View>
  );
};

const styles = {
  viewStyle: {
    backgroundColor: '#00600e',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 2,
    position: 'relative'
  },
  textStyle: {
    fontSize: 20,
    textAlign: 'left',
    paddingRight: 10,
    color: 'white'
  }
};

export { Header };
