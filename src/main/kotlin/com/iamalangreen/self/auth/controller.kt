package com.iamalangreen.self.auth

import com.iamalangreen.self.auth.dto.UserResponse
import org.springframework.http.ResponseEntity
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
        val user = userService.getUserByUsername("alan green")
        return ResponseEntity.ok(user)
    }
}