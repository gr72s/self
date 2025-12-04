package com.iamalangreen.self.auth.dto

data class UserResponse(
    val id: Long,
    val username: String,
    val email: String,
)