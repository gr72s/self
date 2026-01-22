package com.iamalangreen.self.lifting

import com.fasterxml.jackson.databind.ObjectMapper
import com.iamalangreen.self.lifting.ExerciseRequest
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
class ExerciseControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var muscleRepository: MuscleRepository

    @Autowired
    private lateinit var exerciseRepository: ExerciseRepository

    @Autowired
    private lateinit var exerciseService: ExerciseService

    @BeforeEach
    fun setup() {
        // 清空数据库
        exerciseRepository.deleteAll()
        muscleRepository.deleteAll()
    }

    @Test
    fun `createExercise should create a new exercise with main muscles`() {
        // 创建测试用的肌肉
        val muscle1 = muscleRepository.save(Muscle(name = "胸大肌", description = "胸肌主要发力"))
        val muscle2 = muscleRepository.save(Muscle(name = "三角肌前束", description = "肩部前侧肌肉"))

        // 创建运动请求
        val exerciseRequest = ExerciseRequest(
            id = null,
            name = "平板卧推",
            description = "胸肌训练动作",
            mainMuscles = setOf(muscle1.id!!, muscle2.id!!),
            supportMuscles = emptySet(),
            cues = listOf("保持背部贴紧长椅", "控制下放速度")
        )

        // 发送POST请求创建运动
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/exercise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exerciseRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("平板卧推"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").value("胸肌训练动作"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.mainMuscles").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.mainMuscles.length()").value(2))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.supportMuscles").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.supportMuscles.length()").value(0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues.length()").value(2))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues[0]").value("保持背部贴紧长椅"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues[1]").value("控制下放速度"))
    }

    @Test
    fun `createExercise should handle empty muscle sets`() {
        // 创建没有肌肉的运动请求
        val exerciseRequest = ExerciseRequest(
            id = null,
            name = "跑步",
            description = "有氧运动",
            mainMuscles = emptySet(),
            supportMuscles = emptySet(),
            cues = emptyList()
        )

        // 发送POST请求创建运动
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/exercise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exerciseRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("跑步"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.mainMuscles.length()").value(0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.supportMuscles.length()").value(0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues.length()").value(0))
    }

    @Test
    fun `createExercise should handle minimal request`() {
        // 创建最小请求（只有必填字段）
        val exerciseRequest = ExerciseRequest(
            id = null,
            name = "深蹲",
            description = null
        )

        // 发送POST请求创建运动
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/exercise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exerciseRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("深蹲"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").isEmpty)
    }

    @Test
    fun `createExercise should handle support muscles`() {
        // 创建测试用的肌肉
        val mainMuscle = muscleRepository.save(Muscle(name = "股四头肌", description = "大腿前侧肌肉"))
        val supportMuscle1 = muscleRepository.save(Muscle(name = "臀大肌", description = "臀部肌肉"))
        val supportMuscle2 = muscleRepository.save(Muscle(name = "腘绳肌", description = "大腿后侧肌肉"))

        // 创建包含辅助肌肉的运动请求
        val exerciseRequest = ExerciseRequest(
            id = null,
            name = "深蹲",
            description = "下肢综合训练动作",
            mainMuscles = setOf(mainMuscle.id!!),
            supportMuscles = setOf(supportMuscle1.id!!, supportMuscle2.id!!),
            cues = listOf("保持膝盖与脚尖方向一致", "下蹲时膝盖不要超过脚尖")
        )

        // 发送POST请求创建运动
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/exercise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exerciseRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.mainMuscles.length()").value(1))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.supportMuscles.length()").value(2))
    }

    @Test
    fun `createExercise should throw error when using non-existent muscle id`() {
        // 创建包含不存在肌肉ID的运动请求
        val exerciseRequest = ExerciseRequest(
            id = null,
            name = "平板卧推",
            mainMuscles = setOf(9999L) // 不存在的肌肉ID
        )

        // 发送POST请求创建运动，预期返回错误
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/exercise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exerciseRequest))
        )
            .andExpect(MockMvcResultMatchers.status().is5xxServerError)
    }

    @Test
    fun `exerciseService getById should return exercise when it exists`() {
        // 创建测试用的肌肉
        val muscle = muscleRepository.save(Muscle(name = "胸大肌", description = "胸肌主要发力"))

        // 直接使用service创建exercise
        val exercise = exerciseService.create(
            name = "平板卧推",
            description = "胸肌训练动作",
            mainMuscleIds = setOf(muscle.id!!),
            supportMuscleIds = emptySet(),
            cues = listOf("保持背部贴紧长椅")
        )

        // 使用service的getById方法获取exercise
        val retrievedExercise = exerciseService.getById(exercise.id!!)

        // 验证获取的exercise与创建的exercise一致
        assert(retrievedExercise.id == exercise.id)
        assert(retrievedExercise.name == exercise.name)
    }

    @Test
    fun `createExercise should handle special characters in cues`() {
        // 创建测试用的肌肉
        val muscle = muscleRepository.save(Muscle(name = "胸大肌", description = "胸肌主要发力"))

        // 创建包含特殊字符的运动请求
        val exerciseRequest = ExerciseRequest(
            id = null,
            name = "平板卧推",
            mainMuscles = setOf(muscle.id!!),
            cues = listOf("保持背部贴紧长椅: 3秒下放", "控制重量: 80% 1RM", "呼吸节奏: 下吸上呼")
        )

        // 发送POST请求创建运动
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/exercise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(exerciseRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues.length()").value(3))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues[0]").value("保持背部贴紧长椅: 3秒下放"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues[1]").value("控制重量: 80% 1RM"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.cues[2]").value("呼吸节奏: 下吸上呼"))
    }

    @Test
    fun `exerciseRepository should save and retrieve exercise correctly`() {
        // 创建测试用的肌肉
        val muscle = muscleRepository.save(Muscle(name = "胸大肌", description = "胸肌主要发力"))

        // 直接创建Exercise实体
        val exercise = Exercise(
            name = "平板卧推",
            description = "胸肌训练动作"
        )
        exercise.mainMuscles.add(muscle)
        exercise.cues.add("保持背部贴紧长椅")

        // 保存到数据库
        val savedExercise = exerciseRepository.save(exercise)

        // 从数据库检索
        val retrievedExercise = exerciseRepository.findById(savedExercise.id!!)

        // 验证检索结果
        assert(retrievedExercise.isPresent)
        assert(retrievedExercise.get().name == "平板卧推")
        assert(retrievedExercise.get().mainMuscles.size == 1)
        assert(retrievedExercise.get().cues.size == 1)
    }
}
