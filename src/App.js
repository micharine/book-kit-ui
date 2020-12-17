import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useQuery } from '@apollo/react-hooks';
import {
    fetchInventoryItems,
    fetchOneInventoryItem,
    updateInventoryItem,
} from './queries';
import { Card, CardBody, CardHeader, CardSubtitle, Spinner } from 'reactstrap';
function App() {

  const getAllInventoryItems = useQuery(fetchInventoryItems);
  const getOneInventoryItem = useQuery(fetchOneInventoryItem, {variables: {id: 1}});
  if (getAllInventoryItems.loading || getOneInventoryItem.loading) return <Spinner color="dark"/>
   if (getAllInventoryItems.error || getOneInventoryItem.error) {
    console.log(getAllInventoryItems.error);
    console.log(getOneInventoryItem.error);
    return <React.Fragment> Error</React.Fragment>
   }

// const editInventoryItem = useQuery(updateInventoryItem, { variables: { id: 9, quantityInStock: 5 }});
  return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.js</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
            <div className="container">
                <Card>
                    <CardHeader>Bible Book Club Kits</CardHeader>
                    <CardBody>
                        <pre>{JSON.stringify(getAllInventoryItems.data, null, 2)}</pre>
                    </CardBody>
                </Card>
                <Card>
                    <CardHeader>Query - Displaying data with args</CardHeader>
                    <CardBody>
                        <CardSubtitle>Viewing a user by id</CardSubtitle>
                        <pre>{JSON.stringify(getOneInventoryItem.data, null, 2)}</pre>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}

export default App;
