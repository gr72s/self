package com.iamalangreen.self.auth

import com.fasterxml.jackson.databind.ObjectMapper
import com.iamalangreen.self.auth.dto.AuthRequest
import com.iamalangreen.self.auth.dto.DeviceAuthRequest
import com.iamalangreen.self.test.TestConfig
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers

@AutoConfigureMockMvc
class AuthControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @Autowired
    private lateinit var deviceRepository: DeviceRepository

    @BeforeEach
    fun setup() {
        // 清空数据库
        deviceRepository.deleteAll()
        userRepository.deleteAll()
    }

    @Test
    fun `authenticate should return JWT token when credentials are valid`() {
        // 创建测试用户
        val user = User(
            username = "testuser",
            password = "\$2a\$10\$C5t7K4uQ7e8r9t1y3u5i7o9p1a3s5d7f9g1h3j5k7l9q", // 加密后的密码123456
            email = "test@example.com"
        )
        userRepository.save(user)

        // 创建认证请求
        val authRequest = AuthRequest("testuser", "123456")

        // 发送POST请求进行认证
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.token").isNotEmpty)
    }

    @Test
    fun `authenticate should return 401 when credentials are invalid`() {
        // 创建测试用户
        val user = User(
            username = "testuser",
            password = "\$2a\$10\$C5t7K4uQ7e8r9t1y3u5i7o9p1a3s5d7f9g1h3j5k7l9q", // 加密后的密码123456
            email = "test@example.com"
        )
        userRepository.save(user)

        // 创建错误的认证请求
        val authRequest = AuthRequest("testuser", "wrongpassword")

        // 发送POST请求进行认证，预期返回401
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isUnauthorized)
    }

    @Test
    fun `authenticateDevice should return JWT token when device is valid`() {
        // 创建管理员用户
        val adminUser = User(
            username = "admin",
            password = "\$2a\$10\$C5t7K4uQ7e8r9t1y3u5i7o9p1a3s5d7f9g1h3j5k7l9q", // 加密后的密码admin123
            email = "admin@example.com"
        )
        userRepository.save(adminUser)

        // 创建设备认证请求
        val deviceAuthRequest = DeviceAuthRequest("device123", "{\"userAgent\":\"test-agent\"}")

        // 发送POST请求进行设备认证
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/auth/authenticate-device")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(deviceAuthRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.token").isNotEmpty)
    }
}
