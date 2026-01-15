-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 11, 2025 at 06:48 AM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `plt_shop`
--

-- --------------------------------------------------------

--
-- Table structure for table `addresses`
--

CREATE TABLE `addresses` (
  `address_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `recipient_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address_line` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `addresses`
--

INSERT INTO `addresses` (`address_id`, `user_id`, `recipient_name`, `phone`, `address_line`, `city`, `province`, `postal_code`) VALUES
(1, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(2, 2, 'Trần Thị B', '0987654321', '456 Trần Hưng Đạo', 'Hồ Chí Minh', 'TPHCM', '700000'),
(3, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(4, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(5, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(6, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(7, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(8, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(9, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(10, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(11, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(12, 3, 'Trần Văn C', '0912345678', '12 Trịnh Đình Thảo', 'Hồ Chí Minh', 'Tân Phú', ''),
(13, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(14, 3, 'Trần Văn C', '0912345678', '12 Trịnh Đình Thảo', 'Hồ Chí Minh', 'Tân Phú', ''),
(15, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(16, 3, 'Trần Văn C', '0912345678', '12 Trịnh Đình Thảo', 'Hồ Chí Minh', 'Tân Phú', ''),
(17, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(18, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(19, 3, 'Trần Văn C', '0912345678', '12 Trịnh Đình Thảo', 'Hồ Chí Minh', 'Tân Phú', ''),
(20, 3, 'Trần Văn C', '0912345678', '12 Trịnh Đình Thảo', 'Hồ Chí Minh', 'Tân Phú', ''),
(21, 1, 'Nguyễn Văn A', '0912345678', '123 Lê Lợi', 'Hà Nội', 'Hà Nội', '100000'),
(22, 3, 'Trần Văn C', '0912345678', '12 Trịnh Đình Thảo', 'Hồ Chí Minh', 'Tân Phú', '');

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`admin_id`, `username`, `password`, `full_name`, `created_at`) VALUES
(1, 'admin1', 'a365dcad36da235282c66ed791eb13f3', 'Nguyễn Đăng Khôi', '2025-10-14 07:46:54'),
(2, 'admin2', 'e10adc3949ba59abbe56e057f20f883e', 'Nguyễn Trần Gia Kiệt', '2025-10-16 07:32:39'),
(3, 'admin3', 'fcea920f7412b5da7be0cf42b8c93759', 'Nguyễn Xuân Dương', '2025-10-16 07:37:19');

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `cart_id` int NOT NULL,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('active','converted','abandoned') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`cart_id`, `user_id`, `created_at`, `status`) VALUES
(1, 1, '2025-10-07 09:40:08', 'active'),
(2, 2, '2025-10-07 09:40:08', 'active'),
(3, 3, '2025-10-29 02:09:37', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` int NOT NULL,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`cart_item_id`, `cart_id`, `product_id`, `quantity`, `added_at`) VALUES
(1, 1, 1, 2, '2025-10-07 09:40:08'),
(2, 2, 3, 1, '2025-10-07 09:40:08');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `description`, `created_at`) VALUES
(1, 'Bàn phím', 'Các loại bàn phím cơ, giả cơ, văn phòng', '2025-10-07 09:40:08'),
(2, 'Chuột', 'Chuột chơi game, chuột văn phòng', '2025-10-07 09:40:08'),
(3, 'Tai nghe', 'Tai nghe gaming, tai nghe không dây', '2025-10-07 09:40:08'),
(4, 'Nguồn máy tính', 'Nguồn công suất thực, hiệu suất cao cho PC gaming và văn phòng', '2025-10-23 08:57:59'),
(5, 'Card đồ họa VGA', 'Các loại card đồ họa cho gaming, đồ họa và workstation', '2025-10-23 08:57:59');

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `contact_id` int NOT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('Chưa xử lý','Đang xử lý','Đã phản hồi') COLLATE utf8mb4_unicode_ci DEFAULT 'Chưa xử lý'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact`
--

INSERT INTO `contact` (`contact_id`, `full_name`, `email`, `subject`, `message`, `created_at`, `status`) VALUES
(1, 'Nguyễn Văn A', 'vana@example.com', 'Hỏi về khuyến mãi', 'Tôi muốn hỏi về chương trình khuyến mãi gà rán cuối tuần.', '2025-10-21 06:51:19', 'Chưa xử lý'),
(2, 'Trần Văn C', 'vanc@gmail.com', 'sale', 'giảm giá đi', '2025-11-04 07:26:30', 'Chưa xử lý'),
(3, 'Trần Văn C', 'vanc@gmail.com', 'sale', 'giảm giá đi', '2025-11-04 07:27:50', 'Chưa xử lý');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `cart_id` int DEFAULT NULL,
  `address_id` int DEFAULT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_method_id` int DEFAULT NULL,
  `payment_status` enum('unpaid','paid','refunded') DEFAULT 'unpaid',
  `shipping_method` varchar(100) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `processed_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `cart_id`, `address_id`, `order_date`, `status`, `payment_method_id`, `payment_status`, `shipping_method`, `total_amount`, `processed_by`) VALUES
(1, 1, 1, 1, '2025-10-07 09:40:08', 'shipped', 1, 'unpaid', NULL, 2400000.00, NULL),
(2, 1, NULL, 4, '2025-10-21 09:36:27', 'processing', 1, 'unpaid', NULL, 900000.00, NULL),
(3, 1, NULL, 5, '2025-10-21 09:41:26', 'delivered', 1, 'unpaid', NULL, 450000.00, NULL),
(4, 1, NULL, 6, '2025-10-22 03:01:06', 'processing', 1, 'unpaid', NULL, 1900000.00, NULL),
(5, 1, NULL, 7, '2025-10-22 03:02:45', 'cancelled', 1, 'unpaid', NULL, 1900000.00, NULL),
(6, 1, NULL, 8, '2025-10-22 03:04:23', 'pending', 1, 'unpaid', NULL, 1900000.00, NULL),
(7, 1, NULL, 9, '2025-10-22 03:06:49', 'pending', 1, 'unpaid', NULL, 1900000.00, NULL),
(8, 1, NULL, 10, '2025-10-22 03:08:43', 'pending', 1, 'unpaid', NULL, 450000.00, NULL),
(9, 1, NULL, 11, '2025-10-22 03:12:57', 'shipped', 1, 'unpaid', NULL, 450000.00, NULL),
(10, 3, NULL, 12, '2025-10-28 01:57:33', 'pending', 1, 'unpaid', NULL, 1700000.00, NULL),
(11, 1, NULL, 13, '2025-10-29 01:40:32', 'cancelled', 1, 'unpaid', NULL, 28500000.00, NULL),
(12, 3, NULL, 14, '2025-10-29 02:10:17', 'cancelled', 1, 'unpaid', NULL, 66000000.00, NULL),
(13, 1, NULL, 15, '2025-10-29 03:18:13', 'pending', 1, 'unpaid', NULL, 2400000.00, NULL),
(14, 3, NULL, 16, '2025-10-29 04:33:29', 'pending', 1, 'unpaid', NULL, 11500000.00, NULL),
(15, 1, NULL, 17, '2025-11-04 02:53:10', 'pending', 1, 'unpaid', NULL, 16500000.00, NULL),
(16, 1, NULL, 18, '2025-11-04 03:30:34', 'pending', 1, 'unpaid', NULL, 690000.00, NULL),
(17, 3, NULL, 19, '2025-11-04 06:28:28', 'pending', 1, 'unpaid', NULL, 11500000.00, NULL),
(18, 3, NULL, 20, '2025-11-04 06:31:56', 'pending', 1, 'unpaid', NULL, 16500000.00, NULL),
(19, 1, NULL, 21, '2025-11-04 06:41:22', 'pending', 1, 'unpaid', NULL, 550000.00, NULL),
(20, 3, NULL, 22, '2025-11-04 09:46:50', 'pending', 1, 'unpaid', NULL, 16500000.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 2, 1200000.00),
(2, 2, 4, 2, 450000.00),
(3, 3, 4, 1, 450000.00),
(4, 4, 5, 1, 1900000.00),
(5, 5, 5, 1, 1900000.00),
(6, 6, 5, 1, 1900000.00),
(7, 7, 5, 1, 1900000.00),
(8, 8, 4, 1, 450000.00),
(9, 9, 4, 1, 450000.00),
(10, 10, 3, 2, 850000.00),
(11, 11, 1, 10, 1200000.00),
(12, 11, 7, 1, 16500000.00),
(13, 12, 7, 4, 16500000.00),
(14, 13, 1, 2, 1200000.00),
(15, 14, 6, 1, 11500000.00),
(16, 15, 7, 1, 16500000.00),
(17, 16, 44, 1, 690000.00),
(18, 17, 6, 1, 11500000.00),
(19, 18, 7, 1, 16500000.00),
(20, 19, 43, 1, 550000.00),
(21, 20, 7, 1, 16500000.00);

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `payment_method_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`payment_method_id`, `name`, `description`) VALUES
(1, 'Cash on Delivery', 'Thanh toán khi nhận hàng'),
(2, 'Bank Transfer', 'Chuyển khoản ngân hàng'),
(3, 'VNPay', 'Thanh toán online qua VNPay');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `image_url` varchar(255) DEFAULT NULL,
  `created_by_admin` int DEFAULT NULL,
  `created_at` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `category_id`, `name`, `description`, `price`, `stock`, `image_url`, `created_by_admin`, `created_at`) VALUES
