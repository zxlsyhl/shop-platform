package com.example.shop.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@TableName("product")
public class Product {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String spec;
    private String ingredient;
    private BigDecimal originalPrice;
    private BigDecimal salePrice;
    private String imageUrl;
    private String maintainer;
    private LocalDate launchDate;
}
