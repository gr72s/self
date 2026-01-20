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

@AutoConfigureMockMvc
class PieceControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var pieceRepository: PieceRepository

    @Autowired
    private lateinit var tagRepository: TagRepository

    @Autowired
    private lateinit var pieceService: PieceService

    @BeforeEach
    fun setup() {
        // 清空数据库
        pieceRepository.deleteAll()
        tagRepository.deleteAll()
    }

    @Test
    fun `createPiece should create a new piece with tags`() {
        // 创建测试标签
        val tag1 = tagRepository.save(Tag(name = "练习曲"))
        val tag2 = tagRepository.save(Tag(name = "古典"))

        // 创建曲目请求
        val createRequest = CreatePieceRequest(
            title = "小奏鸣曲",
            composer = "莫扎特",
            status = PieceStatus.LEARNING,
            tags = listOf(tag1.id!!, tag2.id!!)
        )

        // 发送POST请求创建曲目
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/piece")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.title").value("小奏鸣曲"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.composer").value("莫扎特"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.status").value("LEARNING"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.tags").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.tags.length()").value(2))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.tags[0].name").value("练习曲"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.tags[1].name").value("古典"))

        // 验证曲目已保存到数据库
        val pieces = pieceRepository.findAll()
        assert(pieces.size == 1)
        val savedPiece = pieces[0]
        assert(savedPiece.tags.size == 2)
    }

    @Test
    fun `createPiece should create a new piece without tags`() {
        // 创建不带标签的曲目请求
        val createRequest = CreatePieceRequest(
            title = "即兴曲",
            composer = "舒伯特",
            status = PieceStatus.MAINTAINING,
            tags = emptyList()
        )

        // 发送POST请求创建曲目
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/piece")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.tags").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.tags.length()").value(0))

        // 验证曲目已保存到数据库
        val pieces = pieceRepository.findAll()
        assert(pieces.size == 1)
        val savedPiece = pieces[0]
        assert(savedPiece.tags.isEmpty())
    }

    @Test
    fun `createPiece should handle different status values`() {
        // 测试创建不同状态的曲目
        val statusValues = PieceStatus.values()
        statusValues.forEach { status ->
            val createRequest = CreatePieceRequest(
                title = "测试曲目 - $status",
                composer = null,
                status = status
            )

            // 发送POST请求创建曲目
            mockMvc.perform(
                MockMvcRequestBuilders.post("/api/piano/piece")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(createRequest))
            )
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.jsonPath("$.data.status").value(status.name))
        }

        // 验证所有状态的曲目都已创建
        val pieces = pieceRepository.findAll()
        assert(pieces.size == statusValues.size)
    }

    @Test
    fun `createPiece should handle null composer`() {
        // 创建作曲家为空的曲目请求
        val createRequest = CreatePieceRequest(
            title = "匿名作品",
            composer = null,
            status = PieceStatus.WISHLIST
        )

        // 发送POST请求创建曲目
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/piece")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.composer").isEmpty)

        // 验证曲目已保存到数据库
        val pieces = pieceRepository.findAll()
        assert(pieces.size == 1)
        assert(pieces[0].composer == null)
    }

    @Test
    fun `pieceService getPiece should return correct piece`() {
        // 创建测试标签
        val tag = tagRepository.save(Tag(name = "浪漫主义"))

        // 使用service创建曲目
        val piece = pieceService.createPiece(
            title = "夜曲",
            composer = "肖邦",
            status = PieceStatus.LEARNING,
            tags = listOf(tag.id!!)
        )

        // 使用service获取曲目
        val retrievedPiece = pieceService.getPiece(piece.id!!)

        // 验证获取的曲目与创建的曲目一致
        assert(retrievedPiece.id == piece.id)
        assert(retrievedPiece.title == "夜曲")
        assert(retrievedPiece.composer == "肖邦")
        assert(retrievedPiece.status == PieceStatus.LEARNING)
        assert(retrievedPiece.tags.size == 1)
    }
}