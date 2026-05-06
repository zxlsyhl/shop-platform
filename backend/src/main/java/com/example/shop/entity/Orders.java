package com.example.shop.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@TableName("orders")
public class Orders {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private BigDecimal orderAmount;
    private BigDecimal paidAmount;
    private LocalDate orderDate;
    private LocalTime orderTime;
    private String orderStatus;
    private String paymentId;
    private String paymentStatus;
    private String logisticsId;
    private String logisticsStatus;
    private Long userId;
    private String shippingAddress;
}
