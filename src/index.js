const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
require('dotenv').config({ path: './config.env' });

// Import GraphQL schema and resolvers
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./resolvers');

// Import database models and authentication utilities
const { sequelize } = require('./models');
const { getUser } = require('./utils/auth');

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync database models
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Database models synchronized');

    // Create Express application
    const app = express();

    // Enable CORS
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : ['http://localhost:3000', 'http://localhost:4000'],
      credentials: true
    }));

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        // Get user from authentication token
        const user = await getUser(req);
        return { user };
      },
      introspection: process.env.APOLLO_INTROSPECTION === 'true',
      playground: process.env.APOLLO_PLAYGROUND === 'true',
      formatError: (error) => {
        // Log error for debugging
        console.error('GraphQL Error:', error);
        
        // Return formatted error to client
        return {
          message: error.message,
          locations: error.locations,
          path: error.path,
        };
      }
    });

    // Start Apollo Server
    await server.start();

    // Apply Apollo Server middleware to Express
    server.applyMiddleware({ 
      app, 
      path: '/graphql',
      cors: false // CORS is handled by Express
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'OK',
        message: 'E-commerce GraphQL API is running',
        timestamp: new Date().toISOString()
      });
    });

    // Start HTTP server
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`📊 GraphQL Playground available at http://localhost:${PORT}${server.graphqlPath}`);
      console.log(`🔍 Health check available at http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer(); 