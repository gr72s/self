package com.iamalangreen.self.rbac.controller

import com.iamalangreen.self.rbac.config.JwtService
import com.iamalangreen.self.rbac.dto.AssignRoleRequest
import com.iamalangreen.self.rbac.dto.UserCreateRequest
import com.iamalangreen.self.rbac.dto.UserResponse
import com.iamalangreen.self.rbac.dto.UserUpdateRequest
import com.iamalangreen.self.rbac.service.UserService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/users")
class UserController(
    private val userService: UserService,
    private val jwtService: JwtService,
) {

    @PostMapping
    @PreAuthorize("hasAuthority('user:create')")
    fun createUser(@RequestBody request: UserCreateRequest): ResponseEntity<UserResponse> {
        val user = userService.createUser(request)
        return ResponseEntity(user, HttpStatus.CREATED)
    }

    @GetMapping
    @PreAuthorize("hasAuthority('user:read')")
    fun getAllUsers(): ResponseEntity<List<UserResponse>> {
        val users = userService.getAllUsers()
        return ResponseEntity.ok(users)
    }

    @GetMapping("/current")
    @PreAuthorize("hasAuthority('user:read')")
    fun getUserById(request: HttpServletRequest): ResponseEntity<UserResponse> {
        val header = request.getHeader("Authorization")
        val jwt = header.substring(7)
        val extractUsername = jwtService.extractUsername(jwt)
        val userByUsername = userService.getUserByUsername(extractUsername)
        return ResponseEntity.ok(userByUsername)
    }

    @PostMapping("/current/update")
    @PreAuthorize("hasAuthority('user:update')")
    fun updateCurrentUser(
        @RequestBody updateRequest: UserUpdateRequest,
        request: HttpServletRequest
    ): ResponseEntity<UserResponse> {
        val header = request.getHeader("Authorization")
        val currentUser = userService.getCurrentUser(header)
        val userByUsername = userService.updateUser(currentUser, updateRequest)
        return ResponseEntity.ok(userByUsername)
    }

    @PostMapping("/{id}/roles/assign")
    @PreAuthorize("hasAuthority('user:manage_roles')") // 假设有一个专门的权限来管理用户的角色
    fun assignRoleToUser(
        @PathVariable id: Long,
        @RequestBody request: AssignRoleRequest
    ): ResponseEntity<UserResponse> {
        val user = userService.assignRoleToUser(id, request)
        return ResponseEntity.ok(user)
    }

    @PostMapping("/{id}/roles/remove")
    @PreAuthorize("hasAuthority('user:manage_roles')")
    fun removeRoleFromUser(
        @PathVariable id: Long,
        @RequestBody request: AssignRoleRequest
    ): ResponseEntity<UserResponse> {
        val user = userService.removeRoleFromUser(id, request)
        return ResponseEntity.ok(user)
    }
}