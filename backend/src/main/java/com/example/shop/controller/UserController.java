package com.example.shop.controller;

import com.example.shop.common.ApiResponse;
import com.example.shop.entity.User;
import com.example.shop.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserMapper userMapper;

    @GetMapping
    public ApiResponse<List<User>> list() {
        return ApiResponse.ok(userMapper.selectList(null));
    }

    @PostMapping
    public ApiResponse<Void> create(@RequestBody User user) {
        userMapper.insert(user);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> update(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        userMapper.updateById(user);
        return ApiResponse.ok();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        userMapper.deleteById(id);
        return ApiResponse.ok();
    }
}
