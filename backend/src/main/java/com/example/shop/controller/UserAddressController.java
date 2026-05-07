package com.example.shop.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.shop.common.ApiResponse;
import com.example.shop.entity.UserAddress;
import com.example.shop.mapper.UserAddressMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-addresses")
@RequiredArgsConstructor
public class UserAddressController {
    private final UserAddressMapper userAddressMapper;

    @GetMapping
    public ApiResponse<List<UserAddress>> list(@RequestParam Long userId) {
        return ApiResponse.ok(userAddressMapper.selectList(
                new LambdaQueryWrapper<UserAddress>()
                        .eq(UserAddress::getUserId, userId)
                        .orderByDesc(UserAddress::getId)
        ));
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody UserAddress address) {
        userAddressMapper.insert(address);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody UserAddress address) {
        address.setId(id);
        userAddressMapper.updateById(address);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        userAddressMapper.deleteById(id);
        return ApiResponse.ok();
    }
}

