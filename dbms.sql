/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE dbms;
USE dbms;

CREATE TABLE `bookedtour` (
  `TourID` int(11) NOT NULL,
  `OrderID` int(11) NOT NULL,
  `Quantity` int(11) DEFAULT NULL,
  `PriceAtBooking` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookedtour`
--

INSERT INTO `bookedtour` (`TourID`, `OrderID`, `Quantity`, `PriceAtBooking`) VALUES
(1, 21, 1, 4500000.00),
(2, 21, 2, 3200000.00),
(2, 22, 1, 3200000.00),
(3, 24, 1, 3850000.00),
(6, 23, 1, 35000000.00),
(8, 24, 1, 8900000.00);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `CategoryID` int(11) NOT NULL,
  `Name` varchar(255) NOT NULL,
  `CategoryThumbnail` varchar(255) DEFAULT NULL,
  `CategoryStatus` int(11) NOT NULL,
  `Description` text DEFAULT NULL,
  `Location` varchar(255) DEFAULT NULL,
  `ParentID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`CategoryID`, `Name`, `CategoryThumbnail`, `CategoryStatus`, `Description`, `Location`, `ParentID`) VALUES
(1, 'Du lịch Trong Nước', 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000', 0, 'Khám phá vẻ đẹp Việt Nam', 'Việt Nam', NULL),
(2, 'Du lịch Nước Ngoài', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000', 0, 'Trải nghiệm thế giới', 'Quốc tế', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `OrderID` int(11) NOT NULL,
  `PaymentMethod` varchar(100) DEFAULT NULL,
  `OrderDate` datetime DEFAULT NULL,
  `OrderStatus` int(11) DEFAULT NULL,
  `Note` text DEFAULT NULL,
  `PaymentStatus` int(11) DEFAULT NULL,
  `clientName` varchar(255) DEFAULT NULL,
  `clientPhone` varchar(20) DEFAULT NULL,
  `clientNote` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`OrderID`, `PaymentMethod`, `OrderDate`, `OrderStatus`, `Note`, `PaymentStatus`, `clientName`, `clientPhone`, `clientNote`) VALUES
(21, 'cash', '2026-05-18 15:59:15', 0, NULL, 0, 'Nguyễn Hải Nam', '0705016997', '123'),
(22, 'cash', '2026-05-20 21:31:51', 1, NULL, 0, 'Nguyễn Hải Nam', '0705016997', 'fdasdfa'),
(23, 'bank', '2026-05-20 21:32:27', 2, NULL, 1, 'Nguyễn Hải Nam', '0705016997', '123'),
(24, 'cash', '2026-05-22 01:08:29', 1, NULL, 0, 'Nam Nguyen', '0705016997', 'sadASD');

-- --------------------------------------------------------

--
-- Table structure for table `tour`
--

CREATE TABLE `tour` (
  `TourID` int(11) NOT NULL,
  `Title` varchar(255) NOT NULL,
  `Vehicle` varchar(100) DEFAULT NULL,
  `Timeline` varchar(255) DEFAULT NULL,
  `DeparturePlace` varchar(255) DEFAULT NULL,
  `DepartureDate` datetime DEFAULT NULL,
  `Duration` varchar(100) DEFAULT NULL,
  `TourDescription` text DEFAULT NULL,
  `CostPerPerson` decimal(18,2) DEFAULT NULL,
  `MaxParticipants` int(11) NOT NULL,
  `TourThumbnail` varchar(255) DEFAULT NULL,
  `TourSchedule` text DEFAULT NULL,
  `TourStatus` int(11) DEFAULT NULL,
  `CategoryID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tour`
--

INSERT INTO `tour` (`TourID`, `Title`, `Vehicle`, `Timeline`, `DeparturePlace`, `DepartureDate`, `Duration`, `TourDescription`, `CostPerPerson`, `MaxParticipants`, `TourThumbnail`, `TourSchedule`, `TourStatus`, `CategoryID`) VALUES
(1, 'Đà Nẵng - Hội An - Bà Nà', 'Máy bay', 'Đà Nẵng - Bà Nà - Hội An', 'TP.HCM', '2026-06-15 00:00:00', '3 Ngày 2 Đêm', 'Hành trình di sản miền Trung.', 4500000.00, 20, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1744022242/zx9gs2lupawrwoguz8fb.jpg', 'Ngày 1: Mỹ Khê. Ngày 2: Bà Nà. Ngày 3: Hội An.', 0, 1),
(2, 'Vịnh Hạ Long Kỳ Quan', 'Tàu cao cấp', 'Hà Nội - Hạ Long', 'Hà Nội', '2026-05-20 00:00:00', '2 Ngày 1 Đêm', 'Ngủ đêm trên vịnh ngắm hoàng hôn.', 3200000.00, 25, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1773976844/jalcrrwhviarqsfieg5d.webp', 'Ngày 1: Lên du thuyền, thăm Hang Sửng Sốt. Ngày 2: Chèo Kayak, về lại đất liền.', 0, 1),
(3, 'Quy Nhơn - Đảo Kỳ Co', 'Ô tô', 'Quy Nhơn - Kỳ Co', 'Đà Nẵng', '2026-06-10 00:00:00', '3 Ngày 2 Đêm', 'Maldives Việt Nam.', 3850000.00, 15, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1744531272/z2el4gpvjb2jbcxpg8fi.webp', 'Lịch trình chi tiết đảo Kỳ Co...', 0, 1),
(4, 'Miền Tây Sông Nước', 'Xe du lịch', 'Mỹ Tho - Cần Thơ', 'TP.HCM', '2026-05-12 00:00:00', '2 Ngày 1 Đêm', 'Văn hóa chợ nổi đặc sắc.', 1800000.00, 40, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1773942483/abvlct4rdqmxgugrcibw.avif', 'Ngày 1: Bến Tre. Ngày 2: Chợ nổi Cái Răng.', 0, 1),
(5, 'Paris - Kinh Đô Ánh Sáng', 'Máy bay', 'Paris - Versailles', 'Hà Nội', '2026-07-20 00:00:00', '5 Ngày 4 Đêm', 'Khám phá tháp Eiffel.', 48000000.00, 15, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800', 'Lịch trình Paris...', 0, 2),
(6, 'Nhật Bản: Cung Đường Vàng', 'Máy bay', 'Tokyo - Phú Sĩ', 'Hà Nội', '2026-10-05 00:00:00', '6 Ngày 5 Đêm', 'Cố đô Kyoto và Núi Phú Sĩ.', 35000000.00, 20, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800', 'Lịch trình Nhật Bản...', 0, 2),
(7, 'Hàn Quốc - Mùa Hoa Anh Đào', 'Máy bay', 'Seoul - Nami', 'TP.HCM', '2026-04-10 00:00:00', '5 Ngày 4 Đêm', 'Sắc hoa anh đào rực rỡ.', 19500000.00, 25, 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=800', 'Lịch trình Hàn Quốc...', 0, 2),
(8, 'Thái Lan: Bangkok - Pattaya', 'Máy bay', 'Bangkok - Pattaya', 'Đà Nẵng', '2026-08-15 00:00:00', '5 Ngày 4 Đêm', 'Thiên đường giải trí.', 8900000.00, 30, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1744021491/reqqjkov1vu3olh79m1b.avif', 'Lịch trình Thái Lan...', 0, 2);

-- --------------------------------------------------------

--
-- Table structure for table `tour_image`
--

CREATE TABLE `tour_image` (
  `ImageID` int(11) NOT NULL,
  `Source` varchar(500) NOT NULL,
  `TourID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tour_image`
--

INSERT INTO `tour_image` (`ImageID`, `Source`, `TourID`) VALUES
(1, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1773976844/jalcrrwhviarqsfieg5d.webp', 2),
(2, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1773976845/rwbpveibycjhs1gn8jvj.avif', 2),
(3, 'https://res.cloudinary.com/dlhhuspb6/image/upload/v1773976844/q7yfqnu1dt3oxhitgqmc.avif', 2),
(4, 'https://images.unsplash.com/photo-1559592442-7e18259f63cc', 1),
(5, 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e', 6);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `UserID` int(11) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `DateOfBirth` date DEFAULT NULL,
  `Address` varchar(255) DEFAULT NULL,
  `Email` varchar(100) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `Status` int(11) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`UserID`, `FullName`, `DateOfBirth`, `Address`, `Email`, `Password`, `PhoneNumber`, `Status`, `role`) VALUES
(1, 'Nguyễn Văn Quản Trị', '1995-05-15', 'Hà Nội', 'admin@example.com', '$2a$10$CpaylZooCacyUgJjEIjYbuhwirLbX9Xm3Ij0BdU/e646vl/juYX36', '0987654321', 1, 'admin'),
(2, 'Trần Thị Mai', '1998-08-20', 'Hồ Chí Minh', 'mai.tran@example.com', '$2y$10$At0gPtx9DT83RDfRhA9Qd.jgn.3DxM.YgFH39AS0DMSB3HWS3IZ1W', '0912345678', 1, 'user'),
(3, 'Lê Văn Hùng', '2000-11-25', 'Đà Nẵng', 'hung.le@example.com', '$2a$10$Icb/dO4fy6B/.mTrdb1RjuzmrlV.h8hgyWG5wPgot1jUvqOkwbpr2', '0933333333', 1, 'user'),
(4, 'Phạm Quang Dũng', '1992-02-28', 'Hải Phòng', 'dung.pham@example.com', '$2a$10$Icb/dO4fy6B/.mTrdb1RjuzmrlV.h8hgyWG5wPgot1jUvqOkwbpr2', '0944444444', 0, 'user'),
(5, 'Hoàng Bích Ngọc', '2002-07-07', 'Cần Thơ', 'ngoc.hoang@example.com', '$2a$10$Icb/dO4fy6B/.mTrdb1RjuzmrlV.h8hgyWG5wPgot1jUvqOkwbpr2', '0955555555', 1, 'user');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookedtour`
--
ALTER TABLE `bookedtour`
  ADD PRIMARY KEY (`TourID`,`OrderID`),
  ADD KEY `fk_bt_order` (`OrderID`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`CategoryID`),
  ADD KEY `fk_category_parent` (`ParentID`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`OrderID`);

--
-- Indexes for table `tour`
--
ALTER TABLE `tour`
  ADD PRIMARY KEY (`TourID`),
  ADD KEY `fk_tour_category` (`CategoryID`);

--
-- Indexes for table `tour_image`
--
ALTER TABLE `tour_image`
  ADD PRIMARY KEY (`ImageID`),
  ADD KEY `TourID` (`TourID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`UserID`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `CategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `OrderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `tour`
--
ALTER TABLE `tour`
  MODIFY `TourID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tour_image`
--
ALTER TABLE `tour_image`
  MODIFY `ImageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookedtour`
--
ALTER TABLE `bookedtour`
  ADD CONSTRAINT `fk_bt_order` FOREIGN KEY (`OrderID`) REFERENCES `order` (`OrderID`),
  ADD CONSTRAINT `fk_bt_tour` FOREIGN KEY (`TourID`) REFERENCES `tour` (`TourID`);

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`ParentID`) REFERENCES `category` (`CategoryID`);

--
-- Constraints for table `tour`
--
ALTER TABLE `tour`
  ADD CONSTRAINT `fk_tour_category` FOREIGN KEY (`CategoryID`) REFERENCES `category` (`CategoryID`);

--
-- Constraints for table `tour_image`
--
ALTER TABLE `tour_image`
  ADD CONSTRAINT `tour_image_ibfk_1` FOREIGN KEY (`TourID`) REFERENCES `tour` (`TourID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
