package com.iamalangreen.self.piano

import com.fasterxml.jackson.databind.ObjectMapper
import com.iamalangreen.self.test.TestConfig
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit

@AutoConfigureMockMvc
class PracticeSessionControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var practiceSessionRepository: PracticeSessionRepository

    @Autowired
    private lateinit var practiceSessionService: PracticeSessionService

    @BeforeEach
    fun setup() {
        // 清空数据库
        practiceSessionRepository.deleteAll()
    }

    @Test
    fun `createPracticeSession should create a new practice session`() {
        // 创建练习会话请求
        val startTime = LocalDateTime.now().withSecond(30).withNano(500000000) // 设置秒和纳秒，测试截断
        val createRequest = CreatePracticeSessionRequest(startTime)

        // 发送POST请求创建练习会话
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/practice-session")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.startTime").isString)

        // 验证练习会话已保存到数据库
        val sessions = practiceSessionRepository.findAll()
        assert(sessions.size == 1)
        val savedSession = sessions[0]
        // 验证startTime被截断到分钟
        assert(savedSession.startTime.second == 0)
        assert(savedSession.startTime.nano == 0)
        // 验证日期和小时分钟与原始请求一致
        assert(savedSession.startTime.toLocalDate() == startTime.toLocalDate())
        assert(savedSession.startTime.hour == startTime.hour)
        assert(savedSession.startTime.minute == startTime.minute)
    }

    @Test
    fun `createPracticeSession should use current time when startTime is not provided`() {
        // 创建练习会话请求，使用当前时间
        val startTime = LocalDateTime.now()
        val createRequest = CreatePracticeSessionRequest(startTime)

        // 发送POST请求创建练习会话
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/practice-session")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)

        // 验证练习会话已保存到数据库
        val sessions = practiceSessionRepository.findAll()
        assert(sessions.size == 1)
    }

    @Test
    fun `practiceSessionService getPracticeSession should return correct session`() {
        // 创建测试练习会话
        val startTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES)
        val practiceSession = practiceSessionService.createPracticeSession(startTime)

        // 使用service获取会话
        val retrievedSession = practiceSessionService.getPracticeSession(practiceSession.id!!)

        // 验证获取的会话与创建的会话一致
        assert(retrievedSession.id == practiceSession.id)
        assert(retrievedSession.startTime == startTime)
    }

    @Test
    fun `practiceSessionService createPracticeSession should truncate startTime to minutes`() {
        // 创建带有秒和纳秒的时间
        val startTime = LocalDateTime.now().withSecond(45).withNano(750000000)
        val truncatedTime = startTime.truncatedTo(ChronoUnit.MINUTES)

        // 使用service创建会话
        val practiceSession = practiceSessionService.createPracticeSession(startTime)

        // 验证startTime被截断
        assert(practiceSession.startTime == truncatedTime)
        assert(practiceSession.startTime.second == 0)
        assert(practiceSession.startTime.nano == 0)
    }
}