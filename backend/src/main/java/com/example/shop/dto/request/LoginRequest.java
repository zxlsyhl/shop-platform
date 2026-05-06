package com.example.shop.dto.request;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
    private String role;
}
