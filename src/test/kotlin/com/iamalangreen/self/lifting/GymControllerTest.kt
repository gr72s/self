package com.iamalangreen.self.lifting

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
class GymControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var gymRepository: GymRepository

    @Autowired
    private lateinit var gymService: GymService

    @BeforeEach
    fun setup() {
        // 清空数据库
        gymRepository.deleteAll()
    }

    @Test
    fun `createGym should return created gym when request is valid`() {
        // 创建健身场所请求
        val createGymRequest = CreateGymRequest("测试健身场所", "测试位置")

        // 发送POST请求创建健身场所
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/gym")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createGymRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("测试健身场所"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.location").value("测试位置"))
    }

    @Test
    fun `createGym should return error when name is blank`() {
        // 创建名称为空的健身场所请求
        val createGymRequest = CreateGymRequest("", "测试位置")

        // 发送POST请求创建健身场所，预期返回错误
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/gym")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createGymRequest))
        )
            .andExpect(MockMvcResultMatchers.status().is5xxServerError)
    }

    @Test
    fun `createGym should return error when location is blank`() {
        // 创建位置为空的健身场所请求
        val createGymRequest = CreateGymRequest("测试健身场所", "")

        // 发送POST请求创建健身场所，预期返回错误
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/gym")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createGymRequest))
        )
            .andExpect(MockMvcResultMatchers.status().is5xxServerError)
    }

    @Test
    fun `getAllGym should return all gyms when called`() {
        // 创建多个测试健身场所
        val gym1 = gymRepository.save(Gym(name = "健身场所1", location = "位置1"))
        val gym2 = gymRepository.save(Gym(name = "健身场所2", location = "位置2"))
        val gym3 = gymRepository.save(Gym(name = "健身场所3", location = "位置3"))

        // 发送GET请求获取所有健身场所
        mockMvc.perform(
            MockMvcRequestBuilders.get("/api/lifting/gym")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(3))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data[0].name").value(gym1.name))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data[1].name").value(gym2.name))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data[2].name").value(gym3.name))
    }

    @Test
    fun `getAllGym should return empty list when no gyms exist`() {
        // 数据库中没有健身场所

        // 发送GET请求获取所有健身场所
        mockMvc.perform(
            MockMvcRequestBuilders.get("/api/lifting/gym")
                .contentType(MediaType.APPLICATION_JSON)
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(0))
    }

    @Test
    fun `gymService findByName should return gym when it exists`() {
        // 创建测试健身场所
        val gym = gymRepository.save(Gym(name = "测试健身场所", location = "测试位置"))

        // 使用gymService的findByName方法查找
        val foundGym = gymService.findByName("测试健身场所")

        // 验证找到的健身场所与创建的健身场所一致
        assert(foundGym != null)
        assert(foundGym?.name == gym.name)
        assert(foundGym?.location == gym.location)
    }

    @Test
    fun `gymService findByName should return null when gym does not exist`() {
        // 数据库中没有健身场所

        // 使用gymService的findByName方法查找不存在的健身场所
        val foundGym = gymService.findByName("不存在的健身场所")

        // 验证返回null
        assert(foundGym == null)
    }

    @Test
    fun `gymService getById should return gym when it exists`() {
        // 创建测试健身场所
        val gym = gymRepository.save(Gym(name = "测试健身场所", location = "测试位置"))

        // 使用gymService的getById方法获取
        val retrievedGym = gymService.getById(gym.id!!)

        // 验证获取的健身场所与创建的健身场所一致
        assert(retrievedGym.id == gym.id)
        assert(retrievedGym.name == gym.name)
        assert(retrievedGym.location == gym.location)
    }

    @Test
    fun `gymService findById should return gym when it exists`() {
        // 创建测试健身场所
        val gym = gymRepository.save(Gym(name = "测试健身场所", location = "测试位置"))

        // 使用gymService的findById方法查找
        val foundGym = gymService.findById(gym.id!!)

        // 验证找到的健身场所与创建的健身场所一致
        assert(foundGym != null)
        assert(foundGym?.id == gym.id)
    }

    @Test
    fun `gymService findById should return null when gym does not exist`() {
        // 数据库中没有健身场所

        // 使用gymService的findById方法查找不存在的健身场所
        val foundGym = gymService.findById(9999L)

        // 验证返回null
        assert(foundGym == null)
    }
}
