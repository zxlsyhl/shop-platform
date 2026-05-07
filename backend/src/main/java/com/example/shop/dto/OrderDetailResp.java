package com.example.shop.dto;

import com.example.shop.entity.Orders;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderDetailResp {
    private Orders order;
    private List<Item> items;

    @Data
    public static class Item {
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal productWeight;
        private BigDecimal productOriginalAmount;
        private BigDecimal productSaleAmount;
    }
}
