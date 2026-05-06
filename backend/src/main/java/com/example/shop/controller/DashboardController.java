package com.example.shop.controller;

import com.example.shop.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/rankings")
    public ApiResponse<Map<String, Object>> rankings() {
        List<Map<String, Object>> productSalesRank = jdbcTemplate.queryForList("""
                SELECT p.id, p.name, COALESCE(SUM(oi.quantity), 0) AS totalQty
                FROM product p
                LEFT JOIN order_item oi ON p.id = oi.product_id
                GROUP BY p.id, p.name
                ORDER BY totalQty DESC
                LIMIT 10
                """);

        List<Map<String, Object>> userOrderRank = jdbcTemplate.queryForList("""
                SELECT u.id, u.username, COALESCE(SUM(o.order_amount), 0) AS totalOrderAmount
                FROM user u
                LEFT JOIN orders o ON u.id = o.user_id
                GROUP BY u.id, u.username
                ORDER BY totalOrderAmount DESC
                LIMIT 10
                """);

        Map<String, Object> result = new HashMap<>();
        result.put("productSalesRank", productSalesRank);
        result.put("userOrderRank", userOrderRank);
        return ApiResponse.ok(result);
    }
}
