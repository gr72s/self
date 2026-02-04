package com.iamalangreen.self.auth

import com.iamalangreen.self.auth.UserResponse
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService,
) {

    @GetMapping("/current")
    fun getUser(): ResponseEntity<UserResponse> {
        // Get authenticated user ID from SecurityContext
        val authentication = SecurityContextHolder.getContext().authentication
        val userId = authentication.principal as? Long
            ?: throw RuntimeException("User not authenticated")
        
        val user = userService.getUserById(userId)
        return ResponseEntity.ok(user)
    }
}