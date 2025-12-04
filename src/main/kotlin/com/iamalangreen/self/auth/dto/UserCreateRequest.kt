package com.iamalangreen.self.auth.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank

data class UserCreateRequest(
    @field:NotBlank(message = "Username cannot be blank")
    val username: String,
    @field:NotBlank(message = "Password cannot be blank")
    val password: String,
    @field:NotBlank(message = "Email cannot be blank")
    @field:Email(message = "Invalid email format")
    val email: String,
)