package com.iamalangreen.self.rbac.dto

data class RoleResponse(
    val id: Long,
    val name: String,
    val permissions: Set<String>
)