package com.iamalangreen.self.rbac.dto

import jakarta.validation.constraints.NotBlank

data class AssignRoleRequest(
    @field:NotBlank(message = "Role name cannot be blank")
    val roleName: String
)