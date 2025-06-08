const { sequelize, User, Category, Product } = require('../models');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@ecommerce.com' },
      defaults: {
        email: 'admin@ecommerce.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    });

    // Create customer user
    const customerUser = await User.findOrCreate({
      where: { email: 'customer@example.com' },
      defaults: {
        email: 'customer@example.com',
        password: 'customer123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CUSTOMER'
      }
    });

    console.log('✅ Users created');

    // Create categories
    const categories = [
      {
        name: 'Electronics',
        description: 'Electronic devices and accessories'
      },
      {
        name: 'Clothing',
        description: 'Fashion and apparel items'
      },
      {
        name: 'Books',
        description: 'Books and educational materials'
      },
      {
        name: 'Home & Garden',
        description: 'Home improvement and garden supplies'
      },
      {
        name: 'Sports & Outdoors',
        description: 'Sports equipment and outdoor gear'
      }
    ];

    const createdCategories = [];
    for (const categoryData of categories) {
      const [category] = await Category.findOrCreate({
        where: { name: categoryData.name },
        defaults: categoryData
      });
      createdCategories.push(category);
    }

    console.log('✅ Categories created');

    // Create products
    const products = [
      // Electronics
      {
        name: 'iPhone 15 Pro',
        description: 'Latest Apple iPhone with advanced features',
        price: 999.99,
        inventory: 50,
        categoryId: createdCategories[0].id
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Premium Android smartphone',
        price: 899.99,
        inventory: 30,
        categoryId: createdCategories[0].id
      },
      {
        name: 'MacBook Pro M3',
        description: 'Professional laptop for creative work',
        price: 1999.99,
        inventory: 20,
        categoryId: createdCategories[0].id
      },
      {
        name: 'Sony WH-1000XM5',
        description: 'Noise cancelling wireless headphones',
        price: 349.99,
        inventory: 100,
        categoryId: createdCategories[0].id
      },

      // Clothing
      {
        name: 'Levi\'s 501 Jeans',
        description: 'Classic straight-fit jeans',
        price: 89.99,
        inventory: 75,
        categoryId: createdCategories[1].id
      },
      {
        name: 'Nike Air Force 1',
        description: 'Iconic basketball sneakers',
        price: 120.00,
        inventory: 60,
        categoryId: createdCategories[1].id
      },
      {
        name: 'Adidas Hoodie',
        description: 'Comfortable cotton hoodie',
        price: 65.00,
        inventory: 40,
        categoryId: createdCategories[1].id
      },

      // Books
      {
        name: 'The Great Gatsby',
        description: 'Classic American novel by F. Scott Fitzgerald',
        price: 12.99,
        inventory: 200,
        categoryId: createdCategories[2].id
      },
      {
        name: 'Clean Code',
        description: 'A handbook of agile software craftsmanship',
        price: 45.99,
        inventory: 80,
        categoryId: createdCategories[2].id
      },
      {
        name: 'Atomic Habits',
        description: 'An easy & proven way to build good habits',
        price: 18.99,
        inventory: 150,
        categoryId: createdCategories[2].id
      },

      // Home & Garden
      {
        name: 'Dyson V15 Vacuum',
        description: 'Cordless stick vacuum with laser detection',
        price: 749.99,
        inventory: 25,
        categoryId: createdCategories[3].id
      },
      {
        name: 'Instant Pot Duo',
        description: '7-in-1 electric pressure cooker',
        price: 99.99,
        inventory: 45,
        categoryId: createdCategories[3].id
      },

      // Sports & Outdoors
      {
        name: 'Yeti Rambler Tumbler',
        description: 'Insulated stainless steel tumbler',
        price: 34.99,
        inventory: 120,
        categoryId: createdCategories[4].id
      },
      {
        name: 'REI Co-op Tent',
        description: '4-person camping tent',
        price: 249.99,
        inventory: 15,
        categoryId: createdCategories[4].id
      },
      {
        name: 'Wilson Basketball',
        description: 'Official size basketball',
        price: 29.99,
        inventory: 80,
        categoryId: createdCategories[4].id
      }
    ];

    for (const productData of products) {
      await Product.findOrCreate({
        where: { 
          name: productData.name,
          categoryId: productData.categoryId 
        },
        defaults: productData
      });
    }

    console.log('✅ Products created');
    console.log('🎉 Database seeding completed successfully!');
    
    // Print summary
    const userCount = await User.count();
    const categoryCount = await Category.count();
    const productCount = await Product.count();
    
    console.log('\n📊 Database Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Categories: ${categoryCount}`);
    console.log(`- Products: ${productCount}`);
    
    console.log('\n🔐 Test Accounts:');
    console.log('Admin: admin@ecommerce.com / admin123');
    console.log('Customer: customer@example.com / customer123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedData; 