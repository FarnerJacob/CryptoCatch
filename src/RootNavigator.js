import { StackNavigator } from 'react-navigation';

import LoginForm from './components/LoginForm';
import HomeScreen from './components/Home';

const RootNavigator = StackNavigator({
  Login: {
    screen: LoginForm,
    navigationOptions: {
      headerTitle: 'CryptoCatch',
    },
  },
  Home: {
    screen: HomeScreen,
    navigationOptions: {
      headerTitle: 'CryptoCatch',
    },
  }
});

export default RootNavigator;
