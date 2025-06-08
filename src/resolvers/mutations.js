const { sequelize, User, Product, Category, Order, OrderItem } = require('../models');
const { generateToken, requireAuth, requireAdmin } = require('../utils/auth');
const { 
  validateRegisterInput, 
  validateProductInput, 
  validateCategoryInput, 
  validateOrderInput 
} = require('../utils/validation');

const mutations = {
  // User registration
  register: async (parent, { input }) => {
    // Validate input
    const { isValid, errors } = validateRegisterInput(input);
    if (!isValid) {
      throw new Error(`Validation error: ${errors.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email: input.email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    try {
      // Create user
      const user = await User.create({
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName
      });

      // Generate token
      const token = generateToken(user.id);

      return {
        token,
        user
      };
    } catch (error) {
      throw new Error('Failed to create user: ' + error.message);
    }
  },

  // User login
  login: async (parent, { input }) => {
    // Find user by email
    const user = await User.findOne({ where: { email: input.email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Validate password
    const isValidPassword = await user.validatePassword(input.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id);

    return {
      token,
      user
    };
  },

  // Create product (admin only)
  createProduct: async (parent, { input }, { user }) => {
    requireAdmin(user);

    // Validate input
    const { isValid, errors } = validateProductInput(input);
    if (!isValid) {
      throw new Error(`Validation error: ${errors.join(', ')}`);
    }

    // Check if category exists
    const category = await Category.findByPk(input.categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    try {
      const product = await Product.create(input);
      
      // Return product with category
      return await Product.findByPk(product.id, {
        include: [
          {
            model: Category,
            as: 'category'
          }
        ]
      });
    } catch (error) {
      throw new Error('Failed to create product: ' + error.message);
    }
  },

  // Update product (admin only)
  updateProduct: async (parent, { id, input }, { user }) => {
    requireAdmin(user);

    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Validate input if provided
    if (Object.keys(input).length === 0) {
      throw new Error('No update data provided');
    }

    // If categoryId is being updated, check if it exists
    if (input.categoryId) {
      const category = await Category.findByPk(input.categoryId);
      if (!category) {
        throw new Error('Category not found');
      }
    }

    try {
      await product.update(input);
      
      // Return updated product with category
      return await Product.findByPk(product.id, {
        include: [
          {
            model: Category,
            as: 'category'
          }
        ]
      });
    } catch (error) {
      throw new Error('Failed to update product: ' + error.message);
    }
  },

  // Delete product (admin only)
  deleteProduct: async (parent, { id }, { user }) => {
    requireAdmin(user);

    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      throw new Error('Product not found');
    }

    try {
      await product.destroy();
      return true;
    } catch (error) {
      throw new Error('Failed to delete product: ' + error.message);
    }
  },

  // Create category (admin only)
  createCategory: async (parent, { input }, { user }) => {
    requireAdmin(user);

    // Validate input
    const { isValid, errors } = validateCategoryInput(input);
    if (!isValid) {
      throw new Error(`Validation error: ${errors.join(', ')}`);
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ where: { name: input.name } });
    if (existingCategory) {
      throw new Error('Category with this name already exists');
    }

    try {
      return await Category.create(input);
    } catch (error) {
      throw new Error('Failed to create category: ' + error.message);
    }
  },

  // Update category (admin only)
  updateCategory: async (parent, { id, input }, { user }) => {
    requireAdmin(user);

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if new name already exists (if name is being updated)
    if (input.name && input.name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name: input.name } });
      if (existingCategory) {
        throw new Error('Category with this name already exists');
      }
    }

    try {
      await category.update(input);
      return category;
    } catch (error) {
      throw new Error('Failed to update category: ' + error.message);
    }
  },

  // Create order (authenticated users)
  createOrder: async (parent, { input }, { user }) => {
    const authenticatedUser = requireAuth(user);

    // Validate input
    const { isValid, errors } = validateOrderInput(input);
    if (!isValid) {
      throw new Error(`Validation error: ${errors.join(', ')}`);
    }

    const transaction = await sequelize.transaction();

    try {
      let totalAmount = 0;
      const orderItems = [];

      // Validate products and calculate total
      for (const item of input.items) {
        const product = await Product.findByPk(item.productId, { transaction });
        if (!product) {
          await transaction.rollback();
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        // Check inventory
        if (product.inventory < item.quantity) {
          await transaction.rollback();
          throw new Error(`Insufficient inventory for product ${product.name}. Available: ${product.inventory}, Requested: ${item.quantity}`);
        }

        const itemTotal = parseFloat(product.price) * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          product: product
        });
      }

      // Create order
      const order = await Order.create({
        userId: authenticatedUser.id,
        totalAmount: totalAmount.toFixed(2),
        status: 'PENDING'
      }, { transaction });

      // Create order items and update inventory
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }, { transaction });

        // Update product inventory
        await item.product.update({
          inventory: item.product.inventory - item.quantity
        }, { transaction });
      }

      await transaction.commit();

      // Return order with all related data
      return await Order.findByPk(order.id, {
        include: [
          {
            model: User,
            as: 'user'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [
                  {
                    model: Category,
                    as: 'category'
                  }
                ]
              }
            ]
          }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw new Error('Failed to create order: ' + error.message);
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (parent, { id, status }, { user }) => {
    requireAdmin(user);

    // Find order
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    try {
      await order.update({ status });

      // Return updated order with all related data
      return await Order.findByPk(order.id, {
        include: [
          {
            model: User,
            as: 'user'
          },
          {
            model: OrderItem,
            as: 'items',
            include: [
              {
                model: Product,
                as: 'product',
                include: [
                  {
                    model: Category,
                    as: 'category'
                  }
                ]
              }
            ]
          }
        ]
      });
    } catch (error) {
      throw new Error('Failed to update order status: ' + error.message);
    }
  }
};

module.exports = mutations; 