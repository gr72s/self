package com.iamalangreen.self.auth.dto

import jakarta.validation.constraints.NotBlank

data class DeviceAuthRequest(
    @field:NotBlank(message = "Device ID cannot be blank")
    val deviceId: String,
    
    @field:NotBlank(message = "Device info cannot be blank")
    val deviceInfo: String
)