(1, 1, 'Bàn phím cơ Logitech G213', 'Bàn phím cơ chính hãng Logitech', 1200000.00, 18, 'img/phim1.png', NULL, '2025-02-14'),
(2, 1, 'Bàn phím DareU EK87', 'Bàn phím cơ giá rẻ DareU', 650000.00, 15, 'img/phim2.jpg', NULL, '2025-05-20'),
(3, 2, 'Chuột Razer DeathAdder', 'Chuột gaming Razer', 850000.00, 18, 'img/chuot1.jpg', NULL, '2025-07-08'),
(4, 2, 'Chuột Logitech G102', 'Chuột gaming Logitech G102', 450000.00, 24, 'img/chuot3.png', NULL, '2025-09-15'),
(5, 3, 'Tai nghe HyperX Cloud II', 'Tai nghe chơi game HyperX', 1900000.00, 0, 'img/tainghe1.jpg', NULL, '2025-12-01'),
(6, 5, 'Card đồ họa MSI RTX 4060 Ti', 'VGA hiệu năng cao, phù hợp chơi game và đồ họa', 11500000.00, 20, 'img/vga1.jpg', NULL, '2025-10-10'),
(7, 5, 'Card đồ họa ASUS Dual RTX 4070', 'Card đồ họa ASUS 4070 hiệu năng mạnh mẽ', 16500000.00, 7, 'img/vga2.jpg', NULL, '2025-10-12'),
(8, 4, 'Nguồn Corsair CV550', 'Nguồn Corsair công suất 550W, hiệu suất cao', 1200000.00, 0, 'img/nguon1.jpg', NULL, '2025-09-25'),
(9, 4, 'Nguồn Cooler Master MWE 650W', 'Nguồn Cooler Master 650W chuẩn 80 Plus Bronze', 1450000.00, 12, 'img/nguon2.jpg', NULL, '2025-09-30'),
(40, 2, 'Chuột Logitech G502 Hero', 'Chuột chơi game Logitech G502 Hero cảm biến HERO 25K', 1250000.00, 15, 'img/chuot5.png', NULL, '2025-03-18'),
(41, 2, 'Chuột Razer Viper Mini', 'Chuột gaming siêu nhẹ Razer Viper Mini có đèn RGB', 890000.00, 18, 'img/chuot6.png', NULL, '2025-04-10'),
(42, 2, 'Chuột DareU EM908', 'Chuột chơi game DareU EM908 hiệu năng ổn, giá rẻ', 390000.00, 25, 'img/chuot7.jpg', NULL, '2025-05-05'),
(43, 2, 'Chuột Logitech M331 Silent', 'Chuột không dây Logitech M331 yên tĩnh, tiết kiệm pin', 550000.00, 29, 'img/chuot8.png', NULL, '2025-06-12'),
(44, 2, 'Chuột Fuhlen G90 Pro', 'Chuột gaming Fuhlen G90 Pro cảm biến chính xác, đèn LED', 690000.00, 19, 'img/chuot9.png', NULL, '2025-07-28');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int NOT NULL,
  `order_item_id` int DEFAULT NULL,
  `product_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `order_item_id`, `product_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 1, 1, 5, 'Sản phẩm rất tốt, giao hàng nhanh và đóng gói cẩn thận!', '2025-10-21 06:59:13');

