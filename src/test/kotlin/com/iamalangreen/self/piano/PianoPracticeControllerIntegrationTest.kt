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

@AutoConfigureMockMvc
class PianoPracticeControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var practiceSessionRepository: PracticeSessionRepository

    @Autowired
    private lateinit var pieceRepository: PieceRepository

    @Autowired
    private lateinit var pianoPracticeRepository: PianoPracticeRepository

    @Autowired
    private lateinit var practiceSessionService: PracticeSessionService

    @Autowired
    private lateinit var pieceService: PieceService

    @Autowired
    private lateinit var pianoPracticeService: PianoPracticeService

    @BeforeEach
    fun setup() {
        // 清空数据库
        pianoPracticeRepository.deleteAll()
        pieceRepository.deleteAll()
        practiceSessionRepository.deleteAll()
    }

    @Test
    fun `createPianoPractice should create a new piano practice record`() {
        // 创建测试数据
        val practiceSession = practiceSessionService.createPracticeSession(LocalDateTime.now())
        val piece = pieceService.createPiece("小奏鸣曲", "莫扎特", PieceStatus.LEARNING, emptyList())

        // 创建钢琴练习请求
        val createRequest = CreatePianoPracticeRequest(
            session = practiceSession.id!!,
            minutes = 30,
            piece = piece.id!!,
            tags = emptyList(),
            note = "今天练习得不错",
            bpm = 60,
            type = PianoPracticeType.REPERTOIRE
        )

        // 发送POST请求创建钢琴练习记录
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/piano-practice")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.minutes").value(30))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.piece.title").value("小奏鸣曲"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.note").value("今天练习得不错"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.bpm").value(60))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.type").value("REPERTOIRE"))

        // 验证钢琴练习记录已保存到数据库
        val practices = pianoPracticeRepository.findAll()
        assert(practices.size == 1)
        val savedPractice = practices[0]
        assert(savedPractice.minutes == 30)
        assert(savedPractice.piece?.id == piece.id)
        assert(savedPractice.note == "今天练习得不错")
        assert(savedPractice.bpm == 60)
        assert(savedPractice.type == PianoPracticeType.REPERTOIRE)
    }

    @Test
    fun `createPianoPractice should handle different practice types`() {
        // 创建测试数据
        val practiceSession = practiceSessionService.createPracticeSession(LocalDateTime.now())
        val piece = pieceService.createPiece("哈农", null, PieceStatus.LEARNING, emptyList())

        // 测试不同的练习类型
        val practiceTypes = PianoPracticeType.values()
        practiceTypes.forEach { practiceType ->
            val createRequest = CreatePianoPracticeRequest(
                session = practiceSession.id!!,
                minutes = 15,
                piece = piece.id!!,
                tags = emptyList(),
                note = "练习类型: $practiceType",
                bpm = 80,
                type = practiceType
            )

            // 发送POST请求创建钢琴练习记录
            mockMvc.perform(
                MockMvcRequestBuilders.post("/api/piano/piano-practice")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createRequest))
            )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.type").value(practiceType.name))
        }

        // 验证所有练习类型的记录都已创建
        val practices = pianoPracticeRepository.findAll()
        assert(practices.size == practiceTypes.size)
    }

    @Test
    fun `createPianoPractice should handle different BPM values`() {
        // 创建测试数据
        val practiceSession = practiceSessionService.createPracticeSession(LocalDateTime.now())
        val piece = pieceService.createPiece("音阶", null, PieceStatus.LEARNING, emptyList())

        // 测试不同的BPM值
        val bpmValues = listOf(40, 60, 80, 100, 120)
        bpmValues.forEach { bpm ->
            val createRequest = CreatePianoPracticeRequest(
                session = practiceSession.id!!,
                minutes = 20,
                piece = piece.id!!,
                tags = emptyList(),
                note = "BPM: $bpm",
                bpm = bpm,
                type = PianoPracticeType.TECHNIQUE
            )

            // 发送POST请求创建钢琴练习记录
            mockMvc.perform(
                MockMvcRequestBuilders.post("/api/piano/piano-practice")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createRequest))
            )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.bpm").value(bpm))
        }

        // 验证所有BPM值的记录都已创建
        val practices = pianoPracticeRepository.findAll()
        assert(practices.size == bpmValues.size)
    }

    @Test
    fun `createPianoPractice should handle different minutes values`() {
        // 创建测试数据
        val practiceSession = practiceSessionService.createPracticeSession(LocalDateTime.now())
        val piece = pieceService.createPiece("练习曲", null, PieceStatus.LEARNING, emptyList())

        // 测试不同的练习时长
        val minutesValues = listOf(5, 10, 15, 20, 30, 60)
        minutesValues.forEach { minutes ->
            val createRequest = CreatePianoPracticeRequest(
                session = practiceSession.id!!,
                minutes = minutes,
                piece = piece.id!!,
                tags = emptyList(),
                note = "练习时长: $minutes 分钟",
                bpm = 60,
                type = PianoPracticeType.FUNDAMENTAL
            )

            // 发送POST请求创建钢琴练习记录
            mockMvc.perform(
                MockMvcRequestBuilders.post("/api/piano/piano-practice")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createRequest))
            )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.minutes").value(minutes))
        }

        // 验证所有练习时长的记录都已创建
        val practices = pianoPracticeRepository.findAll()
        assert(practices.size == minutesValues.size)
    }

    @Test
    fun `createPianoPractice should handle null note`() {
        // 创建测试数据
        val practiceSession = practiceSessionService.createPracticeSession(LocalDateTime.now())
        val piece = pieceService.createPiece("无备注练习", null, PieceStatus.LEARNING, emptyList())

        // 创建无备注的钢琴练习请求
        val createRequest = CreatePianoPracticeRequest(
            session = practiceSession.id!!,
            minutes = 25,
            piece = piece.id!!,
            tags = emptyList(),
            note = null,
            bpm = 70,
            type = PianoPracticeType.REPERTOIRE
        )

        // 发送POST请求创建钢琴练习记录
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/piano-practice")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.note").isEmpty)

        // 验证钢琴练习记录已保存到数据库
        val practices = pianoPracticeRepository.findAll()
        assert(practices.size == 1)
        assert(practices[0].note == null)
    }
}