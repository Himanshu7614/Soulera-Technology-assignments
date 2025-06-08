const { Op } = require('sequelize');
const { User, Product, Category, Order, OrderItem } = require('../models');
const { requireAuth, requireAdmin, requireOwnershipOrAdmin } = require('../utils/auth');

const queries = {
  // Get current authenticated user
  me: async (parent, args, { user }) => {
    return requireAuth(user);
  },

  // Get all users (admin only)
  users: async (parent, args, { user }) => {
    requireAdmin(user);
    return await User.findAll({
      order: [['createdAt', 'DESC']]
    });
  },

  // Get products with optional filtering
  products: async (parent, { filter, limit = 20, offset = 0 }) => {
    const whereClause = {};
    
    if (filter) {
      if (filter.categoryId) {
        whereClause.categoryId = filter.categoryId;
      }
      
      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        whereClause.price = {};
        if (filter.minPrice !== undefined) {
          whereClause.price[Op.gte] = filter.minPrice;
        }
        if (filter.maxPrice !== undefined) {
          whereClause.price[Op.lte] = filter.maxPrice;
        }
      }
      
      if (filter.searchTerm) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${filter.searchTerm}%` } },
          { description: { [Op.iLike]: `%${filter.searchTerm}%` } }
        ];
      }
    }

    return await Product.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category'
        }
      ],
      limit: Math.min(limit, 100), // Cap at 100 items
      offset,
      order: [['createdAt', 'DESC']]
    });
  },

  // Get single product by ID
  product: async (parent, { id }) => {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category'
        }
      ]
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  },

  // Get all categories
  categories: async () => {
    return await Category.findAll({
      include: [
        {
          model: Product,
          as: 'products'
        }
      ],
      order: [['name', 'ASC']]
    });
  },

  // Get single category by ID
  category: async (parent, { id }) => {
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products'
        }
      ]
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  },

  // Get orders (admin sees all, customers see only their own)
  orders: async (parent, args, { user }) => {
    const authenticatedUser = requireAuth(user);
    
    const whereClause = {};
    if (authenticatedUser.role !== 'ADMIN') {
      whereClause.userId = authenticatedUser.id;
    }

    return await Order.findAll({
      where: whereClause,
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
      ],
      order: [['createdAt', 'DESC']]
    });
  },

  // Get single order by ID
  order: async (parent, { id }, { user }) => {
    const order = await Order.findByPk(id, {
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

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user can access this order
    requireOwnershipOrAdmin(user, order.userId);

    return order;
  }
};

module.exports = queries; 