package com.iamalangreen.self.rbac.dto

import jakarta.validation.constraints.NotBlank

data class RoleCreateRequest(
    @field:NotBlank(message = "Role name cannot be blank")
    val name: String,
    val permissionNames: Set<String>? = emptySet() // 可选，创建角色时分配权限
)