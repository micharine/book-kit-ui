import React, { useState } from 'react'
import './App.css'
import { useQuery } from '@apollo/react-hooks'
import {
    GET_INVENTORY,
    GET_ONE_INVENTORY_ITEM,
    EDIT_INVENTORY_ITEM,
} from './queries'
import {
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
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement } from '@stripe/react-stripe-js'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// TODO: Move Test Key to config file
const stripePromise = loadStripe(
    'pk_test_51HzKckFlyo65azYfF87FppYlDzQq7FXgNMZl7NLSSyJ9HMCY5i8iaRXRPsLNfs85os9lAUEANSQYtjZl00Yzdr6700grHrmrKo'
)

function App() {
    let [itemsInCart, setItemsInCart] = useState({})
    let [totalCost, setTotalCost] = useState(0);
    const fetchInventoryItems = useQuery(GET_INVENTORY)
    const getOneInventoryItem = useQuery(GET_ONE_INVENTORY_ITEM, {
        variables: { id: 1 },
    })

    // let inventoryItems = fetchInventoryItems.data.getInventoryItems;

    if (fetchInventoryItems.loading || getOneInventoryItem.loading)
        return <Spinner color="dark" />
    if (fetchInventoryItems.error || getOneInventoryItem.error) {
        console.log(fetchInventoryItems.error)
        console.log(getOneInventoryItem.error)
        return <React.Fragment> Error</React.Fragment>
    }

    const onAddToCartClick = ({id, name, cost, code}) => {
        let editedCart = {...itemsInCart};

        if (!itemsInCart[id]) {
            editedCart[id] = {
                    name: name,
                    cost: cost? cost : 0,
                    code: code,
            }
        } else {
            delete editedCart[id];
        }

        setItemsInCart(editedCart)
    }
    // TODO:
    //  Add Checkout (Stripe)
    //  Add Cart
    //  Update Inventory on Checkout
    //  Create order on Checkout
    //  IMAGES?

    // const updateInventoryItem = useQuery(EDIT_INVENTORY_ITEM, { variables: { id: 9, quantityInStock: 5 }});
    return (
        <Elements stripe={stripePromise}>
            <div className="App">
                <div className="container">
                    <Card>
                        <CardHeader>Bible Book Club Kits</CardHeader>
                        <CardBody>
                            <div>
                                {fetchInventoryItems.data.getInventoryItems.map(
                                    (item) => {
                                        return (
                                            <div key={item.id}>
                                                <Card>
                                                    <CardImg
                                                        top
                                                        width="100%"
                                                        src="/assets/318x180.svg"
                                                        alt={'Image for '+item.name+ ' book club kit'}
                                                    />
                                                    <CardBody>
                                                        <CardTitle tag="h5">
                                                            {item.name}
                                                        </CardTitle>
                                                        <CardSubtitle
                                                            tag="h6"
                                                            className="mb-2 text-muted"
                                                        >
                                                            {item.cost
                                                                ? '$' +
                                                                  item.cost
                                                                : 'FREE'}
                                                        </CardSubtitle>
                                                        <CardText>
                                                            {item.description}
                                                        </CardText>
                                                        {!!item.quantityInStock? <Button
                                                            color="primary"
                                                            onClick={() =>
                                                                onAddToCartClick(
                                                                    item
                                                                )
                                                            }
                                                            active={!!itemsInCart[item.id]}
                                                        >
                                                            Add to Cart
                                                        </Button> : 
                                                        <Button
                                                        color="secondary"
                                                        disabled = {true}
                                                    >
                                                        Out of Stock
                                                    </Button>}
                                                    </CardBody>
                                                </Card>
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                        </CardBody>
                    </Card>
                    <Card>
                        <CardHeader>Your Cart</CardHeader>
                        <CardBody>
                            <p>Selected: {JSON.stringify(itemsInCart)}</p>
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
                            <Button color="success">Checkout</Button>{' '}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </Elements>
    )
}

export default App
