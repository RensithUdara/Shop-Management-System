CREATE DATABASE `grocery_store_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `grocery_store_db`;

CREATE TABLE `unit_convert` (
  `unit_id` int NOT NULL,
  `unit_name` varchar(45) NOT NULL,
  PRIMARY KEY (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `product` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(100) NOT NULL,
  `Unit` int NOT NULL,
  `Price_per_unit` double NOT NULL,
  PRIMARY KEY (`product_id`),
  KEY `unit_convertion_fk_idx` (`Unit`),
  CONSTRAINT `unit_convertion_fk` FOREIGN KEY (`Unit`) REFERENCES `unit_convert` (`unit_id`) ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `orders` (
  `Order_id` int NOT NULL AUTO_INCREMENT,
  `Customer_name` varchar(45) NOT NULL,
  `Date` datetime NOT NULL,
  `Total` double NOT NULL,
  PRIMARY KEY (`Order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE `order_details` (
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quatity` double NOT NULL,
  `total` double NOT NULL,
  KEY `product_id_fk_idx` (`product_id`),
  KEY `order_id_fk` (`order_id`),
  CONSTRAINT `order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`Order_id`),
  CONSTRAINT `product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

