package com.example.shop.controller;

import com.example.shop.common.ApiResponse;
import com.example.shop.entity.Product;
import com.example.shop.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductMapper productMapper;

    @GetMapping
    public ApiResponse<List<Product>> list() {
        return ApiResponse.ok(productMapper.selectList(null));
    }

    @GetMapping("/{id}")
    public ApiResponse<Product> detail(@PathVariable Long id) {
        return ApiResponse.ok(productMapper.selectById(id));
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody Product product) {
        productMapper.insert(product);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        productMapper.updateById(product);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productMapper.deleteById(id);
        return ApiResponse.ok();
    }
}
