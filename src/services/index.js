import fetch from 'isomorphic-fetch';

// STRIPE

let apiEndpoint = 'http://localhost:4000';

async function postData(url = '', data = {}) {
    let options = {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
          'Content-Type': 'application/json'
      }
    };
    const response = await fetch(url, options);
    return response.json(); // parses JSON response into native JavaScript objects
  }
  
  export let createPaymentIntent = async ({items,currency})=>{
    let url = apiEndpoint+'/create-payment-intent';
    let data = await postData(url, { items, currency });
    return data.clientSecret;
  }
