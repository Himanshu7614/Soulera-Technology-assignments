const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # Scalar types
  scalar DateTime

  # Enums
  enum UserRole {
    ADMIN
    CUSTOMER
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  # Types
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    role: UserRole!
    orders: [Order!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    products: [Product!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    inventory: Int!
    category: Category!
    categoryId: ID!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Order {
    id: ID!
    user: User!
    userId: ID!
    status: OrderStatus!
    totalAmount: Float!
    items: [OrderItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    order: Order!
    product: Product!
    quantity: Int!
    unitPrice: Float!
    subtotal: Float!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  # Input Types
  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input ProductFilterInput {
    categoryId: ID
    minPrice: Float
    maxPrice: Float
    searchTerm: String
  }

  input CreateProductInput {
    name: String!
    description: String
    price: Float!
    inventory: Int!
    categoryId: ID!
  }

  input UpdateProductInput {
    name: String
    description: String
    price: Float
    inventory: Int
    categoryId: ID
  }

  input CreateCategoryInput {
    name: String!
    description: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
  }

  input CreateOrderInput {
    items: [OrderItemInput!]!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  # Response Types
  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    # Auth
    me: User

    # Users (Admin only)
    users: [User!]!

    # Products
    products(filter: ProductFilterInput, limit: Int, offset: Int): [Product!]!
    product(id: ID!): Product

    # Categories
    categories: [Category!]!
    category(id: ID!): Category

    # Orders
    orders: [Order!]!
    order(id: ID!): Order
  }

  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Products (Admin only)
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Categories (Admin only)
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!

    # Orders
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
  }
`;

module.exports = typeDefs; 