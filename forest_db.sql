-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3307
-- Generation Time: Apr 25, 2026 at 08:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `forest_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `contractors`
--

CREATE TABLE `contractors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `contractor_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contractors`
--

INSERT INTO `contractors` (`id`, `user_id`, `contractor_name`, `created_at`) VALUES
(1, 2, 'vinod karaganvi', '2026-04-22 11:00:45'),
(2, 2, 'Irappa Ramachandra  Karaganvi', '2026-04-24 05:40:21');

-- --------------------------------------------------------

--
-- Table structure for table `estimate_details`
--

CREATE TABLE `estimate_details` (
  `id` int(11) NOT NULL,
  `est_no` int(11) DEFAULT NULL,
  `year` varchar(20) DEFAULT NULL,
  `estimate_type` varchar(50) DEFAULT NULL,
  `constituency` varchar(100) DEFAULT NULL,
  `section` varchar(100) DEFAULT NULL,
  `circle` varchar(100) DEFAULT NULL,
  `division` varchar(100) DEFAULT NULL,
  `subdivision` varchar(100) DEFAULT NULL,
  `range_name` varchar(100) DEFAULT NULL,
  `taluk` varchar(100) DEFAULT NULL,
  `work` varchar(255) DEFAULT NULL,
  `head_of_account` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `extent` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `vfc` varchar(100) DEFAULT NULL,
  `brush_wood_fence` varchar(100) DEFAULT NULL,
  `cpt_length` varchar(50) DEFAULT NULL,
  `bw` varchar(50) DEFAULT NULL,
  `sw` varchar(50) DEFAULT NULL,
  `asset_id` varchar(100) DEFAULT NULL,
  `sanction_authority` varchar(255) DEFAULT NULL,
  `species` varchar(100) DEFAULT NULL,
  `pit_size` varchar(100) DEFAULT NULL,
  `seedling_size` varchar(100) DEFAULT NULL,
  `working_circle` varchar(100) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `balance_amount` decimal(12,2) DEFAULT NULL,
  `trenches` text DEFAULT NULL,
  `seedlings` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  `scheme_name` varchar(50) DEFAULT 'GENERAL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estimate_details`
--

INSERT INTO `estimate_details` (`id`, `est_no`, `year`, `estimate_type`, `constituency`, `section`, `circle`, `division`, `subdivision`, `range_name`, `taluk`, `work`, `head_of_account`, `location`, `extent`, `model`, `vfc`, `brush_wood_fence`, `cpt_length`, `bw`, `sw`, `asset_id`, `sanction_authority`, `species`, `pit_size`, `seedling_size`, `working_circle`, `total_amount`, `balance_amount`, `trenches`, `seedlings`, `created_at`, `user_id`, `scheme_name`) VALUES
(16, 1, '2025-2026', 'Plantation', 'Nesaragi', 'Pachhapur', 'BELAGAVI', 'Belagavi', 'Belagavi', 'Nesaragi', '', 'Plantation of Bamboo ', 'Bamboo mission', 'MAVANOOR', '50', '--', '--', '--', '', '', '--', '--', 'CCF BELAGAVI', '--', '', '', 'Nesaragi', 156000.00, 0.00, '[{\"count\":\"500\",\"size\":\".45x0.45x0.45\"}]', '[{\"count\":\"500\",\"size\":\"0.45x0.45x0.45\"}]', '2026-04-21 11:05:17', 2, 'GENERAL'),
(17, 2, '2025-2026', 'PWD', 'Nesaragi', 'Pachhapur', 'BELAGAVI', 'Belagavi', 'Belagavi', 'Nesaragi', '', 'Plantation of Bamboo ', 'Bamboo mission', 'Pachhapur', '25', '--', '--', '--', '--', '--', '--', '--', 'ACF BELAGAVI', '', '', '', 'Nesaragi', 310000.00, 0.00, '[{\"count\":\"2000\",\"size\":\"0.25x0.25x0.25\"}]', '[{\"count\":\"2000\",\"size\":\"0.25x0.25x0.25\"}]', '2026-04-21 11:07:34', 2, 'GENERAL'),
(18, 1, '2025-2026', 'CAMPA', 'Nesaragi', 'Pachhapur', 'BELAGAVI', 'Belagavi', 'Belagavi', 'Nesaragi', 'Bailhongal', 'CAMPA', 'CAMPA', 'MAVANOOR', '', '', '', '', '', '', '', '', '', '', '', '', '', 125000.00, 0.00, '[{\"count\":\"100\",\"size\":\"0.45\"}]', '[{\"count\":\"\",\"size\":\"\"}]', '2026-04-21 11:54:56', 2, 'CAMPA'),
(20, 2, '2025-2026', 'CAMPA', 'Nesaragi', 'Pachhapur', 'BELAGAVI', 'Belagavi', 'Belagavi', 'Nesaragi', 'Bailhongal', 'CAMPA', 'CAMPA', 'Nesaragi', '50', '--', '--', '--', '--', '--', '--', '--', 'CCF BELAGAVI', '', '', '', 'Nesaragi', 65000.00, 0.00, '[{\"count\":\"200\",\"size\":\"0.45x0.45x0.45\"}]', '[{\"count\":\"200\",\"size\":\"0.45x0.45x0.45\"}]', '2026-04-22 17:32:31', 2, 'CAMPA'),
(21, 3, '2025-2026', 'Plantation', 'Bailhongal', 'Ankalagi', 'BELAGAVI', 'Belagavi', 'Belagavi', 'Nesaragi', 'Bailhongal', 'Maintainance of First year Plantation', '4406-01-101-0-04--139 GUA', 'Ankalagi', '75', '--', '--', '--', '--', '--', '--', '--', 'CCF BELAGAVI', '--', '', '', 'Nesaragi', 83000.00, 0.00, '[]', '[]', '2026-04-24 05:43:16', 2, 'GENERAL'),
(22, 4, '2025-2026', 'Plantation', 'Bailhongal', 'Ankalagi', 'BELAGAVI', 'Belagavi', 'Belagavi', 'Nesaragi', 'Bailhongal', 'Maintainance of First year Plantation', '4406-01-101-0-04--139 GUA CAMPA', 'Ankalagi', '100', '--', '--', '--', '--', '--', '--', '--', 'CCF BELAGAVI', '--', '', '', 'Nesaragi', 83000.00, 0.00, '[]', '[]', '2026-04-24 08:14:18', 2, 'GENERAL');

-- --------------------------------------------------------

--
-- Table structure for table `estimate_master_defaults`
--

CREATE TABLE `estimate_master_defaults` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `range_name` varchar(255) DEFAULT NULL,
  `estimate_type` varchar(255) DEFAULT NULL,
  `head_of_account` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estimate_sanctions`
--

CREATE TABLE `estimate_sanctions` (
  `id` int(11) NOT NULL,
  `estimate_id` int(11) NOT NULL,
  `sanction_no` varchar(255) NOT NULL,
  `sanction_date` date DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estimate_sanctions`
--

INSERT INTO `estimate_sanctions` (`id`, `estimate_id`, `sanction_no`, `sanction_date`, `user_id`, `created_at`) VALUES
(1, 2, 'DSO/500/2025-26', '2026-04-16', NULL, '2026-04-17 12:41:54'),
(2, 3, 'DSO?2u3ey383eu', '2026-04-17', NULL, '2026-04-18 04:34:56'),
(3, 4, 'DSO: 125/25-26', '2026-04-17', NULL, '2026-04-18 07:25:14'),
(4, 15, 'DSO/CAMPA/500/2025-26', '2026-04-14', NULL, '2026-04-21 11:32:53'),
(5, 16, 'DSO/GEN/250/2025-26', '2026-04-19', NULL, '2026-04-21 11:33:24'),
(6, 18, 'DSO/CAMPA/200', '2026-04-14', NULL, '2026-04-21 11:55:40'),
(7, 20, 'DSO/CAMPA2/Voucher test', '2026-04-20', NULL, '2026-04-22 17:33:50'),
(8, 17, 'DSO /GEN /Test', '2026-04-01', NULL, '2026-04-22 17:48:31'),
(9, 21, 'DSO: 444/2025-2026', '2026-05-02', NULL, '2026-04-24 05:45:18'),
(10, 22, 'DSO: 555/2025-26', '2026-05-05', NULL, '2026-04-24 08:15:49');

-- --------------------------------------------------------

--
-- Table structure for table `estimate_ssr_items`
--

CREATE TABLE `estimate_ssr_items` (
  `id` int(11) NOT NULL,
  `estimate_id` int(11) DEFAULT NULL,
  `sr_no` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `qty` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT NULL,
  `rate_per` decimal(10,2) DEFAULT NULL,
  `days` decimal(10,2) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estimate_ssr_items`
--

INSERT INTO `estimate_ssr_items` (`id`, `estimate_id`, `sr_no`, `description`, `qty`, `unit`, `rate`, `rate_per`, `days`, `amount`) VALUES
(54, 16, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 'Ha.', 40339.18, 1.00, 3.00, 121018.00),
(55, 16, '5(a)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Formation of new beds.', 1.00, 'bed', 34982.00, 1.00, 1.00, 34982.00),
(56, 17, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 'Ha.', 40339.18, 1.00, 5.00, 201696.00),
(57, 17, '7(a)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size -Formation of new beds.', 100.00, 'bed', 1026.57, 1.00, 1.00, 102657.00),
(58, 17, '6(a)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Formation of new beds', 1.00, 'bed', 5647.00, 1.00, 1.00, 5647.00),
(63, 20, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 'Ha.', 40339.18, 1.00, 1.00, 40339.00),
(64, 20, '2(a)', 'Procurement of Ingredients: Procurement of Farm Yard Manure(FYM) / Compost, Sand and Red-earth (ingredients) required for raising seedlings including transportation, breaking of clods, sieving and heaping each ingredient separately at nursery site Red-earth.', 20.00, 'Cum', 559.32, 1.00, 1.00, 11186.00),
(65, 20, '3(b)', 'Collection of Seeds and Seedlings if Collection of teak fruits', 1.00, 'Ke.', 13475.00, 1.00, 1.00, 13475.00),
(66, 21, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 'Ha.', 40339.18, 1.00, 1.00, 40339.00),
(67, 21, '4(a)', 'Formation of new beds: Aligning the nursery beds, clearing of debris, digging of soil 30 cm. deep and allowing the soil for weathering, breaking of clods, mixing the ingredients, levelling and forming new nursery beds of size 12 m x 1.20 m, raising the bunds and consolidating on all the sides of beds.', 3.00, 'bed', 1026.57, 1.00, 1.00, 3080.00),
(68, 21, '5(e)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Transplanting of Dowga / Medri bamboo seedlings in beds.', 5.00, '1000', 864.80, 1.00, 1.00, 4324.00),
(69, 21, '4(c)', 'Application of ingredients (Farm Yard Manure / Compost and Sand) (Quantityof Farm Yard Manure and Sand to be prescribed by the Jurisdictional Deputy / Conservator / Chief Conservator of Forests by considering the fertility and sand content in the soil of the nursery bed).', 1.00, 'bed', 35257.00, 1.00, 1.00, 35257.00),
(70, 22, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 'Ha.', 40339.18, 1.00, 1.00, 40339.00),
(71, 22, '4(a)', 'Formation of new beds: Aligning the nursery beds, clearing of debris, digging of soil 30 cm. deep and allowing the soil for weathering, breaking of clods, mixing the ingredients, levelling and forming new nursery beds of size 12 m x 1.20 m, raising the bunds and consolidating on all the sides of beds.', 3.00, 'bed', 1026.57, 1.00, 1.00, 3080.00),
(72, 22, '5(e)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Transplanting of Dowga / Medri bamboo seedlings in beds.', 5.00, '1000', 864.80, 1.00, 1.00, 4324.00),
(73, 22, '4(c)', 'Application of ingredients (Farm Yard Manure / Compost and Sand) (Quantityof Farm Yard Manure and Sand to be prescribed by the Jurisdictional Deputy / Conservator / Chief Conservator of Forests by considering the fertility and sand content in the soil of the nursery bed).', 1.00, 'bed', 35257.00, 1.00, 1.00, 35257.00);

-- --------------------------------------------------------

--
-- Table structure for table `estimate_type_master`
--

CREATE TABLE `estimate_type_master` (
  `id` int(11) NOT NULL,
  `estimate_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `estimate_type_master`
--

INSERT INTO `estimate_type_master` (`id`, `estimate_type`, `created_at`) VALUES
(1, 'CAMPA', '2026-04-17 11:23:58'),
(2, 'Plantation', '2026-04-17 11:23:58'),
(3, 'Nursury', '2026-04-17 11:23:58'),
(4, 'PWD', '2026-04-17 11:23:58');

-- --------------------------------------------------------

--
-- Table structure for table `hoa`
--

CREATE TABLE `hoa` (
  `id` int(11) NOT NULL,
  `hoa_name` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `scheme_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoa`
--

INSERT INTO `hoa` (`id`, `hoa_name`, `user_id`, `created_at`, `scheme_name`) VALUES
(1, 'Bamboo mission', 2, '2026-04-17 11:36:36', NULL),
(2, 'national green mission', 1, '2026-04-17 15:56:44', NULL),
(3, 'CAMPA', 2, '2026-04-21 11:36:27', 'CAMPA'),
(4, '4406-01-101-0-04--139 GUA', 2, '2026-04-24 05:39:27', NULL),
(5, '4406-01-101-0-04--139 GUA CAMPA', 2, '2026-04-24 08:13:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `indent_entries`
--

CREATE TABLE `indent_entries` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `estimate_id` int(11) NOT NULL,
  `indent_no` int(11) NOT NULL,
  `work_type` varchar(255) DEFAULT NULL,
  `indent_month` varchar(100) DEFAULT NULL,
  `hoa_name` varchar(255) DEFAULT NULL,
  `sanction_no` varchar(255) DEFAULT NULL,
  `total_amount` decimal(14,2) DEFAULT 0.00,
  `grand_total` decimal(14,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `est_no` int(11) DEFAULT NULL,
  `scheme_name` varchar(50) DEFAULT 'GENERAL'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indent_entries`
--

INSERT INTO `indent_entries` (`id`, `user_id`, `estimate_id`, `indent_no`, `work_type`, `indent_month`, `hoa_name`, `sanction_no`, `total_amount`, `grand_total`, `created_at`, `est_no`, `scheme_name`) VALUES
(19, 2, 18, 1, 'CAMPA - PCP & FAC-63', 'April - 2026', 'CAMPA', 'DSO/CAMPA/200', 125000.36, 125000.36, '2026-04-22 06:46:43', 1, 'CAMPA'),
(20, 2, 16, 2, 'CONTRACT OTHERS - CONTRACT BILL', 'April - 2026', 'Bamboo mission', 'DSO/GEN/250/2025-26', 34982.00, 34982.00, '2026-04-22 06:47:24', 1, 'GENERAL'),
(22, 2, 17, 4, 'CONTRACT OTHERS - CONTRACT BILL', 'April - 2026', 'Bamboo mission', 'DSO /GEN /Test', 309999.90, 344981.90, '2026-04-22 17:48:54', 2, 'GENERAL'),
(23, 2, 20, 5, 'CONTRACT CAMPA - CONTRACT BILL', 'April - 2026', 'CAMPA', 'DSO/CAMPA2/Voucher test', 65000.58, 190000.94, '2026-04-23 16:01:56', 2, 'CAMPA'),
(24, 2, 21, 6, 'CONTRACT OTHERS - CONTRACT BILL', 'May - 2026', '4406-01-101-0-04--139 GUA', 'DSO: 444/2025-2026', 82999.89, 82999.89, '2026-04-24 05:46:46', 3, 'GENERAL'),
(25, 2, 22, 7, 'CONTRACT OTHERS - CONTRACT BILL', 'May - 2026', '4406-01-101-0-04--139 GUA CAMPA', 'DSO: 555/2025-26', 82999.89, 82999.89, '2026-04-24 08:18:42', 4, 'GENERAL');

-- --------------------------------------------------------

--
-- Table structure for table `indent_ssr_items`
--

CREATE TABLE `indent_ssr_items` (
  `id` int(11) NOT NULL,
  `indent_id` int(11) NOT NULL,
  `sr_no` varchar(50) DEFAULT NULL,
  `particulars` text DEFAULT NULL,
  `qty` decimal(14,2) DEFAULT 0.00,
  `days` decimal(14,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT NULL,
  `rate` decimal(14,2) DEFAULT 0.00,
  `rate_per` decimal(14,2) DEFAULT 0.00,
  `total` decimal(14,2) DEFAULT 0.00,
  `acf_date` date DEFAULT NULL,
  `nb_no` varchar(100) DEFAULT NULL,
  `page_no` varchar(100) DEFAULT NULL,
  `pow` varchar(255) DEFAULT NULL,
  `rfo_date` date DEFAULT NULL,
  `wages_from` varchar(255) DEFAULT NULL,
  `wages` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `times_days` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `indent_ssr_items`
--

INSERT INTO `indent_ssr_items` (`id`, `indent_id`, `sr_no`, `particulars`, `qty`, `days`, `unit`, `rate`, `rate_per`, `total`, `acf_date`, `nb_no`, `page_no`, `pow`, `rfo_date`, `wages_from`, `wages`, `created_at`, `times_days`) VALUES
(43, 19, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 80678.36, NULL, '', '', '', NULL, '', '', '2026-04-22 06:46:43', 2),
(44, 19, '3(b)', 'Collection of Seeds and Seedlings if Collection of teak fruits', 1.00, 0.00, 'Ke.', 44322.00, 1.00, 44322.00, NULL, '', '', '', NULL, '', '', '2026-04-22 06:46:43', 1),
(45, 20, '5(a)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Formation of new beds.', 1.00, 0.00, 'bed', 34982.00, 1.00, 34982.00, NULL, '', '', '', NULL, '', '', '2026-04-22 06:47:24', 1),
(49, 22, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 201695.90, NULL, '', '', '', NULL, '', '', '2026-04-22 17:48:54', 5),
(50, 22, '7(a)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size -Formation of new beds.', 100.00, 0.00, 'bed', 1026.57, 1.00, 102657.00, NULL, '', '', '', NULL, '', '', '2026-04-22 17:48:54', 1),
(51, 22, '6(a)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Formation of new beds', 1.00, 0.00, 'bed', 5647.00, 1.00, 5647.00, NULL, '', '', '', NULL, '', '', '2026-04-22 17:48:54', 1),
(52, 23, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 40339.18, NULL, '', '', '', NULL, '', '', '2026-04-23 16:01:56', 1),
(53, 23, '2(a)', 'Procurement of Ingredients: Procurement of Farm Yard Manure(FYM) / Compost, Sand and Red-earth (ingredients) required for raising seedlings including transportation, breaking of clods, sieving and heaping each ingredient separately at nursery site Red-earth.', 20.00, 0.00, 'Cum', 559.32, 1.00, 11186.40, NULL, '', '', '', NULL, '', '', '2026-04-23 16:01:56', 1),
(54, 23, '3(b)', 'Collection of Seeds and Seedlings if Collection of teak fruits', 1.00, 0.00, 'Ke.', 13475.00, 1.00, 13475.00, NULL, '', '', '', NULL, '', '', '2026-04-23 16:01:56', 1),
(59, 24, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 40339.18, '2026-05-11', '2566', '35', '11-05-2026 to 14-05-2026', NULL, '', '', '2026-04-24 05:49:47', 1),
(60, 24, '4(a)', 'Formation of new beds: Aligning the nursery beds, clearing of debris, digging of soil 30 cm. deep and allowing the soil for weathering, breaking of clods, mixing the ingredients, levelling and forming new nursery beds of size 12 m x 1.20 m, raising the bunds and consolidating on all the sides of beds.', 3.00, 0.00, 'bed', 1026.57, 1.00, 3079.71, '2026-05-12', '2566', '35', '11-05-2026 to 14-05-2026', NULL, '', '', '2026-04-24 05:49:47', 1),
(61, 24, '5(e)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Transplanting of Dowga / Medri bamboo seedlings in beds.', 5.00, 0.00, '1000', 864.80, 1.00, 4324.00, '2026-05-13', '2566', '35', '11-05-2026 to 14-05-2026', NULL, '', '', '2026-04-24 05:49:47', 1),
(62, 24, '4(c)', 'Application of ingredients (Farm Yard Manure / Compost and Sand) (Quantityof Farm Yard Manure and Sand to be prescribed by the Jurisdictional Deputy / Conservator / Chief Conservator of Forests by considering the fertility and sand content in the soil of the nursery bed).', 1.00, 0.00, 'bed', 35257.00, 1.00, 35257.00, '2026-05-14', '2566', '35', '11-05-2026 to 14-05-2026', NULL, '', '', '2026-04-24 05:49:47', 1),
(63, 25, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 40339.18, '2026-05-12', '2366', '35', '12/05/2025 to 15/05/2025', NULL, '', '', '2026-04-24 08:18:42', 1),
(64, 25, '4(a)', 'Formation of new beds: Aligning the nursery beds, clearing of debris, digging of soil 30 cm. deep and allowing the soil for weathering, breaking of clods, mixing the ingredients, levelling and forming new nursery beds of size 12 m x 1.20 m, raising the bunds and consolidating on all the sides of beds.', 3.00, 0.00, 'bed', 1026.57, 1.00, 3079.71, '2026-06-13', '2366', '35', '12/05/2025 to 15/05/2025', NULL, '', '', '2026-04-24 08:18:42', 1),
(65, 25, '5(e)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Transplanting of Dowga / Medri bamboo seedlings in beds.', 5.00, 0.00, '1000', 864.80, 1.00, 4324.00, '2026-06-14', '2366', '35', '12/05/2025 to 15/05/2025', NULL, '', '', '2026-04-24 08:18:42', 1),
(66, 25, '4(c)', 'Application of ingredients (Farm Yard Manure / Compost and Sand) (Quantityof Farm Yard Manure and Sand to be prescribed by the Jurisdictional Deputy / Conservator / Chief Conservator of Forests by considering the fertility and sand content in the soil of the nursery bed).', 1.00, 0.00, 'bed', 35257.00, 1.00, 35257.00, '2026-06-15', '2366', '35', '12/05/2025 to 15/05/2025', NULL, '', '', '2026-04-24 08:18:42', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ranges`
--

CREATE TABLE `ranges` (
  `id` int(11) NOT NULL,
  `division` varchar(100) DEFAULT NULL,
  `sub_division` varchar(100) DEFAULT NULL,
  `range_name` varchar(100) DEFAULT NULL,
  `range_id` varchar(50) DEFAULT NULL,
  `rfo_name` varchar(100) DEFAULT NULL,
  `acf_name` varchar(100) DEFAULT NULL,
  `cert1` varchar(100) DEFAULT NULL,
  `cert2` varchar(100) DEFAULT NULL,
  `cert3` varchar(100) DEFAULT NULL,
  `acf_recommendation` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ranges`
--

INSERT INTO `ranges` (`id`, `division`, `sub_division`, `range_name`, `range_id`, `rfo_name`, `acf_name`, `cert1`, `cert2`, `cert3`, `acf_recommendation`, `user_id`, `created_at`) VALUES
(1, 'Belagavi', 'Belagavi', 'Nesaragi', '10', 'Prasanna Bellad', 'Belagavi', 'cert1', 'cert2', 'cert3', 'ACF BELAGAVI', 2, '2026-04-17 11:40:00'),
(2, 'Belagavi', 'Belagavi', 'HUKKERI', '9', 'B L SANADI', 'Belagavi', '--', '--', '--', '--', 3, '2026-04-18 07:41:58');

-- --------------------------------------------------------

--
-- Table structure for table `section_master`
--

CREATE TABLE `section_master` (
  `id` int(11) NOT NULL,
  `section_name` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `section_master`
--

INSERT INTO `section_master` (`id`, `section_name`, `user_id`, `created_at`) VALUES
(1, 'Pachhapur', 2, '2026-04-17 11:37:09'),
(2, 'Ankalagi', 2, '2026-04-24 05:39:59');

-- --------------------------------------------------------

--
-- Table structure for table `ssr_master`
--

CREATE TABLE `ssr_master` (
  `id` int(11) NOT NULL,
  `sr_no` varchar(50) NOT NULL,
  `description` text NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `rate` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ssr_master`
--

INSERT INTO `ssr_master` (`id`, `sr_no`, `description`, `unit`, `rate`, `created_at`) VALUES
(1, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 'Ha.', 40339.18, '2026-04-17 11:31:39'),
(2, '1(b)', 'Preparation of site to form new nursery by clearing weeds,  shrubs and small trees by cutting and uprooting the growth and transporting cut materials to the periphery  in case of -Medium growth area.', 'Ha.', 13202.06, '2026-04-17 11:31:39'),
(3, '1(c)', 'Preparation of site to form new nursery by clearing weeds,  shrubs and small trees by cutting and uprooting the growth and transporting cut materials to the periphery  in case of -Sparse growth area.', 'Ha.', 6454.24, '2026-04-17 11:31:39'),
(4, '1(d)', 'Clearing the nursery, which was abandoned for more than 2 years, by uprooting weeds and shrubs and burning the uprooted materia', 'Ha.', 5134.10, '2026-04-17 11:31:39'),
(5, '1(e)', 'Clearing weeds and shrubs by uprooting the growth the burning the uprooted weeds in the existing nursery annually once.', 'Ha.', 4763.57, '2026-04-17 11:31:39'),
(6, '2(a)', 'Procurement of Ingredients: Procurement of Farm Yard Manure(FYM) / Compost, Sand and Red-earth (ingredients) required for raising seedlings including transportation, breaking of clods, sieving and heaping each ingredient separately at nursery site Red-earth.', 'Cum', 559.32, '2026-04-17 11:31:39'),
(7, '2(b)', 'Procurement of Ingredients: Procurement of Farm Yard Manure(FYM) / Compost, Sand and Red-earth (ingredients) required for raising seedlings including transportation, breaking of clods, sieving and heaping each ingredient separately at nursery site sand.', 'Cum', 1211.07, '2026-04-17 11:31:39'),
(8, '2(c)', 'Procurement of Ingredients: Procurement of Farm Yard Manure(FYM) / Compost, Sand and Red-earth (ingredients) required for raising seedlings including transportation, breaking of clods, sieving and heaping each ingredient separately at nursery site Farm Yard Manure(FYM) / Compost.', 'Cum', 1644.49, '2026-04-17 11:31:39'),
(9, '3(a)', 'Collection of Seeds and Seedlings if All seeds supplied by Research wing.', '', 0.00, '2026-04-17 11:31:39'),
(10, '3(b)', 'Collection of Seeds and Seedlings if Collection of teak fruits', 'Ke.', 69.85, '2026-04-17 11:31:39'),
(11, '3(c)', 'Collection and transport of wildlings of important economic species from forest area to nursery', '1000', 775.56, '2026-04-17 11:31:39'),
(12, '4(a)', 'Formation of new beds: Aligning the nursery beds, clearing of debris, digging of soil 30 cm. deep and allowing the soil for weathering, breaking of clods, mixing the ingredients, levelling and forming new nursery beds of size 12 m x 1.20 m, raising the bunds and consolidating on all the sides of beds.', 'bed', 1026.57, '2026-04-17 11:31:39'),
(13, '4(b)', 'Reformation of old beds: Re-digging of old nursery beds of size 12 m x 1.20\r\nm and to a depth of 30 cm, forming nursery beds after mixing the ingredients\r\n(including pesticides) and consolidating the bunds on all sides of beds.', 'bed', 330.19, '2026-04-17 11:31:39'),
(14, '4(c)', 'Application of ingredients (Farm Yard Manure / Compost and Sand) (Quantity\r\nof Farm Yard Manure and Sand to be prescribed by the Jurisdictional Deputy / Conservator / Chief Conservator of Forests by considering the fertility and sand content in the soil of the nursery bed).', 'bed', 36.62, '2026-04-17 11:31:39'),
(15, '4(d)', 'Sowing of seeds in beds', 'bed', 43.24, '2026-04-17 11:31:39'),
(16, '4(e)', 'Covering the seed bed with grass / straw including the cost of collection and transport of grass / straw to the nursery site', 'bed', 63.18, '2026-04-17 11:31:39'),
(17, '4(f)', 'Pricking out the seedlings from the seed beds and transplanting the same to transplant beds.', 'bed', 393.15, '2026-04-17 11:31:39'),
(18, '4(g)', 'Watering the beds twice a day', 'bed / day', 20.48, '2026-04-17 11:31:39'),
(19, '4(h)', 'Weeding in seed beds / transplant beds', 'bed / weeding', 65.79, '2026-04-17 11:31:39'),
(20, '5(a)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Formation of new beds.', 'bed', 1026.57, '2026-04-17 11:31:39'),
(21, '5(b)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Reformation of old beds.', 'bed', 330.19, '2026-04-17 11:31:39'),
(22, '5(c)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Application of ingredients (Farm Yard Manure/Compost and Sand).', 'bed', 36.62, '2026-04-17 11:31:39'),
(23, '5(d)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Uprooting of Dowga / Medri bamboo seedlings from beds.', '1000', 797.61, '2026-04-17 11:31:39'),
(24, '5(e)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Transplanting of Dowga / Medri bamboo seedlings in beds.', '1000', 864.80, '2026-04-17 11:31:39'),
(25, '5(f)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Watering the beds twice a day.', 'bed / day', 20.48, '2026-04-17 11:31:39'),
(26, '5(g)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Weeding in the beds.', 'bed / weeding', 65.79, '2026-04-17 11:31:39'),
(27, '6(a)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Formation of new beds', 'bed', 1026.57, '2026-04-17 11:31:39'),
(28, '6(b)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Reformation of old beds', 'bed', 330.19, '2026-04-17 11:31:39'),
(29, '6(c)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Application of ingredients (Manure / Compost and Sand).', 'bed', 36.62, '2026-04-17 11:31:39'),
(30, '6(d)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Purchase of Marihal bamboo (Delivery at Nursery site).', '', 0.00, '2026-04-17 11:31:39'),
(31, '6(e)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Preparation of Marihal bamboo cuttings.', '1000', 2320.99, '2026-04-17 11:31:39'),
(32, '6(f)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Planting of Marihal bamboo cuttings in bed.', '1000', 1595.89, '2026-04-17 11:31:39'),
(33, '6(g)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Watering the beds twice a day.', 'bed / day', 20.48, '2026-04-17 11:31:39'),
(34, '6(h)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Weeding in the beds', 'bed / weeding', 65.79, '2026-04-17 11:31:39'),
(35, '7(a)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size -Formation of new beds.', 'bed', 1026.57, '2026-04-17 11:31:39'),
(36, '7(b)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size-Reformation of old beds.', 'bed', 330.19, '2026-04-17 11:31:39'),
(37, '7(c)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size-Application of ingredients (Manure / Compost and Sand).', 'bed', 36.62, '2026-04-17 11:31:39'),
(38, '7(d)', 'Transplanting of Agave seedlings / bulbils at 7.5 cm. X 7.5 cm. apart, including\r\nloosening of soil.', '1000', 393.15, '2026-04-17 11:31:39'),
(39, '7(e)', 'Collection and transportation of Agave bulbils from the field.', '1000', 710.63, '2026-04-17 11:31:39'),
(40, '7(f)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size-Flood watering the beds once a week.', 'week / 100 beds', 567.28, '2026-04-17 11:31:39'),
(41, '7(g)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size-Weeding in the Agave beds.', 'bed / weeding', 39.10, '2026-04-17 11:31:39'),
(42, '8(a)', 'Raising Khus grass in the Nursery beds of 12 M x 1.20 M size-Formation of new beds', 'bed', 1026.57, '2026-04-17 11:31:39'),
(43, '8(b)', 'Raising Khus grass in the Nursery beds of 12 M x 1.20 M size-Reformation of old beds.', 'bed', 330.19, '2026-04-17 11:31:39'),
(44, '8(c)', 'Raising Khus grass in the Nursery beds of 12 M x 1.20 M size-Application of ingredients (Manure / Compost and Sand).', 'bed', 36.62, '2026-04-17 11:31:39'),
(45, '8(d)', 'Raising Khus grass in the Nursery beds of 12 M x 1.20 M size-Collection of Khus grass slips.', '1000', 186.20, '2026-04-17 11:31:39'),
(46, '8(e)', 'Transplanting of Khus grass slips in nursery beds.', '1000', 180.94, '2026-04-17 11:31:39'),
(47, '8(f)', 'Raising Khus grass in the Nursery beds of 12 M x 1.20 M size-Watering the beds twice a day', 'bed / day', 20.48, '2026-04-17 11:31:39'),
(48, '8(g)', 'Raising Khus grass in the Nursery beds of 12 M x 1.20 M size-Weeding in the beds', 'bed / weeding', 39.10, '2026-04-17 11:31:39'),
(49, '9(a)', 'Formation of new beds: Preparation of raised standard nursery beds of size12 m x 1.20 m x 0.30 m, by deep digging up to 45 cm depth, including breaking of clods, levelling, etc.', 'Bed', 953.33, '2026-04-17 11:31:39'),
(50, '9(b)', 'Reformation of old beds: Reformation of the old raised nursery beds of standard size of size 12 m x 1.20 m, [\"old\" means beds used in the previous calender year].', 'Bed', 586.52, '2026-04-17 11:31:39'),
(51, '9(c)', 'Uprooting of stumps of trees of above 60 cm girth existing in the nursery bed space for raising new nursery (To be allowed by the DCF / CF / CCF for raising new beds only in rare cases).', 'Stump', 399.14, '2026-04-17 11:31:39'),
(52, '9(d)', 'Pre-treatment of teak fruits at the rate of 6 Kg of fruits per bed - including soaking in cow-dung slurry for 7 days followed by drying the same for 7 days, repeating the operation thrice (total 42 days).', 'bed', 117.30, '2026-04-17 11:31:39'),
(53, '9(e)', 'Sowing the fruits in beds.', 'Bed', 78.50, '2026-04-17 11:31:39'),
(54, '9(f)(i)', 'Weeding in beds of Teak and other hardwood species like Matthi, Nandi Honne,Boorga,sewood etc., where stumps are to be prepared from theseedlings For the first three weedings.', 'Bed / weeding', 146.48, '2026-04-17 11:31:39'),
(55, '9(f)(ii)', 'Weeding in beds of Teak and other hardwood species like Matthi, Nandi  Honne,Boorga,sewood etc., where stumps are to be prepared from theseedlings.For 4th and subsequent weedings.', 'Bed / weeding', 51.51, '2026-04-17 11:31:39');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', 'admin123', 'admin', '2026-04-17 10:59:29'),
(2, 'nesaragi', '1234', 'user', '2026-04-17 11:00:17'),
(3, 'hukkeri', '1234', 'user', '2026-04-17 11:00:32');

-- --------------------------------------------------------

--
-- Table structure for table `vouchers`
--

CREATE TABLE `vouchers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `scheme_name` varchar(50) NOT NULL,
  `voucher_no` varchar(50) NOT NULL,
  `indent_id` int(11) NOT NULL,
  `indent_no` varchar(50) DEFAULT NULL,
  `sono` varchar(100) DEFAULT NULL,
  `month_name` varchar(30) DEFAULT NULL,
  `head_name` varchar(255) DEFAULT NULL,
  `contractor_name` varchar(255) DEFAULT NULL,
  `disbursement_date` date DEFAULT NULL,
  `gross_amount` decimal(12,2) DEFAULT 0.00,
  `round_off` decimal(12,2) DEFAULT 0.00,
  `rounded_gross_amount` decimal(12,2) DEFAULT 0.00,
  `vat_percent` decimal(5,2) DEFAULT 0.00,
  `vat_amount` decimal(12,2) DEFAULT 0.00,
  `it_percent` decimal(5,2) DEFAULT 0.00,
  `it_amount` decimal(12,2) DEFAULT 0.00,
  `sc_percent` decimal(5,2) DEFAULT 0.00,
  `sc_amount` decimal(12,2) DEFAULT 0.00,
  `ed_percent` decimal(5,2) DEFAULT 0.00,
  `ed_amount` decimal(12,2) DEFAULT 0.00,
  `other_percent` decimal(5,2) DEFAULT 0.00,
  `other_amount` decimal(12,2) DEFAULT 0.00,
  `total_deduction` decimal(12,2) DEFAULT 0.00,
  `net_amount` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vouchers`
--

INSERT INTO `vouchers` (`id`, `user_id`, `scheme_name`, `voucher_no`, `indent_id`, `indent_no`, `sono`, `month_name`, `head_name`, `contractor_name`, `disbursement_date`, `gross_amount`, `round_off`, `rounded_gross_amount`, `vat_percent`, `vat_amount`, `it_percent`, `it_amount`, `sc_percent`, `sc_amount`, `ed_percent`, `ed_amount`, `other_percent`, `other_amount`, `total_deduction`, `net_amount`, `created_at`) VALUES
(31, 2, 'CAMPA', 'VTR 1', 19, '1', 'DSO/CAMPA/200', 'April - 2026', 'CAMPA', 'vinod karaganvi', '2026-04-18', 80678.36, -0.36, 80678.00, 0.00, 0.00, 2.00, 1613.57, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1613.57, 79064.79, '2026-04-24 09:38:28'),
(32, 2, 'CAMPA', 'VTR 2', 19, '1', 'DSO/CAMPA/200', 'April - 2026', 'CAMPA', 'vinod karaganvi', '2026-04-18', 44322.00, 0.00, 44322.00, 0.00, 0.00, 2.00, 886.44, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 886.44, 43435.56, '2026-04-24 09:38:29'),
(33, 2, 'GENERAL', 'VTR 1', 22, '4', 'DSO /GEN /Test', 'April - 2026', 'Bamboo mission', 'vinod karaganvi', '2026-04-18', 67231.97, 0.03, 67232.00, 0.00, 0.00, 2.00, 1344.64, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1344.64, 65887.33, '2026-04-24 09:40:01'),
(34, 2, 'GENERAL', 'VTR 2', 22, '4', 'DSO /GEN /Test', 'April - 2026', 'Bamboo mission', 'vinod karaganvi', '2026-04-18', 67231.97, 0.03, 67232.00, 0.00, 0.00, 2.00, 1344.64, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1344.64, 65887.33, '2026-04-24 09:40:01'),
(35, 2, 'GENERAL', 'VTR 3', 22, '4', 'DSO /GEN /Test', 'April - 2026', 'Bamboo mission', 'vinod karaganvi', '2026-04-18', 67231.96, 0.04, 67232.00, 0.00, 0.00, 2.00, 1344.64, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1344.64, 65887.32, '2026-04-24 09:40:01'),
(36, 2, 'GENERAL', 'VTR 4', 22, '4', 'DSO /GEN /Test', 'April - 2026', 'Bamboo mission', 'vinod karaganvi', '2026-04-18', 51328.50, 0.50, 51329.00, 0.00, 0.00, 2.00, 1026.57, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1026.57, 50301.93, '2026-04-24 09:40:01'),
(37, 2, 'GENERAL', 'VTR 5', 22, '4', 'DSO /GEN /Test', 'April - 2026', 'Bamboo mission', 'vinod karaganvi', '2026-04-18', 51328.50, 0.50, 51329.00, 0.00, 0.00, 2.00, 1026.57, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1026.57, 50301.93, '2026-04-24 09:40:01'),
(38, 2, 'GENERAL', 'VTR 6', 22, '4', 'DSO /GEN /Test', 'April - 2026', 'Bamboo mission', 'vinod karaganvi', '2026-04-18', 5647.00, 0.00, 5647.00, 0.00, 0.00, 2.00, 112.94, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 112.94, 5534.06, '2026-04-24 09:40:01'),
(39, 2, 'GENERAL', 'VTR 1', 24, '6', 'DSO: 444/2025-2026', 'May - 2026', '4406-01-101-0-04--139 GUA', 'Irappa Ramachandra  Karaganvi', '2026-05-08', 82999.89, 0.11, 83000.00, 0.00, 0.00, 2.00, 1660.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1660.00, 81339.89, '2026-04-24 09:41:10'),
(40, 2, 'GENERAL', 'VTR 2', 25, '7', 'DSO: 555/2025-26', 'May - 2026', '4406-01-101-0-04--139 GUA CAMPA', 'vinod karaganvi', '2026-05-10', 82999.89, 0.11, 83000.00, 0.00, 0.00, 2.00, 1660.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1660.00, 81339.89, '2026-04-24 09:41:47');

-- --------------------------------------------------------

--
-- Table structure for table `voucher_items`
--

CREATE TABLE `voucher_items` (
  `id` int(11) NOT NULL,
  `voucher_id` int(11) NOT NULL,
  `indent_item_id` int(11) DEFAULT NULL,
  `sr_no` varchar(50) DEFAULT NULL,
  `particulars` text DEFAULT NULL,
  `qty` decimal(12,2) DEFAULT 0.00,
  `days` decimal(12,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT NULL,
  `rate` decimal(12,2) DEFAULT 0.00,
  `rate_per` decimal(12,2) DEFAULT 0.00,
  `original_amount` decimal(12,2) DEFAULT 0.00,
  `voucher_split_amount` decimal(12,2) DEFAULT 0.00,
  `acf_date` varchar(100) DEFAULT NULL,
  `nb_no` varchar(100) DEFAULT NULL,
  `pow` varchar(100) DEFAULT NULL,
  `rfo_date` varchar(100) DEFAULT NULL,
  `wages_from` varchar(100) DEFAULT NULL,
  `wages` decimal(12,2) DEFAULT 0.00,
  `times_days` decimal(12,2) DEFAULT 0.00,
  `page_no` varchar(100) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `voucher_items`
--

INSERT INTO `voucher_items` (`id`, `voucher_id`, `indent_item_id`, `sr_no`, `particulars`, `qty`, `days`, `unit`, `rate`, `rate_per`, `original_amount`, `voucher_split_amount`, `acf_date`, `nb_no`, `pow`, `rfo_date`, `wages_from`, `wages`, `times_days`, `page_no`) VALUES
(50, 31, 43, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 80678.36, 80678.36, '', '', '', '', '', 0.00, 2.00, ''),
(51, 32, 44, '3(b)', 'Collection of Seeds and Seedlings if Collection of teak fruits', 1.00, 0.00, 'Ke.', 44322.00, 1.00, 44322.00, 44322.00, '', '', '', '', '', 0.00, 1.00, ''),
(52, 33, 49, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 201695.90, 67231.97, '', '', '', '', '', 0.00, 5.00, ''),
(53, 34, 49, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 201695.90, 67231.97, '', '', '', '', '', 0.00, 5.00, ''),
(54, 35, 49, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 201695.90, 67231.96, '', '', '', '', '', 0.00, 5.00, ''),
(55, 36, 50, '7(a)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size -Formation of new beds.', 100.00, 0.00, 'bed', 1026.57, 1.00, 102657.00, 51328.50, '', '', '', '', '', 0.00, 1.00, ''),
(56, 37, 50, '7(a)', 'Raising of Agave Suckers in Nursery beds of 12 M x 1.20 M size -Formation of new beds.', 100.00, 0.00, 'bed', 1026.57, 1.00, 102657.00, 51328.50, '', '', '', '', '', 0.00, 1.00, ''),
(57, 38, 51, '6(a)', 'Raising of Marihal bamboo (Dendrocalamus stocksi) in Nursery beds of 12 M x 1.20 M size.Formation of new beds', 1.00, 0.00, 'bed', 5647.00, 1.00, 5647.00, 5647.00, '', '', '', '', '', 0.00, 1.00, ''),
(58, 39, 59, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 40339.18, 40339.18, '2026-05-11 00:00:00.000', '2566', '11-05-2026 to 14-05-2026', '', '', 0.00, 1.00, '35'),
(59, 39, 60, '4(a)', 'Formation of new beds: Aligning the nursery beds, clearing of debris, digging of soil 30 cm. deep and allowing the soil for weathering, breaking of clods, mixing the ingredients, levelling and forming new nursery beds of size 12 m x 1.20 m, raising the bunds and consolidating on all the sides of beds.', 3.00, 0.00, 'bed', 1026.57, 1.00, 3079.71, 3079.71, '2026-05-12 00:00:00.000', '2566', '11-05-2026 to 14-05-2026', '', '', 0.00, 1.00, '35'),
(60, 39, 61, '5(e)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Transplanting of Dowga / Medri bamboo seedlings in beds.', 5.00, 0.00, '1000', 864.80, 1.00, 4324.00, 4324.00, '2026-05-13 00:00:00.000', '2566', '11-05-2026 to 14-05-2026', '', '', 0.00, 1.00, '35'),
(61, 39, 62, '4(c)', 'Application of ingredients (Farm Yard Manure / Compost and Sand) (Quantityof Farm Yard Manure and Sand to be prescribed by the Jurisdictional Deputy / Conservator / Chief Conservator of Forests by considering the fertility and sand content in the soil of the nursery bed).', 1.00, 0.00, 'bed', 35257.00, 1.00, 35257.00, 35257.00, '2026-05-14 00:00:00.000', '2566', '11-05-2026 to 14-05-2026', '', '', 0.00, 1.00, '35'),
(62, 40, 63, '1(a)', 'Preparation of site to form new nursery by clearing weeds, shrubs and small trees by cutting and uprooting the growth and transporting cut materials to theperiphery in case of -Thick growth area.', 1.00, 0.00, 'Ha.', 40339.18, 1.00, 40339.18, 40339.18, '2026-05-12 00:00:00.000', '2366', '12/05/2025 to 15/05/2025', '', '', 0.00, 1.00, '35'),
(63, 40, 64, '4(a)', 'Formation of new beds: Aligning the nursery beds, clearing of debris, digging of soil 30 cm. deep and allowing the soil for weathering, breaking of clods, mixing the ingredients, levelling and forming new nursery beds of size 12 m x 1.20 m, raising the bunds and consolidating on all the sides of beds.', 3.00, 0.00, 'bed', 1026.57, 1.00, 3079.71, 3079.71, '2026-06-13 00:00:00.000', '2366', '12/05/2025 to 15/05/2025', '', '', 0.00, 1.00, '35'),
(64, 40, 65, '5(e)', 'Raising of Dowga / Medari and other Bamboo Rhizomes in Nursery beds of 12 M x 1.20 M size.Transplanting of Dowga / Medri bamboo seedlings in beds.', 5.00, 0.00, '1000', 864.80, 1.00, 4324.00, 4324.00, '2026-06-14 00:00:00.000', '2366', '12/05/2025 to 15/05/2025', '', '', 0.00, 1.00, '35'),
(65, 40, 66, '4(c)', 'Application of ingredients (Farm Yard Manure / Compost and Sand) (Quantityof Farm Yard Manure and Sand to be prescribed by the Jurisdictional Deputy / Conservator / Chief Conservator of Forests by considering the fertility and sand content in the soil of the nursery bed).', 1.00, 0.00, 'bed', 35257.00, 1.00, 35257.00, 35257.00, '2026-06-15 00:00:00.000', '2366', '12/05/2025 to 15/05/2025', '', '', 0.00, 1.00, '35');

-- --------------------------------------------------------

--
-- Table structure for table `voucher_sequence`
--

CREATE TABLE `voucher_sequence` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `scheme_name` varchar(50) NOT NULL,
  `month_name` varchar(50) NOT NULL,
  `last_voucher_no` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `voucher_sequence`
--

INSERT INTO `voucher_sequence` (`id`, `user_id`, `scheme_name`, `month_name`, `last_voucher_no`) VALUES
(11, 2, 'CAMPA', 'April - 2026', 2),
(12, 2, 'GENERAL', 'April - 2026', 6),
(13, 2, 'GENERAL', 'May - 2026', 2);

-- --------------------------------------------------------

--
-- Table structure for table `works`
--

CREATE TABLE `works` (
  `id` int(11) NOT NULL,
  `work_name` varchar(255) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `works`
--

INSERT INTO `works` (`id`, `work_name`, `user_id`, `created_at`) VALUES
(1, 'Plantation of Bamboo ', 2, '2026-04-17 11:36:53'),
(2, 'CAMPA', 2, '2026-04-21 11:36:35'),
(3, 'Maintainance of First year Plantation', 2, '2026-04-24 05:38:40');

-- --------------------------------------------------------

--
-- Table structure for table `year_master`
--

CREATE TABLE `year_master` (
  `id` int(11) NOT NULL,
  `year` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `year_master`
--

INSERT INTO `year_master` (`id`, `year`, `created_at`) VALUES
(1, '2024-2025', '2026-04-17 11:43:16'),
(2, '2025-2026', '2026-04-17 11:43:16');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contractors`
--
ALTER TABLE `contractors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `estimate_details`
--
ALTER TABLE `estimate_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `estimate_master_defaults`
--
ALTER TABLE `estimate_master_defaults`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `estimate_sanctions`
--
ALTER TABLE `estimate_sanctions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `estimate_ssr_items`
--
ALTER TABLE `estimate_ssr_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `estimate_id` (`estimate_id`);

--
-- Indexes for table `estimate_type_master`
--
ALTER TABLE `estimate_type_master`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `estimate_type_name` (`estimate_type`);

--
-- Indexes for table `hoa`
--
ALTER TABLE `hoa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indent_entries`
--
ALTER TABLE `indent_entries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `indent_ssr_items`
--
ALTER TABLE `indent_ssr_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ranges`
--
ALTER TABLE `ranges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `section_master`
--
ALTER TABLE `section_master`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ssr_master`
--
ALTER TABLE `ssr_master`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vouchers`
--
ALTER TABLE `vouchers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `voucher_items`
--
ALTER TABLE `voucher_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `voucher_sequence`
--
ALTER TABLE `voucher_sequence`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_scheme_month` (`user_id`,`scheme_name`,`month_name`);

--
-- Indexes for table `works`
--
ALTER TABLE `works`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `year_master`
--
ALTER TABLE `year_master`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `year_name` (`year`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `contractors`
--
ALTER TABLE `contractors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `estimate_details`
--
ALTER TABLE `estimate_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `estimate_master_defaults`
--
ALTER TABLE `estimate_master_defaults`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estimate_sanctions`
--
ALTER TABLE `estimate_sanctions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `estimate_ssr_items`
--
ALTER TABLE `estimate_ssr_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT for table `estimate_type_master`
--
ALTER TABLE `estimate_type_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hoa`
--
ALTER TABLE `hoa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `indent_entries`
--
ALTER TABLE `indent_entries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `indent_ssr_items`
--
ALTER TABLE `indent_ssr_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `ranges`
--
ALTER TABLE `ranges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `section_master`
--
ALTER TABLE `section_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ssr_master`
--
ALTER TABLE `ssr_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vouchers`
--
ALTER TABLE `vouchers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `voucher_items`
--
ALTER TABLE `voucher_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- AUTO_INCREMENT for table `voucher_sequence`
--
ALTER TABLE `voucher_sequence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `works`
--
ALTER TABLE `works`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `year_master`
--
ALTER TABLE `year_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `estimate_ssr_items`
--
ALTER TABLE `estimate_ssr_items`
  ADD CONSTRAINT `estimate_ssr_items_ibfk_1` FOREIGN KEY (`estimate_id`) REFERENCES `estimate_details` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
