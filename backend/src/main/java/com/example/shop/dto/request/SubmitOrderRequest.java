package com.example.shop.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class SubmitOrderRequest {
    private Long userId;
    private String shippingAddress;
    private List<Item> items;

    @Data
    public static class Item {
        private Long productId;
        private Integer quantity;
    }
}

