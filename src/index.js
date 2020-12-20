import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import { loadStripe } from '@stripe/stripe-js'
import { Elements,} from '@stripe/react-stripe-js'


// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// TODO: Move Test Key to config file
const stripePromise = loadStripe(
  'pk_test_51HzKckFlyo65azYfF87FppYlDzQq7FXgNMZl7NLSSyJ9HMCY5i8iaRXRPsLNfs85os9lAUEANSQYtjZl00Yzdr6700grHrmrKo'
)


const client = new ApolloClient({
  // local development
  uri: 'http://localhost:4000/graphql',
});

ReactDOM.render(
  <ApolloProvider client = {client}>
    <Elements stripe={stripePromise}>
    <App />
    </Elements>
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
