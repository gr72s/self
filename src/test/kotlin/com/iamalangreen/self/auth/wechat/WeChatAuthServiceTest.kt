package com.iamalangreen.self.auth.wechat

import com.iamalangreen.self.auth.User
import com.iamalangreen.self.auth.UserRepository
import com.iamalangreen.self.auth.jwt.JwtUtil
import io.mockk.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.*

/**
 * Unit tests for WeChatAuthService
 */
class WeChatAuthServiceTest {
    
    private lateinit var weChatApiClient: WeChatApiClient
    private lateinit var userRepository: UserRepository
    private lateinit var jwtUtil: JwtUtil
    private lateinit var service: WeChatAuthService
    
    @BeforeEach
    fun setup() {
        weChatApiClient = mockk()
        userRepository = mockk()
        jwtUtil = mockk()
        service = WeChatAuthService(weChatApiClient, userRepository, jwtUtil)
    }
    
    @AfterEach
    fun cleanup() {
        clearAllMocks()
    }
    
    @Test
    fun `login should create new user when openid not found`() = runBlocking {
        // Given
        val code = "test_wx_code_123"
        val openid = "oTest123456789"
        val sessionKey = "session_key_123"
        
        val weChatSession = WeChatSession(
            openid = openid,
            session_key = sessionKey
        )
        
        val newUser = User(
            id = 1L,
            openid = openid,
            sessionKey = sessionKey,
            nickname = "微信用户"
        )
        
        val token = "jwt_token_123"
        
        // Mock behaviors
        coEvery { weChatApiClient.code2Session(code) } returns weChatSession
        every { userRepository.findByOpenid(openid) } returns Optional.empty()
        every { userRepository.save(any()) } returns newUser
        every { jwtUtil.generateToken(1L, openid) } returns token
        
        // When
        val result = service.login(WeChatLoginRequest(code))
        
        // Then
        assertEquals(token, result.token)
        assertEquals(1L, result.user.id)
        assertEquals("微信用户", result.user.username)
        
        // Verify interactions
        coVerify(exactly = 1) { weChatApiClient.code2Session(code) }
        verify(exactly = 1) { userRepository.findByOpenid(openid) }
        verify(exactly = 1) { userRepository.save(any()) }
        verify(exactly = 1) { jwtUtil.generateToken(1L, openid) }
    }
    
    @Test
    fun `login should return existing user when openid found`() = runBlocking {
        // Given
        val code = "test_wx_code_456"
        val openid = "oTest987654321"
        val oldSessionKey = "old_session_key"
        val newSessionKey = "new_session_key"
        
        val weChatSession = WeChatSession(
            openid = openid,
            session_key = newSessionKey
        )
        
        val existingUser = User(
            id = 2L,
            openid = openid,
            sessionKey = oldSessionKey,
            nickname = "老用户"
        )
        
        val token = "jwt_token_456"
        
        // Mock behaviors
        coEvery { weChatApiClient.code2Session(code) } returns weChatSession
        every { userRepository.findByOpenid(openid) } returns Optional.of(existingUser)
        every { userRepository.save(any()) } returns existingUser
        every { jwtUtil.generateToken(2L, openid) } returns token
        
        // When
        val result = service.login(WeChatLoginRequest(code))
        
        // Then
        assertEquals(token, result.token)
        assertEquals(2L, result.user.id)
        assertEquals("老用户", result.user.username)
        
        // Verify session key was updated
        verify(exactly = 1) { userRepository.save(match { it.sessionKey == newSessionKey }) }
    }
    
    @Test
    fun `login should throw exception when WeChat API returns empty openid`() = runBlocking {
        // Given
        val code = "invalid_code"
        val weChatSession = WeChatSession(openid = "", session_key = "")
        
        coEvery { weChatApiClient.code2Session(code) } returns weChatSession
        
        // When & Then
        val exception = assertThrows<RuntimeException> {
            service.login(WeChatLoginRequest(code))
        }
        
        assertTrue(exception.message?.contains("Failed to get openid") == true)
    }
    
    @Test
    fun `login should propagate WeChat API exception`() = runBlocking {
        // Given
        val code = "error_code"
        val errorMessage = "WeChat API error [40029]: invalid code"
        
        coEvery { weChatApiClient.code2Session(code) } throws RuntimeException(errorMessage)
        
        // When & Then
        val exception = assertThrows<RuntimeException> {
            service.login(WeChatLoginRequest(code))
        }
        
        assertEquals(errorMessage, exception.message)
    }
    
    @Test
    fun `login should handle unionid correctly`() = runBlocking {
        // Given
        val code = "test_code_with_unionid"
        val openid = "oTest111222333"
        val unionid = "unionid_123456"
        
        val weChatSession = WeChatSession(
            openid = openid,
            session_key = "session_123",
            unionid = unionid
        )
        
        val newUser = User(
            id = 3L,
            openid = openid,
            sessionKey = "session_123",
            unionId = unionid,
            nickname = "微信用户"
        )
        
        val token = "jwt_token_789"
        
        // Mock behaviors
        coEvery { weChatApiClient.code2Session(code) } returns weChatSession
        every { userRepository.findByOpenid(openid) } returns Optional.empty()
        every { userRepository.save(any()) } returns newUser
        every { jwtUtil.generateToken(3L, openid) } returns token
        
        // When
        val result = service.login(WeChatLoginRequest(code))
        
        // Then
        assertEquals(token, result.token)
        verify(exactly = 1) { 
            userRepository.save(match { 
                it.unionId == unionid 
            }) 
        }
    }
}
