const { GraphQLScalarType, GraphQLError } = require('graphql');
const { Kind } = require('graphql/language');

// Custom DateTime scalar type
const DateTime = new GraphQLScalarType({
  name: 'DateTime',
  description: 'Date custom scalar type',
  serialize(value) {
    // Convert outgoing Date to ISO string for JSON
    return value instanceof Date ? value.toISOString() : null;
  },
  parseValue(value) {
    // Convert incoming ISO string to Date
    return new Date(value);
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      // Convert hard-coded AST string to Date
      return new Date(ast.value);
    }
    // Invalid hard-coded value (not a string)
    throw new GraphQLError(`Can only parse strings to dates but got a: ${ast.kind}`, [ast]);
  }
});

const fieldResolvers = {
  DateTime,
  
  User: {
    fullName: (parent) => {
      return `${parent.firstName} ${parent.lastName}`;
    },
    orders: async (parent) => {
      // This will be resolved by the association
      return parent.orders || [];
    }
  },

  Category: {
    products: async (parent) => {
      // This will be resolved by the association
      return parent.products || [];
    }
  },

  Product: {
    category: async (parent) => {
      // This will be resolved by the association
      return parent.category;
    }
  },

  Order: {
    user: async (parent) => {
      // This will be resolved by the association  
      return parent.user;
    },
    items: async (parent) => {
      // This will be resolved by the association
      return parent.items || [];
    }
  },

  OrderItem: {
    order: async (parent) => {
      // This will be resolved by the association
      return parent.order;
    },
    product: async (parent) => {
      // This will be resolved by the association
      return parent.product;
    },
    subtotal: (parent) => {
      // Calculate subtotal as quantity * unitPrice
      return parseFloat(parent.quantity) * parseFloat(parent.unitPrice);
    }
  }
};

module.exports = fieldResolvers; 