-- --------------------------------------------------------

--
-- Table structure for table `saved_carts`
--

CREATE TABLE `saved_carts` (
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `saved_carts`
--

INSERT INTO `saved_carts` (`user_id`, `product_id`, `quantity`, `saved_at`) VALUES
(1, 43, 1, '2025-11-04 06:41:15'),
(3, 8, 1, '2025-11-04 09:46:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `full_name`, `email`, `password`, `phone`, `created_at`) VALUES
(1, 'Nguyễn Văn A', 'vana@example.com', 'e10adc3949ba59abbe56e057f20f883e', '0912345678', '2025-10-07 09:40:08'),
(2, 'Trần Thị B', 'thib@example.com', 'e10adc3949ba59abbe56e057f20f883e', '0987654321', '2025-10-07 09:40:08'),
(3, 'Trần Văn C', 'vanc@gmail.com', 'e10adc3949ba59abbe56e057f20f883e', NULL, '2025-10-21 09:51:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`cart_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`contact_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `address_id` (`address_id`),
  ADD KEY `payment_method_id` (`payment_method_id`),
  ADD KEY `processed_by` (`processed_by`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`payment_method_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by_admin` (`created_by_admin`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `order_item_id` (`order_item_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `saved_carts`
--
ALTER TABLE `saved_carts`
  ADD PRIMARY KEY (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `addresses`
--
ALTER TABLE `addresses`
  MODIFY `address_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `admin_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `cart_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `contact`
--
ALTER TABLE `contact`
  MODIFY `contact_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `payment_method_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`cart_id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`address_id`),
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods` (`payment_method_id`),
  ADD CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`processed_by`) REFERENCES `admins` (`admin_id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`created_by_admin`) REFERENCES `admins` (`admin_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`order_item_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `saved_carts`
--
ALTER TABLE `saved_carts`
  ADD CONSTRAINT `saved_carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_carts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
