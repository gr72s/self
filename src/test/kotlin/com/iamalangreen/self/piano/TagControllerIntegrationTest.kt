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
class TagControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var tagRepository: TagRepository

    @Autowired
    private lateinit var tagService: TagService

    @BeforeEach
    fun setup() {
        // 清空数据库
        tagRepository.deleteAll()
    }

    @Test
    fun `createOrGetTag should create new tag when it doesn't exist`() {
        // 创建标签请求
        val createTagRequest = CreateTagRequest("练习曲")

        // 发送请求创建新标签
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/tag")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createTagRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("练习曲"))

        // 验证标签已保存到数据库
        val tags = tagRepository.findAll()
        assert(tags.size == 1)
        assert(tags[0].name == "练习曲")
    }

    @Test
    fun `createOrGetTag should return existing tag when it exists`() {
        // 先创建一个标签
        val existingTag = tagRepository.save(Tag(name = "奏鸣曲"))

        // 创建相同名称的标签请求
        val createTagRequest = CreateTagRequest("奏鸣曲")

        // 发送请求获取已有标签
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/piano/tag")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createTagRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").value(existingTag.id))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("奏鸣曲"))

        // 验证数据库中只有一个标签
        val tags = tagRepository.findAll()
        assert(tags.size == 1)
    }

    @Test
    fun `deleteTag should delete existing tag`() {
        // 创建一个标签
        val tag = tagRepository.save(Tag(name = "要删除的标签"))

        // 发送DELETE请求删除标签
        mockMvc.perform(
            MockMvcRequestBuilders.delete("/api/piano/tag/${tag.id}")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))

        // 验证标签已从数据库删除
        val tags = tagRepository.findAll()
        assert(tags.isEmpty())
    }

    @Test
    fun `deleteTag should return success even when tag doesn't exist`() {
        // 发送DELETE请求删除不存在的标签
        mockMvc.perform(
            MockMvcRequestBuilders.delete("/api/piano/tag/9999")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
    }

    @Test
    fun `tagService createOrGetTag should work correctly`() {
        // 测试创建新标签
        val newTag = tagService.createOrGetTag("测试标签")
        assert(newTag.name == "测试标签")
        assert(newTag.id != null)

        // 测试获取已存在的标签
        val existingTag = tagService.createOrGetTag("测试标签")
        assert(existingTag.id == newTag.id)
        assert(existingTag.name == newTag.name)
    }

    @Test
    fun `tagService getTags should return correct tags`() {
        // 创建多个标签
        val tag1 = tagRepository.save(Tag(name = "标签1"))
        val tag2 = tagRepository.save(Tag(name = "标签2"))
        val tag3 = tagRepository.save(Tag(name = "标签3"))

        // 使用tagService获取标签
        val tags = tagService.getTags(listOf(tag1.id!!, tag3.id!!))

        // 验证返回结果
        assert(tags.size == 2)
        assert(tags.any { it.id == tag1.id })
        assert(tags.any { it.id == tag3.id })
        assert(tags.none { it.id == tag2.id })
    }
}