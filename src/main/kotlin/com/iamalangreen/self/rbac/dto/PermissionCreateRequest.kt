package com.iamalangreen.self.rbac.dto

import jakarta.validation.constraints.NotBlank

data class PermissionCreateRequest(
    @field:NotBlank(message = "Permission name cannot be blank")
    val name: String
)