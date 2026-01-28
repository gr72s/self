package com.iamalangreen.self.auth

import com.iamalangreen.self.auth.UserResponse
import org.springframework.stereotype.Service


interface UserService {
    fun getUserByUsername(username: String): UserResponse
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

    private fun convertToUserResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id,
            username = user.username,
            email = user.email,
        )
    }
}