package com.example.shop;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.example.shop.mapper")
public class ShopBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShopBackendApplication.class, args);
    }
}
