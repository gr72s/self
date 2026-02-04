package com.iamalangreen.self.auth.jwt

import com.iamalangreen.self.config.JwtConfig
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/**
 * Unit tests for JwtUtil
 */
class JwtUtilTest {
    
    private lateinit var jwtUtil: JwtUtil
    private val testSecret = "test-secret-key-at-least-32-characters-long-for-jwt-signing"
    
    @BeforeEach
    fun setup() {
        val jwtConfig = JwtConfig(
            secret = testSecret,
            expiration = 3600000 // 1 hour for testing
        )
        jwtUtil = JwtUtil(jwtConfig)
    }
    
    @Test
    fun `generateToken should create valid token`() {
        // Given
        val userId = 123L
        val openid = "oTest123456"
        
        // When
        val token = jwtUtil.generateToken(userId, openid)
        
        // Then
        assertNotNull(token)
        assertTrue(token.isNotBlank())
        assertTrue(token.split(".").size == 3) // JWT has 3 parts
    }
    
    @Test
    fun `getUserIdFromToken should extract correct userId`() {
        // Given
        val userId = 456L
        val openid = "oTest789"
        val token = jwtUtil.generateToken(userId, openid)
        
        // When
        val extractedUserId = jwtUtil.getUserIdFromToken(token)
        
        // Then
        assertEquals(userId, extractedUserId)
    }
    
    @Test
    fun `getOpenidFromToken should extract correct openid`() {
        // Given
        val userId = 789L
        val openid = "oTestABC123"
        val token = jwtUtil.generateToken(userId, openid)
        
        // When
        val extractedOpenid = jwtUtil.getOpenidFromToken(token)
        
        // Then
        assertEquals(openid, extractedOpenid)
    }
    
    @Test
    fun `validateToken should return true for valid token`() {
        // Given
        val userId = 111L
        val openid = "oTestValid"
        val token = jwtUtil.generateToken(userId, openid)
        
        // When
        val isValid = jwtUtil.validateToken(token)
        
        // Then
        assertTrue(isValid)
    }
    
    @Test
    fun `validateToken should return false for invalid token`() {
        // When
        val isValid = jwtUtil.validateToken("invalid.token.here")
        
        // Then
        assertFalse(isValid)
    }
    
    @Test
    fun `validateToken should return false for malformed token`() {
        // When
        val isValid = jwtUtil.validateToken("not-a-jwt-token")
        
        // Then
        assertFalse(isValid)
    }
    
    @Test
    fun `getUserIdFromToken should return null for invalid token`() {
        // When
        val userId = jwtUtil.getUserIdFromToken("invalid.token")
        
        // Then
        assertNull(userId)
    }
    
    @Test
    fun `getOpenidFromToken should return null for invalid token`() {
        // When
        val openid = jwtUtil.getOpenidFromToken("invalid.token")
        
        // Then
        assertNull(openid)
    }
    
    @Test
    fun `different tokens should be generated for different users`() {
        // Given
        val user1 = 1L to "openid1"
        val user2 = 2L to "openid2"
        
        // When
        val token1 = jwtUtil.generateToken(user1.first, user1.second)
        val token2 = jwtUtil.generateToken(user2.first, user2.second)
        
        // Then
        assertNotEquals(token1, token2)
    }
    
    @Test
    fun `token should contain correct information after generation`() {
        // Given
        val userId = 999L
        val openid = "oTestFinal"
        
        // When
        val token = jwtUtil.generateToken(userId, openid)
        
        // Then
        assertTrue(jwtUtil.validateToken(token))
        assertEquals(userId, jwtUtil.getUserIdFromToken(token))
        assertEquals(openid, jwtUtil.getOpenidFromToken(token))
    }
}
