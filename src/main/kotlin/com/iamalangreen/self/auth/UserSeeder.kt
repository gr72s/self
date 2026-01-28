package com.iamalangreen.self.auth.config

import com.iamalangreen.self.auth.User
import com.iamalangreen.self.auth.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

@Component
class UserSeeder(
    private val userRepository: UserRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (!userRepository.existsByUsername("alan green")) {
            val user = User(
                username = "alan green",
                password = "123456",
                email = "alangreen@example.com"
            )
            userRepository.save(user)
        }
    }
}
