package com.iamalangreen.self.rbac.service

import com.iamalangreen.self.rbac.config.JwtService
import com.iamalangreen.self.rbac.dto.AssignRoleRequest
import com.iamalangreen.self.rbac.dto.UserCreateRequest
import com.iamalangreen.self.rbac.dto.UserResponse
import com.iamalangreen.self.rbac.dto.UserUpdateRequest
import com.iamalangreen.self.rbac.model.User
import com.iamalangreen.self.rbac.repository.RoleRepository
import com.iamalangreen.self.rbac.repository.UserRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


interface UserService {
    fun createUser(request: UserCreateRequest): UserResponse
    fun getAllUsers(): List<UserResponse>
    fun getCurrentUser(token: String): User
    fun getUserById(id: Long): UserResponse
    fun getUserByUsername(username: String): UserResponse
    fun updateUser(user: User, request: UserUpdateRequest): UserResponse
    fun assignRoleToUser(userId: Long, request: AssignRoleRequest): UserResponse
    fun removeRoleFromUser(userId: Long, request: AssignRoleRequest): UserResponse
}

@Service
class DefaultUserService(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val jwtService: JwtService,
    private val passwordEncoder: PasswordEncoder
) : UserService {

    @Transactional
    override fun createUser(request: UserCreateRequest): UserResponse {
        if (userRepository.existsByUsername(request.username)) {
            throw RuntimeException("Username already exists: ${request.username}")
        }
        if (userRepository.existsByEmail(request.email)) {
            throw RuntimeException("Email already exists: ${request.email}")
        }

        val roles = request.roleNames?.mapNotNull { roleName ->
            roleRepository.findByName(roleName).orElse(null)
        }?.toMutableSet() ?: mutableSetOf()

        val user = User(
            username = request.username,
            password = passwordEncoder.encode(request.password),
            email = request.email,
            roles = roles
        )
        val savedUser = userRepository.save(user)
        return convertToUserResponse(savedUser)
    }

    override fun getAllUsers(): List<UserResponse> {
        return userRepository.findAll().map { convertToUserResponse(it) }
    }

    override fun getCurrentUser(token: String): User {
        val jwt = if (token.startsWith("Bearer ")) {
            token.substring(7)
        } else {
            token
        }
        val extractUsername = jwtService.extractUsername(jwt)
        return userRepository.findByUsername(extractUsername)
            .orElseThrow { RuntimeException("User not found with username: $extractUsername") }
    }

    override fun getUserById(id: Long): UserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { RuntimeException("User not found with ID: $id") }
        return convertToUserResponse(user)
    }

    override fun getUserByUsername(username: String): UserResponse {
        val user = userRepository.findByUsername(username)
            .orElseThrow { RuntimeException("User not found with username: $username") }
        return convertToUserResponse(user)
    }

    override fun updateUser(user: User, request: UserUpdateRequest): UserResponse {
        request.username?.let { user.username = it }
        request.password?.let { user.password = it }
        request.email?.let { user.email = it }
        userRepository.saveAndFlush(user)
        return convertToUserResponse(user)
    }

    @Transactional
    override fun assignRoleToUser(userId: Long, request: AssignRoleRequest): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found with ID: $userId") }
        val role = roleRepository.findByName(request.roleName)
            .orElseThrow { RuntimeException("Role not found with name: ${request.roleName}") }

        user.roles.add(role)
        val updatedUser = userRepository.save(user)
        return convertToUserResponse(updatedUser)
    }

    @Transactional
    override fun removeRoleFromUser(userId: Long, request: AssignRoleRequest): UserResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { RuntimeException("User not found with ID: $userId") }
        val role = roleRepository.findByName(request.roleName)
            .orElseThrow { RuntimeException("Role not found with name: ${request.roleName}") }

        user.roles.remove(role)
        val updatedUser = userRepository.save(user)
        return convertToUserResponse(updatedUser)
    }

    private fun convertToUserResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id,
            username = user.username,
            email = user.email,
            roles = user.roles.map { it.name }.toSet()
        )
    }
}