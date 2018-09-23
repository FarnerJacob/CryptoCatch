import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import firebase from 'firebase';
import ReduxThunk from 'redux-thunk';
import { TabNavigator, StackNavigator } from 'react-navigation';
import { Text } from 'react-native';
import { Permissions, Notifications } from 'expo';

import LoginForm from './src/components/LoginForm';
import Alerts from './src/components/Notifications';
import Portfolio from './src/components/Portfolio';
import Orders from './src/components/Orders';
import OrderForm from './src/components/OrderForm';
import OrderConfirmation from './src/components/OrderConfirmation';
import Notification from './src/components/Notification';
import reducers from './src/reducers';

class App extends Component {
  componentWillMount() {
    const config = {
      apiKey: 'REMOVED',
      authDomain: 'REMOVED',
      databaseURL: 'REMOVED',
      projectId: 'REMOVED',
      storageBucket: 'REMOVED',
      messagingSenderId: 'REMOVED'
    };
    firebase.initializeApp(config);
  }

  async registerForPushNotificationsAsync() {
    const { status: existingStatus } = await Permissions.getAsync(
      Permissions.NOTIFICATIONS
    );
    let finalStatus = existingStatus;

    // only ask if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    if (existingStatus !== 'granted') {
      // Android remote notification permissions are granted during the app
      // install, so this will only ask on iOS
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
      finalStatus = status;
    }

    // Stop here if the user did not grant permissions
    if (finalStatus !== 'granted') {
      return;
    }

    // Get the token that uniquely identifies this device
    const token = await Notifications.getExpoPushTokenAsync();

    firebase.database().ref('tokens').set({
      pushToken: token
    });
  }

  render() {
    this.registerForPushNotificationsAsync();
    const RootNavigator = StackNavigator({
      Login: {
        screen: LoginForm,
        navigationOptions: {
          headerLeft: null,
          headerTitle: 'CryptoCatch',
          headerTitleStyle: {
            alignSelf: 'center',
            paddingTop: 20,
            color: '#ffffff'
          },
          headerStyle: {
            backgroundColor: '#001e00'
          }
        }
      },
      News: {
        screen: TabNavigator(
          {
            Alerts: {
              screen: Alerts
            },
          },
          {
            tabBarOptions: {
              style: {
                backgroundColor: '#001e00',
                paddingTop: 20
              },
              labelStyle: {
                fontSize: 12
              },
              activeBackgroundColor: '#333333',
              inactiveBackgroundColor: '#4d4d4d',
            },
            initialRouteName: 'Alerts'
          }
        )
      },
      Main: {
        screen: TabNavigator(
          {
            Portfolio: {
              screen: Portfolio
            },
            Orders: {
              screen: Orders
            }
          },
          {
            tabBarOptions: {
              style: {
                backgroundColor: '#001e00',
                paddingTop: 20
              },
              labelStyle: {
                fontSize: 12
              },
              activeBackgroundColor: '#333333',
              inactiveBackgroundColor: '#4d4d4d',
            },
            initialRouteName: 'Portfolio'
          }
        ),
        navigationOptions: {
          header: null
        }
      },
      Notification: {
        screen: Notification,
        navigationOptions: {
          headerTitle: 'Notification',
          headerTitleStyle: {
            alignSelf: 'center',
            color: '#ffffff'
          },
          headerTintColor: '#ffffff',
          headerRight: <Text style={{ color: '#ffffff', paddingRight: 15 }}>info</Text>,
          headerStyle: {
            backgroundColor: '#001e00',
            paddingTop: 20
          }
        }
      },
      OrderForm: {
        screen: OrderForm,
        navigationOptions: {
          headerTitle: 'Order Form',
          headerTitleStyle: {
            alignSelf: 'center',
            color: '#ffffff'
          },
          headerTintColor: '#ffffff',
          headerRight: <Text style={{ color: '#ffffff', paddingRight: 15 }}>info</Text>,
          headerStyle: {
            backgroundColor: '#001e00',
            paddingTop: 20
          }
        }
      },
      OrderConfirmation: {
        screen: OrderConfirmation,
        navigationOptions: {
          headerTitle: 'Order Confirmation',
          headerTitleStyle: {
            alignSelf: 'center',
            color: '#ffffff'
          },
          headerTintColor: '#ffffff',
          headerRight: <Text style={{ color: '#ffffff', paddingRight: 15 }}>info</Text>,
          headerStyle: {
            backgroundColor: '#001e00',
            paddingTop: 20
          }
        }
      }
    },
    // Temporary line so I can skip the login form when testing
    { initialRouteName: 'Main' }
  );

    const prevGetStateForAction = RootNavigator.router.getStateForAction;

    RootNavigator.router.getStateForAction = (action, state) => {
      // Do not allow to go back from Home
      if (action.type === 'Navigation/BACK' && state && state.routes[state.index].routeName === 'Main') {
        return state;
      }
      if (action.type === 'Navigation/BACK' && state && state.routes[state.index].routeName === 'Login') {
        return state;
      }

      // Do not allow to go back to Login
      if (action.type === 'Navigation/BACK' && state) {
        const newRoutes = state.routes.filter(r => r.routeName !== 'Login');
        const newIndex = newRoutes.length - 1;
        return prevGetStateForAction(action, { index: newIndex, routes: newRoutes });
      }
      return prevGetStateForAction(action, state);
    };

    const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));

    return (
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    );
  }
}

export default App;
