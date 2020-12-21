import React, { useState } from 'react'
import './App.css'
import { useMutation, useQuery } from '@apollo/react-hooks'
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
  // CardImg,
  CardText,
  CardTitle,
  CardSubtitle,
  Col,
  Container,
  Row,
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
  let [orderNumber, setOrderNumber] = useState('')
  let [checkoutStarted, setCheckoutStarted] = useState(false)
  let [readyToConfirmPayment, setReadyToConfirmPayment] = useState(false)
  let [orderSuccessful, setOrderSuccessful] = useState(false)
  let [paymentErrorMessage, setPaymentErrorMessage] = useState('')
  // TODO: I should probably put this elsewhere...
  let [clientSecret, setClientSecret] = useState('')
  const fetchInventoryItems = useQuery(GET_INVENTORY)
  const [createOrder, { data }] = useMutation(CREATE_ORDER)
  const getOneInventoryItem = useQuery(GET_ONE_INVENTORY_ITEM, {
    variables: { id: 1 },
  })
  // STRIPE CARD STUFF
  const stripe = useStripe()
  const elements = useElements()

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
        // default to 1 for now. TODO: Allow Customer to increase/decrease quantity
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

  // STRIPE CARD STUFF

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault()
    let firstName = document.getElementById('firstName').value
    let lastName = document.getElementById('lastName').value

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
          name: lastName + ', ' + firstName,
        },
      },
    })

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message)
      setPaymentErrorMessage(result.error.message)
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        // TODO: There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.

        // console.log(result.paymentIntent)
        Object.keys(itemsInCart).forEach((id) => {
          createOrder({
            variables: {
              inventoryItemCode: itemsInCart[id].code,
              quantityOrdered: itemsInCart[id].quantityOrdered,
              email: document.getElementById('email').value,
              firstName: document.getElementById('firstName').value,
              lastName: document.getElementById('lastName').value,
              transactionID: result.paymentIntent.id,
            },
          })
          // TODO: Update Inventory Items

          // let inventoryItems = fetchInventoryItems.data.getInventoryItems;
          // const updateInventoryItem = useQuery(EDIT_INVENTORY_ITEM, { variables: { id: 9, quantityInStock: 5 }});
        })

        setOrderNumber(result.paymentIntent.id)

        setPaymentErrorMessage('')
        // Show a success message to your customer

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

  const resetEverything = () => {
    setCheckoutStarted(false)
    setReadyToConfirmPayment(false)
    setOrderSuccessful(false)
    setItemsInCart({})
    setTotalCost(0)
    setClientSecret('')
    setPaymentErrorMessage('')
    setOrderNumber('')
  }

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
                        {/* <CardImg
                          top
                          width="100%"
                          src="/assets/318x180.svg"
                          alt={'Image for ' + item.name + ' book club kit'}
                        /> */}
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
              {/* <p>Selected: {JSON.stringify(itemsInCart)}</p> */}
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
            <CardHeader>Checkout Details</CardHeader>
            <CardBody>
              {/* <p>Selected: {JSON.stringify(itemsInCart)}</p> */}
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
                <p>
                  <strong>Total</strong>:{' '}
                  {!!totalCost ? '$' + totalCost : 'FREE'}
                </p>
              ) : (
                ''
              )}
              {readyToConfirmPayment & !orderSuccessful ? (
                <Card>
                  <form onSubmit={handleSubmit}>
                    <CardHeader>Payment Information</CardHeader>
                    <CardBody>
                      <Container>
                      <Row>
                        <Col fluid={true}>
                          <br></br>
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            placeholder='First Name'
                            required
                          ></input>
                        </Col>
                      </Row>
                      <Row>
                        <Col fluid={true}>
                        <br></br>
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            placeholder='Last Name'
                            required
                          ></input>
                        </Col>
                      </Row>
                      <Row>
                        <Col fluid={true}>
                        <br></br>
                          <input
                            type="text"
                            id="email"
                            name="email"
                            placeholder='Email Address'
                            required
                          ></input>
                        </Col>
                      </Row>
                      <Row>
                        <Col fluid={true}>
                        <br></br>
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  color: '#32325d',
                                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                                  fontSmoothing: 'antialiased',
                                  fontSize: '16px',
                                  '::placeholder': {
                                    color: '#6c757d'
                                  }
                                },
                                invalid: {
                                  color: '#fa755a',
                                  iconColor: '#fa755a'
                                }
                              },
                            }}
                          />
                        </Col>
                      </Row>
                      </Container>
                    </CardBody>

                    {paymentErrorMessage ? (
                      <>
                        <Alert color="danger">{paymentErrorMessage}</Alert>
                      </>
                    ) : (
                      ''
                    )}

                    <Button color="success" disabled={!stripe} style={{marginBottom:'20px'}}>
                      Confirm order
                    </Button>
                    <br></br>
                  </form>
                </Card>
              ) : (
                ''
              )}
              {orderSuccessful ? (
                <div>
                  {' '}
                  <Alert color="success">
                    Your order has been received! Your order number is{' '}
                    {orderNumber}
                  </Alert>
                  <Button color="success" onClick={resetEverything}>
                    Continue Shopping
                  </Button>
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
