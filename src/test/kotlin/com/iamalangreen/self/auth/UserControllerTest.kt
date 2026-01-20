package com.iamalangreen.self.auth

import com.fasterxml.jackson.databind.ObjectMapper
import com.iamalangreen.self.auth.dto.*
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
class UserControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    @BeforeEach
    fun setup() {
        // 清空数据库
        userRepository.deleteAll()
    }

    @Test
    fun `createUser should return created user when request is valid`() {
        // 创建用户请求
        val userCreateRequest = UserCreateRequest("newuser", "password123", "newuser@example.com")

        // 发送POST请求创建用户
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userCreateRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isCreated)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("newuser"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("newuser@example.com"))
    }

    @Test
    fun `createUser should return error when username already exists`() {
        // 先创建一个用户
        val existingUser = User(
            username = "existinguser",
            password = "\$2a\$10\$C5t7K4uQ7e8r9t1y3u5i7o9p1a3s5d7f9g1h3j5k7l9q",
            email = "existing@example.com"
        )
        userRepository.save(existingUser)

        // 尝试创建一个用户名相同的用户
        val userCreateRequest = UserCreateRequest("existinguser", "password123", "newemail@example.com")

        // 发送POST请求创建用户，预期返回错误
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userCreateRequest))
        )
            .andExpect(MockMvcResultMatchers.status().is5xxServerError)
    }

    @Test
    fun `getUserById should return current user when token is valid`() {
        // 创建测试用户
        val user = User(
            username = "testuser",
            password = "\$2a\$10\$C5t7K4uQ7e8r9t1y3u5i7o9p1a3s5d7f9g1h3j5k7l9q", // 加密后的密码123456
            email = "test@example.com"
        )
        userRepository.save(user)

        // 先获取JWT token
        val authRequest = AuthRequest("testuser", "123456")
        val authResponse = mockMvc.perform(
            MockMvcRequestBuilders.post("/api/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn()

        val token = objectMapper.readTree(authResponse.response.contentAsString).get("token").asText()

        // 使用JWT token获取当前用户信息
        mockMvc.perform(
            MockMvcRequestBuilders.get("/api/users/current")
                .header("Authorization", "Bearer $token")
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("testuser"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("test@example.com"))
    }

    @Test
    fun `updateCurrentUser should return updated user when request is valid`() {
        // 创建测试用户
        val user = User(
            username = "testuser",
            password = "\$2a\$10\$C5t7K4uQ7e8r9t1y3u5i7o9p1a3s5d7f9g1h3j5k7l9q", // 加密后的密码123456
            email = "test@example.com"
        )
        userRepository.save(user)

        // 先获取JWT token
        val authRequest = AuthRequest("testuser", "123456")
        val authResponse = mockMvc.perform(
            MockMvcRequestBuilders.post("/api/auth/authenticate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn()

        val token = objectMapper.readTree(authResponse.response.contentAsString).get("token").asText()

        // 创建用户更新请求
        val userUpdateRequest = UserUpdateRequest(email = "updated@example.com")

        // 发送POST请求更新用户信息
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/users/current/update")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userUpdateRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.username").value("testuser"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.email").value("updated@example.com"))
    }

    @Test
    fun `updateCurrentUser should return 401 when token is invalid`() {
        // 创建用户更新请求
        val userUpdateRequest = UserUpdateRequest(email = "updated@example.com")

        // 使用无效的JWT token发送请求
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/users/current/update")
                .header("Authorization", "Bearer invalid-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(userUpdateRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isUnauthorized)
    }
}
