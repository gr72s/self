package com.iamalangreen.self.rbac.dto

data class UserResponse(
    val id: Long,
    val username: String,
    val email: String,
    val roles: Set<String>
)