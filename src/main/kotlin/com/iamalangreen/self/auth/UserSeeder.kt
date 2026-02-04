package com.iamalangreen.self.auth

import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component

/**
 * Seed test users for development
 */
@Component
class UserSeeder(
    private val userRepository: UserRepository
) : CommandLineRunner {
    
    override fun run(vararg args: String?) {
        // Only seed if database is empty
        if (userRepository.count() == 0L) {
            // Create a test user with WeChat-style openid
            val testUser = User(
                openid = "test_openid_development_123",
                nickname = "测试用户",
                username = "testuser",
                email = "test@example.com"
            )
            userRepository.save(testUser)
            println("✅ Seeded test user: ${testUser.nickname} (openid: ${testUser.openid})")
        }
    }
}
