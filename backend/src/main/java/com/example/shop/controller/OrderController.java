package com.example.shop.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.shop.common.ApiResponse;
import com.example.shop.dto.OrderDetailResponse;
import com.example.shop.entity.OrderItem;
import com.example.shop.entity.Orders;
import com.example.shop.entity.Product;
import com.example.shop.mapper.OrderItemMapper;
import com.example.shop.mapper.OrdersMapper;
import com.example.shop.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrdersMapper ordersMapper;
    private final OrderItemMapper orderItemMapper;
    private final ProductMapper productMapper;

    @GetMapping
    public ApiResponse<List<Orders>> list(@RequestParam(required = false) Long userId) {
        LambdaQueryWrapper<Orders> qw = new LambdaQueryWrapper<>();
        if (userId != null) {
            qw.eq(Orders::getUserId, userId);
        }
        return ApiResponse.ok(ordersMapper.selectList(qw));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderDetailResponse> detail(@PathVariable Long id) {
        Orders order = ordersMapper.selectById(id);
        List<OrderItem> items = orderItemMapper.selectList(new LambdaQueryWrapper<OrderItem>()
                .eq(OrderItem::getOrderId, id));
        List<Product> products = productMapper.selectList(null);
        Map<Long, String> productNameMap = new HashMap<>();
        for (Product product : products) {
            productNameMap.put(product.getId(), product.getName());
        }
        OrderDetailResponse detail = new OrderDetailResponse();
        detail.setOrder(order);
        detail.setItems(items.stream().map(item -> {
            OrderDetailResponse.Item i = new OrderDetailResponse.Item();
            i.setProductId(item.getProductId());
            i.setProductName(productNameMap.get(item.getProductId()));
            i.setQuantity(item.getQuantity());
            i.setProductWeight(item.getProductWeight());
            i.setProductOriginalAmount(item.getProductOriginalAmount());
            i.setProductSaleAmount(item.getProductSaleAmount());
            return i;
        }).toList());
        return ApiResponse.ok(detail);
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody Orders order) {
        ordersMapper.insert(order);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody Orders order) {
        order.setId(id);
        ordersMapper.updateById(order);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        ordersMapper.deleteById(id);
        return ApiResponse.ok();
    }
}
