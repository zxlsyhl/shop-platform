CREATE DATABASE IF NOT EXISTS shop_platform DEFAULT CHARACTER SET utf8mb4;
USE shop_platform;

CREATE TABLE IF NOT EXISTS product (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  spec VARCHAR(100),
  ingredient VARCHAR(255),
  original_price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  image_url VARCHAR(255),
  maintainer VARCHAR(100),
  launch_date DATE
);

CREATE TABLE IF NOT EXISTS user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) UNIQUE NOT NULL,
  password VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(64) UNIQUE NOT NULL,
  password VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(64),
  order_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  order_date DATE,
  order_time TIME,
  order_status VARCHAR(32),
  payment_id VARCHAR(64),
  payment_status VARCHAR(32),
  logistics_id VARCHAR(64),
  logistics_status VARCHAR(32),
  user_id BIGINT,
  shipping_address VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS order_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT,
  product_weight DECIMAL(10,2),
  product_original_amount DECIMAL(10,2),
  product_sale_amount DECIMAL(10,2)
);

INSERT INTO admin_user(username, password) VALUES ('admin', '123456');
INSERT INTO user(username, password) VALUES ('user1', '123456');
INSERT INTO product(name, spec, ingredient, original_price, sale_price, image_url, maintainer, launch_date)
VALUES ('示例商品A', '500g', '配方A', 99.00, 79.00, 'https://dummyimage.com/300x300', '张三', '2026-05-01');
INSERT INTO product(name, spec, ingredient, original_price, sale_price, image_url, maintainer, launch_date)
VALUES ('示例商品B', '1kg', '配方B', 129.00, 99.00, 'https://dummyimage.com/300x300', '李四', '2026-05-02');

INSERT INTO orders(order_no, order_amount, paid_amount, order_date, order_time, order_status, payment_id, payment_status, logistics_id, logistics_status, user_id, shipping_address)
VALUES ('SO202605060001', 178.00, 158.00, '2026-05-06', '10:30:00', '已支付', 'PAY001', '支付成功', 'LOG001', '运输中', 1, '上海市浦东新区测试路1号');

INSERT INTO order_item(order_id, product_id, quantity, product_weight, product_original_amount, product_sale_amount)
VALUES (1, 1, 1, 0.50, 99.00, 79.00),
       (1, 2, 1, 1.00, 129.00, 99.00);
