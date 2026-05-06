package com.example.shop.controller;

import com.example.shop.common.ApiResponse;
import com.example.shop.entity.AdminUser;
import com.example.shop.mapper.AdminUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin-users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserMapper adminUserMapper;

    @GetMapping
    public ApiResponse<List<AdminUser>> list() {
        return ApiResponse.ok(adminUserMapper.selectList(null));
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody AdminUser user) {
        adminUserMapper.insert(user);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody AdminUser user) {
        user.setId(id);
        adminUserMapper.updateById(user);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        adminUserMapper.deleteById(id);
        return ApiResponse.ok();
    }
}
