# shorten-url

### Prerequisites

- Mysql8
- Create a database
- create table `urls`
  ```sql
  DROP TABLE IF EXISTS `urls`;
  CREATE TABLE `urls` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `url` text,
  PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  ```

### Environment needs to configure

```
process.env.SELF_URL || 'http://localhost:3000/'
process.env.AUTH_TOKEN || 'test'
MYSQL_HOST || '127.0.0.1'
MYSQL_PORT || 3306
MYSQL_USER || 'root'
MYSQL_PASSWORD || 'root'
MYSQL_DB || 'shorten_db'

```

### See the postman to using it. `shorten.postman_collection.json`
