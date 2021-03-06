-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: docchain
-- ------------------------------------------------------
-- Server version	5.7.20-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `fileactions`
--
CREATE TABLE `fileactions` (
  `ActionTime` datetime NOT NULL,
  `FileID` varchar(64) NOT NULL,
  `StoragePlatform` varchar(20) NOT NULL,
  `ActionType` varchar(20) NOT NULL,
  `UserName` varchar(64) NOT NULL,
  `UserEmail` varchar(64) NOT NULL,
  `FileHash` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`fileID`,`StoragePlatform`,`ActionTime`),
  KEY `index_file` (`FileID`,`StoragePlatform`),
  KEY `index_user` (`UserEmail`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fileactions`
--
LOCK TABLES `fileactions` WRITE;
/*!40000 ALTER TABLE `fileactions` DISABLE KEYS */;
INSERT INTO `fileactions` VALUES ('2018-01-14 18:40:00','263262635409','Box','Preview','Matt Smith','smmath@deakin.edu.au','fbfe7fc35ac24fd40b83c41f7e7e515a8751af3c');
/*!40000 ALTER TABLE `fileactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trackedfiles`
--
CREATE TABLE `trackedfiles` (
  `FileID` varchar(64) NOT NULL,
  `Platform` varchar(24) NOT NULL,
  PRIMARY KEY (`FileID`),
  UNIQUE KEY `FileID_UNIQUE` (`FileID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trackedfiles`
--
LOCK TABLES `trackedfiles` WRITE;
/*!40000 ALTER TABLE `trackedfiles` DISABLE KEYS */;
INSERT INTO `trackedfiles` VALUES ('testFile','testPlatform');
/*!40000 ALTER TABLE `trackedfiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `ID` varchar(10) DEFAULT NULL,
  `BoxID` varchar(10) DEFAULT NULL,
  `GoogleID` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-01-01 22:36:36
