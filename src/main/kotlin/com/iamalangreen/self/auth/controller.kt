package com.iamalangreen.self.auth

import com.iamalangreen.self.auth.config.JwtService
import com.iamalangreen.self.auth.dto.*
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(private val authService: AuthService) {

    @PostMapping("/authenticate")
    fun authenticate(@RequestBody request: AuthRequest): ResponseEntity<AuthResponse> {
        val authResponse = authService.authenticate(request)
        return ResponseEntity.ok(authResponse)
    }

}

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService,
    private val jwtService: JwtService,
) {

    @PostMapping
    fun createUser(@RequestBody request: UserCreateRequest): ResponseEntity<UserResponse> {
        val user = userService.createUser(request)
        return ResponseEntity(user, HttpStatus.CREATED)
    }

    @GetMapping("/current")
    fun getUserById(request: HttpServletRequest): ResponseEntity<UserResponse> {
        val header = request.getHeader("Authorization")
        val jwt = header.substring(7)
        val extractUsername = jwtService.extractUsername(jwt)
        val userByUsername = userService.getUserByUsername(extractUsername)
        return ResponseEntity.ok(userByUsername)
    }

    @PostMapping("/current/update")
    fun updateCurrentUser(
        @RequestBody updateRequest: UserUpdateRequest,
        request: HttpServletRequest
    ): ResponseEntity<UserResponse> {
        val header = request.getHeader("Authorization")
        val currentUser = userService.getCurrentUser(header)
        val userByUsername = userService.updateUser(currentUser, updateRequest)
        return ResponseEntity.ok(userByUsername)
    }
}