package com.iamalangreen.self.auth

import org.springframework.stereotype.Service

interface UserService {
    fun getUserByUsername(username: String): UserResponse
    fun getUserById(id: Long): UserResponse
}

@Service
class DefaultUserService(
    private val userRepository: UserRepository,
) : UserService {

    override fun getUserByUsername(username: String): UserResponse {
        val user = userRepository.findByUsername(username)
            .orElseThrow { RuntimeException("User not found with username: $username") }
        return convertToUserResponse(user)
    }
    
    override fun getUserById(id: Long): UserResponse {
        val user = userRepository.findById(id)
            .orElseThrow { RuntimeException("User not found with id: $id") }
        return convertToUserResponse(user)
    }

    private fun convertToUserResponse (user: User): UserResponse {
        return UserResponse(
            id = user.id,
            username = user.nickname ?: user.username ?: "用户${user.id}",
            email = user.email ?: "",
        )
    }
}