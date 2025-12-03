package com.iamalangreen.self.rbac.controller

import com.iamalangreen.self.rbac.dto.AuthRequest
import com.iamalangreen.self.rbac.dto.AuthResponse
import com.iamalangreen.self.rbac.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/authenticate")
    fun authenticate(@RequestBody request: AuthRequest): ResponseEntity<AuthResponse> {
        val authResponse = authService.authenticate(request)
        return ResponseEntity.ok(authResponse)
    }

}