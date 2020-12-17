import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { useQuery } from '@apollo/react-hooks';
import {
    GET_INVENTORY,
    GET_ONE_INVENTORY_ITEM,
    EDIT_INVENTORY_ITEM,
} from './queries';
import {
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Spinner,
} from 'reactstrap';
function App() {
    const fetchInventoryItems = useQuery(GET_INVENTORY);
    const getOneInventoryItem = useQuery(GET_ONE_INVENTORY_ITEM, {
        variables: { id: 1 },
    });

    // let inventoryItems = fetchInventoryItems.data.getInventoryItems;
    const [cSelected, setCSelected] = useState([]);

    if (fetchInventoryItems.loading || getOneInventoryItem.loading)
        return <Spinner color="dark" />;
    if (fetchInventoryItems.error || getOneInventoryItem.error) {
        console.log(fetchInventoryItems.error);
        console.log(getOneInventoryItem.error);
        return <React.Fragment> Error</React.Fragment>;
    }

    const onCheckboxBtnClick = (selected) => {
        const index = cSelected.indexOf(selected);
        if (index < 0) {
            cSelected.push(selected);
        } else {
            cSelected.splice(index, 1);
        }
        setCSelected([...cSelected]);
    };
// TODO: 
//  Add Checkout (Stripe)
//  Add Cart
//  Update Inventory on Checkout
//  Create order on Checkout

    // const updateInventoryItem = useQuery(EDIT_INVENTORY_ITEM, { variables: { id: 9, quantityInStock: 5 }});
    return (
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
                                                <p >{item.name}</p>
                                                <Button
                                                    color="primary"
                                                    onClick={() =>
                                                        onCheckboxBtnClick(item.id)
                                                    }
                                                    active={cSelected.includes(
                                                        item.id
                                                    )}
                                                >
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        );
                                    }
                                )}
                            <p>Selected: {JSON.stringify(cSelected)}</p>
                            <Button color="success">Checkout</Button>{' '}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

export default App;
