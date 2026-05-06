package com.example.shop.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.shop.common.ApiResponse;
import com.example.shop.dto.request.LoginRequest;
import com.example.shop.entity.AdminUser;
import com.example.shop.entity.User;
import com.example.shop.mapper.AdminUserMapper;
import com.example.shop.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserMapper userMapper;
    private final AdminUserMapper adminUserMapper;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
        boolean admin = "admin".equalsIgnoreCase(request.getRole());
        boolean pass;
        Long userId;
        if (admin) {
            AdminUser u = adminUserMapper.selectOne(new LambdaQueryWrapper<AdminUser>()
                    .eq(AdminUser::getUsername, request.getUsername())
                    .eq(AdminUser::getPassword, request.getPassword()));
            pass = u != null;
            userId = u == null ? null : u.getId();
        } else {
            User u = userMapper.selectOne(new LambdaQueryWrapper<User>()
                    .eq(User::getUsername, request.getUsername())
                    .eq(User::getPassword, request.getPassword()));
            pass = u != null;
            userId = u == null ? null : u.getId();
        }
        Map<String, Object> result = new HashMap<>();
        result.put("success", pass);
        result.put("token", pass ? request.getRole() + "-token-" + userId : "");
        result.put("userId", userId);
        return ApiResponse.ok(result);
    }
}
