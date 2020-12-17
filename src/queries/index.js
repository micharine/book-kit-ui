import { gql } from 'apollo-boost';

export const fetchInventoryItems = gql`
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

export const fetchOneInventoryItem = gql`
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

export const updateInventoryItem = gql`
  mutation($id: Int, $quantityInStock: Int) {
    updateInventoryItemInfo (id: $id, quantityInStock: $quantityInStock)
  }
`;

// TODO: Create Order with Stripe details
// export const createOrder = gql`
//   mutation($name: String, $email: String) {
//     createOrder (name: $name, email: $email)
//   }
// `;

// Not needed, but wanted to see the delet mutation example.
// export const deleteInventoryItem = gql`
//   mutation($id: Int) {
//     deleteInventoryItem(id: $id)
//   }
// `;

