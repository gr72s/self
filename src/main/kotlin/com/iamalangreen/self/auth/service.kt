package com.iamalangreen.self.auth

import com.iamalangreen.self.auth.config.JwtService
import com.iamalangreen.self.auth.dto.*
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional


interface AuthService {
    fun authenticate(request: AuthRequest): AuthResponse
    fun authenticateDevice(request: DeviceAuthRequest): AuthResponse
}

@Service
class DefaultAuthService(
    private val authenticationManager: AuthenticationManager,
    private val userDetailsService: UserDetailsService,
    private val jwtService: JwtService,
    private val deviceRepository: DeviceRepository,
    private val userRepository: UserRepository
) : AuthService {

    override fun authenticate(request: AuthRequest): AuthResponse {
        val token = UsernamePasswordAuthenticationToken(request.username, request.password)
        authenticationManager.authenticate(token)
        val userDetails = userDetailsService.loadUserByUsername(request.username)
        val jwtToken = jwtService.generateToken(userDetails)
        return AuthResponse(jwtToken)
    }

    override fun authenticateDevice(request: DeviceAuthRequest): AuthResponse {
        // 查找设备，如果不存在则创建新设备并关联到管理员用户
        val device = deviceRepository.findByDeviceId(request.deviceId).orElseGet {
            // 获取管理员用户（假设username为admin的用户是管理员）
            val adminUser = userRepository.findByUsername("admin")
                .orElseThrow { RuntimeException("Admin user not found") }
            
            // 创建新设备
            val newDevice = Device(
                deviceId = request.deviceId,
                deviceInfo = request.deviceInfo,
                user = adminUser
            )
            deviceRepository.save(newDevice)
        }
        
        // 更新设备的最后使用时间
        device.lastUsedAt = java.time.LocalDateTime.now()
        deviceRepository.save(device)
        
        // 为设备关联的用户生成JWT令牌
        val userDetails = org.springframework.security.core.userdetails.User(
            device.user.username,
            device.user.password,
            emptyList()
        )
        val jwtToken = jwtService.generateToken(userDetails)
        return AuthResponse(jwtToken)
    }

}


interface UserService {
    fun createUser(request: UserCreateRequest): UserResponse
    fun getAllUsers(): List<UserResponse>
    fun getCurrentUser(token: String): User
    fun getUserById(id: Long): UserResponse
    fun getUserByUsername(username: String): UserResponse
    fun updateUser(user: User, request: UserUpdateRequest): UserResponse
}

@Service
class DefaultUserService(
    private val userRepository: UserRepository,
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

        val user = User(
            username = request.username,
            password = passwordEncoder.encode(request.password),
            email = request.email,
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

    private fun convertToUserResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id,
            username = user.username,
            email = user.email,
        )
    }
}