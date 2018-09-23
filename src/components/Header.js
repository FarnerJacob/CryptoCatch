import React from 'react';
import { Text, View } from 'react-native';

const Header = () => {
  const { viewStyle } = styles;
  return (
    <View style={viewStyle}>
      <Text style={{ fontSize: 14, flex: 1, textAlign: 'left', paddingLeft: 10, color: 'white' }}>Currency</Text>
      <Text style={{ fontSize: 14, width: 140, textAlign: 'center', color: 'white' }}>Estimated Changed</Text>
      <Text style={{ fontSize: 14, flex: 1, textAlign: 'center', paddingRight: 10, color: 'white' }}>Time</Text>
    </View>
  );
};

const styles = {
  viewStyle: {
    backgroundColor: '#00600e',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 1,
    elevation: 2,
    position: 'relative'
  },
  textStyle: {
    fontSize: 14,
    color: 'white'
  }
};

export default Header;
