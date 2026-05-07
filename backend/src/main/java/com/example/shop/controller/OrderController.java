package com.example.shop.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.shop.common.ApiResponse;
import com.example.shop.dto.OrderDetailResp;
import com.example.shop.dto.request.SubmitOrderRequest;
import com.example.shop.entity.OrderItem;
import com.example.shop.entity.Orders;
import com.example.shop.entity.Product;
import com.example.shop.mapper.OrderItemMapper;
import com.example.shop.mapper.OrdersMapper;
import com.example.shop.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
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
    public ApiResponse<OrderDetailResp> detail(@PathVariable Long id) {
        Orders order = ordersMapper.selectById(id);
        List<OrderItem> items = orderItemMapper.selectList(new LambdaQueryWrapper<OrderItem>()
                .eq(OrderItem::getOrderId, id));
        List<Product> products = productMapper.selectList(null);
        Map<Long, String> productNameMap = new HashMap<>();
        for (Product product : products) {
            productNameMap.put(product.getId(), product.getName());
        }
        OrderDetailResp detail = new OrderDetailResp();
        detail.setOrder(order);
        detail.setItems(items.stream().map(item -> {
            OrderDetailResp.Item i = new OrderDetailResp.Item();
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

    @PostMapping("/submit")
    @Transactional
    public ApiResponse<Long> submit(@RequestBody SubmitOrderRequest request) {
        if (request.getUserId() == null || request.getItems() == null || request.getItems().isEmpty()) {
            return ApiResponse.ok(null);
        }

        List<Long> productIds = request.getItems().stream()
                .map(SubmitOrderRequest.Item::getProductId)
                .toList();
        List<Product> products = productMapper.selectBatchIds(productIds);
        Map<Long, Product> productMap = new HashMap<>();
        for (Product p : products) {
            productMap.put(p.getId(), p);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        for (SubmitOrderRequest.Item item : request.getItems()) {
            Product p = productMap.get(item.getProductId());
            if (p == null || item.getQuantity() == null || item.getQuantity() <= 0) continue;
            totalAmount = totalAmount.add(p.getSalePrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        Orders order = new Orders();
        order.setOrderNo("SO" + System.currentTimeMillis());
        order.setOrderAmount(totalAmount);
        order.setPaidAmount(BigDecimal.ZERO);
        order.setOrderDate(LocalDate.now());
        order.setOrderTime(LocalTime.now());
        order.setOrderStatus("待支付");
        order.setPaymentStatus("未支付");
        order.setUserId(request.getUserId());
        order.setShippingAddress(request.getShippingAddress());
        ordersMapper.insert(order);

        Long orderId = order.getId();
        for (SubmitOrderRequest.Item item : request.getItems()) {
            Product p = productMap.get(item.getProductId());
            if (p == null || item.getQuantity() == null || item.getQuantity() <= 0) continue;
            OrderItem oi = new OrderItem();
            oi.setOrderId(orderId);
            oi.setProductId(p.getId());
            oi.setQuantity(item.getQuantity());
            oi.setProductWeight(BigDecimal.ZERO);
            oi.setProductOriginalAmount(p.getOriginalPrice());
            oi.setProductSaleAmount(p.getSalePrice());
            orderItemMapper.insert(oi);
        }

        return ApiResponse.ok(orderId);
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
