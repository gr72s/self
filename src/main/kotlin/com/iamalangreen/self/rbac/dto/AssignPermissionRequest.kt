package com.iamalangreen.self.rbac.dto

import jakarta.validation.constraints.NotBlank

data class AssignPermissionRequest(
    @field:NotBlank(message = "Permission name cannot be blank")
    val permissionName: String
)