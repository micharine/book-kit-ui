import { gql } from 'apollo-boost';

export const GET_INVENTORY = gql`
  {
    getInventoryItems {
        id,
        name,
        description,
        code,
        cost,
        quantityInStock,
      }
  }
`;

export const GET_ONE_INVENTORY_ITEM = gql`
  query ($id: Int){
    getInventoryItemInfo(id: $id) {
        name,
        description,
        code,
        cost,
        quantityInStock,
      }
  }
`;

export const EDIT_INVENTORY_ITEM = gql`
  mutation($id: Int, $quantityInStock: Int) {
    updateInventoryItemInfo (id: $id, quantityInStock: $quantityInStock)
  }
`;

// TODO: Create Order with Stripe details
export const CREATE_ORDER = gql`
mutation CreateOrder($inventoryItemCode: String,
  $quantityOrdered: Int,
  $customerID: String,
  $transactionID:String,){
  createOrder(
    inventoryItemCode: $inventoryItemCode,
    quantityOrdered: $quantityOrdered,
    customerID: $customerID,
    transactionID: $transactionID,
  )
}
`;

// example
// import { gql, useMutation } from '@apollo/client';

// const ADD_TODO = gql`
// mutation AddTodo($type: String!) {
//   addTodo(type: $type) {
//     id
//     type
//   }
// }
// `;


// Not needed, but wanted to see the delete mutation example.
// export const DELETE_INVENTORY_ITEM = gql`
//   mutation($id: Int) {
//     deleteInventoryItem(id: $id)
//   }
// `;

