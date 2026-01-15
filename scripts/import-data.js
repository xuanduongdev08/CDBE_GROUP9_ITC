const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plt_shop', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importProducts = async () => {
  try {
    // Tạo categories trước
    const categories = [
      { _id: new mongoose.Types.ObjectId(), name: 'Bàn phím' },
      { _id: new mongoose.Types.ObjectId(), name: 'Chuột' },
      { _id: new mongoose.Types.ObjectId(), name: 'Tai nghe' },
      { _id: new mongoose.Types.ObjectId(), name: 'Nguồn' },
      { _id: new mongoose.Types.ObjectId(), name: 'Card đồ họa' }
    ];

    // Xóa dữ liệu cũ
    await Product.deleteMany({});
    await Category.deleteMany({});

    // Lưu categories
    const savedCategories = await Category.insertMany(categories);
    const categoryMap = {
      1: savedCategories[0]._id,
      2: savedCategories[1]._id,
      3: savedCategories[2]._id,
      4: savedCategories[3]._id,
      5: savedCategories[4]._id
    };

    console.log('✓ Categories created');

    // Dữ liệu sản phẩm
    const products = [
      {
        category_id: categoryMap[1],
        name: 'Bàn phím cơ Logitech G213',
        description: 'Bàn phím cơ chính hãng Logitech',
        price: 1200000,
        stock: 18,
        image_url: 'img/phim1.png',
        created_at: new Date('2025-02-14')
      },
      {
        category_id: categoryMap[1],
        name: 'Bàn phím DareU EK87',
        description: 'Bàn phím cơ giá rẻ DareU',
        price: 650000,
        stock: 15,
        image_url: 'img/phim2.jpg',
        created_at: new Date('2025-05-20')
      },
      {
        category_id: categoryMap[2],
        name: 'Chuột Razer DeathAdder',
        description: 'Chuột gaming Razer',
        price: 850000,
        stock: 18,
        image_url: 'img/chuot1.jpg',
        created_at: new Date('2025-07-08')
      },
      {
        category_id: categoryMap[2],
        name: 'Chuột Logitech G102',
        description: 'Chuột gaming Logitech G102',
        price: 450000,
        stock: 24,
        image_url: 'img/chuot3.png',
        created_at: new Date('2025-09-15')
      },
      {
        category_id: categoryMap[3],
        name: 'Tai nghe HyperX Cloud II',
        description: 'Tai nghe chơi game HyperX',
        price: 1900000,
        stock: 0,
        image_url: 'img/tainghe1.jpg',
        created_at: new Date('2025-12-01')
      },
      {
        category_id: categoryMap[5],
        name: 'Card đồ họa MSI RTX 4060 Ti',
        description: 'VGA hiệu năng cao, phù hợp chơi game và đồ họa',
        price: 11500000,
        stock: 20,
        image_url: 'img/vga1.jpg',
        created_at: new Date('2025-10-10')
      },
      {
        category_id: categoryMap[5],
        name: 'Card đồ họa ASUS Dual RTX 4070',
        description: 'Card đồ họa ASUS 4070 hiệu năng mạnh mẽ',
        price: 16500000,
        stock: 7,
        image_url: 'img/vga2.jpg',
        created_at: new Date('2025-10-12')
      },
      {
        category_id: categoryMap[4],
        name: 'Nguồn Corsair CV550',
        description: 'Nguồn Corsair công suất 550W, hiệu suất cao',
        price: 1200000,
        stock: 0,
        image_url: 'img/nguon1.jpg',
        created_at: new Date('2025-09-25')
      },
      {
        category_id: categoryMap[4],
        name: 'Nguồn Cooler Master MWE 650W',
        description: 'Nguồn Cooler Master 650W chuẩn 80 Plus Bronze',
        price: 1450000,
        stock: 12,
        image_url: 'img/nguon2.jpg',
        created_at: new Date('2025-09-30')
      },
      {
        category_id: categoryMap[2],
        name: 'Chuột Logitech G502 Hero',
        description: 'Chuột chơi game Logitech G502 Hero cảm biến HERO 25K',
        price: 1250000,
        stock: 15,
        image_url: 'img/chuot5.png',
        created_at: new Date('2025-03-18')
      },
      {
        category_id: categoryMap[2],
        name: 'Chuột Razer Viper Mini',
        description: 'Chuột gaming siêu nhẹ Razer Viper Mini có đèn RGB',
        price: 890000,
        stock: 18,
        image_url: 'img/chuot6.png',
        created_at: new Date('2025-04-10')
      },
      {
        category_id: categoryMap[2],
        name: 'Chuột DareU EM908',
        description: 'Chuột chơi game DareU EM908 hiệu năng ổn, giá rẻ',
        price: 390000,
        stock: 25,
        image_url: 'img/chuot7.jpg',
        created_at: new Date('2025-05-05')
      },
      {
        category_id: categoryMap[2],
        name: 'Chuột Logitech M331 Silent',
        description: 'Chuột không dây Logitech M331 yên tĩnh, tiết kiệm pin',
        price: 550000,
        stock: 29,
        image_url: 'img/chuot8.png',
        created_at: new Date('2025-06-12')
      },
      {
        category_id: categoryMap[2],
        name: 'Chuột Fuhlen G90 Pro',
        description: 'Chuột gaming Fuhlen G90 Pro cảm biến chính xác, đèn LED',
        price: 690000,
        stock: 19,
        image_url: 'img/chuot9.png',
        created_at: new Date('2025-07-28')
      }
    ];

    // Nhập sản phẩm
    await Product.insertMany(products);
    console.log(`✓ ${products.length} products imported successfully!`);

  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
};

// Chạy import
connectDB().then(() => {
  importProducts();
});
