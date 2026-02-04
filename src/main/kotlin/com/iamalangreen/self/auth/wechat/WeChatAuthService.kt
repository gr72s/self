package com.iamalangreen.self.auth.wechat

import com.iamalangreen.self.auth.User
import com.iamalangreen.self.auth.UserRepository
import com.iamalangreen.self.auth.UserResponse
import com.iamalangreen.self.auth.jwt.JwtUtil
import kotlinx.coroutines.runBlocking
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

/**
 * Request body for WeChat login
 */
data class WeChatLoginRequest(
    val code: String
)

/**
 * Response for WeChat login
 */
data class WeChatLoginResponse(
    val token: String,
    val user: UserResponse
)

/**
 * Service for handling WeChat Miniprogram authentication
 */
@Service
class WeChatAuthService(
    private val weChatApiClient: WeChatApiClient,
    private val userRepository: UserRepository,
    private val jwtUtil: JwtUtil
) {
    
    /**
     * Authenticate user with WeChat login code
     * 
     * @param request Contains the temporary code from wx.login()
     * @return Login response with JWT token and user info
     * @throws RuntimeException if WeChat API fails or returns error
     */
    @Transactional
    fun login(request: WeChatLoginRequest): WeChatLoginResponse = runBlocking {
        // 1. Call WeChat API to validate code and get openid
        val session = weChatApiClient.code2Session(request.code)
        
        // 2. Check for errors (already handled in WeChatApiClient, but double-check)
        if (session.openid.isBlank()) {
            throw RuntimeException("Failed to get openid from WeChat")
        }
        
        // 3. Find existing user or create new one
        val user = userRepository.findByOpenid(session.openid)
            .orElseGet {
                // Create new user
                val newUser = User(
                    openid = session.openid,
                    sessionKey = session.session_key,
                    unionId = session.unionid,
                    nickname = "微信用户"  // Default nickname
                )
                userRepository.save(newUser)
            }
        
        // 4. Update session_key if changed
        if (user.sessionKey != session.session_key) {
            user.sessionKey = session.session_key
            user.updatedAt = LocalDateTime.now()
            userRepository.save(user)
        }
        
        // 5. Generate JWT token
        val token = jwtUtil.generateToken(user.id, user.openid)
        
        // 6. Return response
        return@runBlocking WeChatLoginResponse(
            token = token,
            user = UserResponse(
                id = user.id,
                username = user.nickname ?: user.username ?: "微信用户",
                email = user.email ?: ""
            )
        )
    }
}
