import React, { useState } from 'react'
import './App.css'
import { useQuery } from '@apollo/react-hooks'
import {
  GET_INVENTORY,
  GET_ONE_INVENTORY_ITEM,
  EDIT_INVENTORY_ITEM,
  CREATE_ORDER,
} from './queries'
import { createPaymentIntent } from './services'
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardImg,
  CardText,
  CardTitle,
  CardSubtitle,
  Spinner,
} from 'reactstrap'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'

function App() {
  let [itemsInCart, setItemsInCart] = useState({})
  let [totalCost, setTotalCost] = useState(0)
  let [checkoutStarted, setCheckoutStarted] = useState(false)
  let [readyToConfirmPayment, setReadyToConfirmPayment] = useState(false)
  let [orderSuccessful, setOrderSuccessful] = useState(false)
  // TODO: I should probably put this elsewhere...
  let [clientSecret, setClientSecret] = useState('')
  const fetchInventoryItems = useQuery(GET_INVENTORY)
  const getOneInventoryItem = useQuery(GET_ONE_INVENTORY_ITEM, {
    variables: { id: 1 },
  })
  // STRIPE CARD STUFF
  const stripe = useStripe()
  const elements = useElements()

  // let inventoryItems = fetchInventoryItems.data.getInventoryItems;

  if (fetchInventoryItems.loading || getOneInventoryItem.loading)
    return <Spinner color="dark" />
  if (fetchInventoryItems.error || getOneInventoryItem.error) {
    console.log(fetchInventoryItems.error)
    console.log(getOneInventoryItem.error)
    return <React.Fragment> Error</React.Fragment>
  }

  const onAddToCartClick = ({ id, name, cost, code }) => {
    let editedCart = { ...itemsInCart }

    if (!itemsInCart[id]) {
      editedCart[id] = {
        name: name,
        cost: cost ? cost : 0,
        code: code,
        // default to 1 for now
        quantityOrdered: 1,
      }
      setTotalCost((totalCost += cost))
    } else {
      delete editedCart[id]
      setTotalCost((totalCost -= cost))
    }
    // TODO: itemsInCart get's a new value on delay.. perhaps add in USE EFFECT
    setItemsInCart(editedCart)
  }
  // TODO:
  //  Add Checkout (Stripe)
  //  Add Cart
  //  Update Inventory on Checkout
  //  Create order on Checkout
  //  IMAGES?

  // STRIPE CARD STUFF

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        //Test
        billing_details: {
          name: 'Jenny Rosen',
        },
      },
    })

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message)
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
        setOrderSuccessful(true)

        // create order!!!

      }
    }
  }
  const startCheckout = async (itemsInCart) => {
    setCheckoutStarted(true)
    // create payment intent with itemsInCart and currency
    let cs = await createPaymentIntent({ items: itemsInCart, currency: 'usd' })
    setClientSecret(cs)
    if (!!cs) {
      setReadyToConfirmPayment(true)
    }
  }

  const resetEverything = ()=>{
    setCheckoutStarted(false)
    setReadyToConfirmPayment(false)
    setOrderSuccessful(false)
    setItemsInCart({})
    setTotalCost(0)
    setClientSecret('')
  }

  // const updateInventoryItem = useQuery(EDIT_INVENTORY_ITEM, { variables: { id: 9, quantityInStock: 5 }});
  return (
    <div className="App">
      <div className="container">
        <Card>
          <CardHeader>Bible Book Club Kits</CardHeader>
          {!checkoutStarted ? (
            <CardBody>
              <div>
                {fetchInventoryItems.data.getInventoryItems.map((item) => {
                  return (
                    <div key={item.id}>
                      <Card>
                        <CardImg
                          top
                          width="100%"
                          src="/assets/318x180.svg"
                          alt={'Image for ' + item.name + ' book club kit'}
                        />
                        <CardBody>
                          <CardTitle tag="h5">{item.name}</CardTitle>
                          <CardSubtitle tag="h6" className="mb-2 text-muted">
                            {item.cost ? '$' + item.cost : 'FREE'}
                          </CardSubtitle>
                          <CardText>{item.description}</CardText>
                          {!!item.quantityInStock ? (
                            <Button
                              color={
                                !itemsInCart[item.id] ? 'primary' : 'danger'
                              }
                              onClick={() => onAddToCartClick(item)}
                              active={!!itemsInCart[item.id]}
                            >
                              {!itemsInCart[item.id] ? (
                                <>Add to Cart</>
                              ) : (
                                <>Remove from Cart</>
                              )}
                            </Button>
                          ) : (
                            <Button color="secondary" disabled={true}>
                              Out of Stock
                            </Button>
                          )}
                        </CardBody>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </CardBody>
          ) : (
            ''
          )}
        </Card>
        {!checkoutStarted ? (
          <Card>
            <CardHeader>Your Cart</CardHeader>
            <CardBody>
              <p>Selected: {JSON.stringify(itemsInCart)}</p>
              {Object.keys(itemsInCart).map((id) => {
                let item = itemsInCart[id]
                return (
                  <div key={item.code}>
                    <p>
                      {item.name +
                        '  ' +
                        (item.cost ? '$' + item.cost : 'FREE')}
                    </p>
                  </div>
                )
              })}
              {Object.keys(itemsInCart).length ? (
                <>
                  <p>Total: {!!totalCost ? '$' + totalCost : 'FREE'}</p>
                  {!checkoutStarted ? (
                    <Button
                      color="success"
                      onClick={() => startCheckout(itemsInCart)}
                    >
                      Checkout
                    </Button>
                  ) : (
                    ''
                  )}{' '}
                </>
              ) : (
                ''
              )}
            </CardBody>
          </Card>
        ) : (
          ''
        )}
        {checkoutStarted ? (
          <Card>
            <CardHeader>Checkout</CardHeader>
            <CardBody>
              <p>Selected: {JSON.stringify(itemsInCart)}</p>
              {Object.keys(itemsInCart).map((id) => {
                let item = itemsInCart[id]
                return (
                  <div key={item.code}>
                    <p>
                      {item.name +
                        '  ' +
                        (item.cost ? '$' + item.cost : 'FREE')}
                    </p>
                  </div>
                )
              })}
              {Object.keys(itemsInCart).length ? (
                <p>Total: {!!totalCost ? '$' + totalCost : 'FREE'}</p>
              ) : (
                ''
              )}
              {readyToConfirmPayment & !orderSuccessful ? (
                <form onSubmit={handleSubmit}>
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                  <Button color="success" disabled={!stripe}>
                    Confirm order
                  </Button>
                </form>
              ) : (
                ''
              )}
              {orderSuccessful ? (
                <div>
                  {' '}
                  <Alert color="success">Your order has been received!</Alert>
                  <Button color="success" onClick={resetEverything}>Continue Shopping</Button>
                </div>
              ) : (
                ''
              )}
            </CardBody>
          </Card>
        ) : (
          ''
        )}
      </div>
    </div>
  )
}

export default App
