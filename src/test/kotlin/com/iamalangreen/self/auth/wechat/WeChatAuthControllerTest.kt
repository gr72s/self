package com.iamalangreen.self.auth.wechat

import com.fasterxml.jackson.databind.ObjectMapper
import com.iamalangreen.self.auth.User
import com.iamalangreen.self.auth.UserRepository
import com.iamalangreen.self.auth.jwt.JwtUtil
import io.mockk.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import java.util.*

/**
 * Integration tests for WeChatAuthController
 */
@WebMvcTest(WeChatAuthController::class)
class WeChatAuthControllerTest {
    
    @Autowired
    private lateinit var mockMvc: MockMvc
    
    @Autowired
    private lateinit var objectMapper: ObjectMapper
    
    @MockBean
    private lateinit var weChatAuthService: WeChatAuthService
    
    @Test
    fun `login should return token and user info on success`() {
        // Given
        val request = WeChatLoginRequest("test_code_123")
        val response = WeChatLoginResponse(
            token = "jwt_token_abc",
            user = com.iamalangreen.self.auth.UserResponse(
                id = 1L,
                username = "测试用户",
                email = ""
            )
        )
        
        every { weChatAuthService.login(any()) } returns response
        
        // When & Then
        mockMvc.perform(
            post("/api/auth/wechat/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").value("jwt_token_abc"))
            .andExpect(jsonPath("$.user.id").value(1))
            .andExpect(jsonPath("$.user.username").value("测试用户"))
    }
    
    @Test
    fun `login should return error when service throws exception`() {
        // Given
        val request = WeChatLoginRequest("invalid_code")
        
        every { weChatAuthService.login(any()) } throws RuntimeException("WeChat API error")
        
        // When & Then
        mockMvc.perform(
            post("/api/auth/wechat/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().is5xxServerError)
    }
}
