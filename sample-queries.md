# Sample GraphQL Queries

This file contains sample GraphQL queries and mutations for testing the e-commerce API.

## Authentication

### 1. Register a new user
```graphql
mutation RegisterUser {
  register(input: {
    email: "test@example.com"
    password: "password123"
    firstName: "Test"
    lastName: "User"
  }) {
    token
    user {
      id
      email
      firstName
      lastName
      fullName
      role
      createdAt
    }
  }
}
```

### 2. Login
```graphql
mutation LoginUser {
  login(input: {
    email: "admin@ecommerce.com"
    password: "admin123"
  }) {
    token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

### 3. Get current user (requires authentication)
```graphql
query GetMe {
  me {
    id
    email
    firstName
    lastName
    fullName
    role
    orders {
      id
      status
      totalAmount
    }
    createdAt
  }
}
```

## Categories

### 4. Get all categories
```graphql
query GetCategories {
  categories {
    id
    name
    description
    products {
      id
      name
      price
      inventory
    }
    createdAt
  }
}
```

### 5. Get single category
```graphql
query GetCategory($id: ID!) {
  category(id: $id) {
    id
    name
    description
    products {
      id
      name
      price
      inventory
    }
  }
}
```

### 6. Create category (admin only)
```graphql
mutation CreateCategory {
  createCategory(input: {
    name: "Gaming"
    description: "Gaming products and accessories"
  }) {
    id
    name
    description
    createdAt
  }
}
```

## Products

### 7. Get all products
```graphql
query GetProducts {
  products {
    id
    name
    description
    price
    inventory
    category {
      id
      name
    }
    createdAt
  }
}
```

### 8. Get products with filtering
```graphql
query GetFilteredProducts {
  products(
    filter: {
      categoryId: "category-uuid-here"
      minPrice: 50
      maxPrice: 200
      searchTerm: "phone"
    }
    limit: 10
    offset: 0
  ) {
    id
    name
    description
    price
    inventory
    category {
      id
      name
    }
  }
}
```

### 9. Get single product
```graphql
query GetProduct($id: ID!) {
  product(id: $id) {
    id
    name
    description
    price
    inventory
    category {
      id
      name
      description
    }
    createdAt
    updatedAt
  }
}
```

### 10. Create product (admin only)
```graphql
mutation CreateProduct {
  createProduct(input: {
    name: "iPhone 15"
    description: "Latest iPhone model"
    price: 999.99
    inventory: 100
    categoryId: "electronics-category-id"
  }) {
    id
    name
    description
    price
    inventory
    category {
      id
      name
    }
    createdAt
  }
}
```

### 11. Update product (admin only)
```graphql
mutation UpdateProduct($id: ID!) {
  updateProduct(
    id: $id
    input: {
      name: "iPhone 15 Pro Max"
      price: 1199.99
      inventory: 50
    }
  ) {
    id
    name
    description
    price
    inventory
    category {
      name
    }
    updatedAt
  }
}
```

### 12. Delete product (admin only)
```graphql
mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id)
}
```

## Orders

### 13. Create order (authenticated users)
```graphql
mutation CreateOrder {
  createOrder(input: {
    items: [
      {
        productId: "product-uuid-1"
        quantity: 2
      },
      {
        productId: "product-uuid-2"
        quantity: 1
      }
    ]
  }) {
    id
    status
    totalAmount
    user {
      id
      firstName
      lastName
    }
    items {
      id
      quantity
      unitPrice
      subtotal
      product {
        id
        name
        category {
          name
        }
      }
    }
    createdAt
  }
}
```

### 14. Get orders
```graphql
query GetOrders {
  orders {
    id
    status
    totalAmount
    user {
      id
      firstName
      lastName
      email
    }
    items {
      id
      quantity
      unitPrice
      subtotal
      product {
        id
        name
        category {
          name
        }
      }
    }
    createdAt
    updatedAt
  }
}
```

### 15. Get single order
```graphql
query GetOrder($id: ID!) {
  order(id: $id) {
    id
    status
    totalAmount
    user {
      id
      firstName
      lastName
      email
    }
    items {
      id
      quantity
      unitPrice
      subtotal
      product {
        id
        name
        description
        category {
          name
        }
      }
    }
    createdAt
    updatedAt
  }
}
```

### 16. Update order status (admin only)
```graphql
mutation UpdateOrderStatus($id: ID!) {
  updateOrderStatus(
    id: $id
    status: PROCESSING
  ) {
    id
    status
    totalAmount
    user {
      firstName
      lastName
    }
    updatedAt
  }
}
```

## Admin Queries

### 17. Get all users (admin only)
```graphql
query GetAllUsers {
  users {
    id
    email
    firstName
    lastName
    fullName
    role
    orders {
      id
      status
      totalAmount
    }
    createdAt
  }
}
```

## Variables Examples

When testing these queries, you can use variables. Here are some examples:

### For GetProduct:
```json
{
  "id": "your-product-uuid-here"
}
```

### For GetCategory:
```json
{
  "id": "your-category-uuid-here"
}
```

### For UpdateProduct:
```json
{
  "id": "your-product-uuid-here"
}
```

### For UpdateOrderStatus:
```json
{
  "id": "your-order-uuid-here"
}
```

## Testing Headers

For authenticated requests, include the Authorization header:

```json
{
  "Authorization": "Bearer your-jwt-token-here"
}
```

## Response Examples

### Successful Login Response:
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "uuid-here",
        "email": "admin@ecommerce.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "ADMIN"
      }
    }
  }
}
```

### Error Response:
```json
{
  "errors": [
    {
      "message": "You must be logged in to perform this action",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": [
        "me"
      ]
    }
  ],
  "data": {
    "me": null
  }
}
``` 