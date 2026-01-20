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
import java.time.LocalDateTime

@AutoConfigureMockMvc
class WorkoutControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var gymRepository: GymRepository

    @Autowired
    private lateinit var routineRepository: RoutineRepository

    @Autowired
    private lateinit var workoutRepository: WorkoutRepository

    @Autowired
    private lateinit var workoutService: WorkoutService

    @BeforeEach
    fun setup() {
        // 清空数据库
        workoutRepository.deleteAll()
        routineRepository.deleteAll()
        gymRepository.deleteAll()
    }

    @Test
    fun `createWorkout should create a new workout`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))

        // 创建训练请求
        val startTime = LocalDateTime.now()
        val workoutRequest = WorkoutRequest(
            id = null,
            startTime = startTime,
            endTime = null,
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "今天感觉不错"
        )

        // 发送POST请求创建训练
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.startTime").isString)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.endTime").isEmpty)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.gym.name").value("城市健身房"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.routine").isEmpty)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.target.length()").value(0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.note").value("今天感觉不错"))
    }

    @Test
    fun `createWorkout should handle null startTime`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))

        // 创建训练请求，startTime为null
        val workoutRequest = WorkoutRequest(
            id = null,
            startTime = null,
            endTime = null,
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "使用当前时间作为开始时间"
        )

        // 发送POST请求创建训练
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.startTime").isString)
    }

    @Test
    fun `getAllWorkout should return all workouts`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))
        val startTime = LocalDateTime.now().minusDays(2)
        val workoutRequest1 = WorkoutRequest(
            id = null,
            startTime = startTime,
            endTime = LocalDateTime.now().minusDays(2).plusHours(1),
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "训练记录1"
        )
        val workoutRequest2 = WorkoutRequest(
            id = null,
            startTime = LocalDateTime.now().minusDays(1),
            endTime = LocalDateTime.now().minusDays(1).plusHours(1),
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "训练记录2"
        )

        // 创建两个训练
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest1))
        )
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest2))
        )

        // 发送GET请求获取所有训练
        mockMvc.perform(MockMvcRequestBuilders.get("/api/lifting/workout"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(2))
    }

    @Test
    fun `getAllWorkout should return empty list when no workouts exist`() {
        // 数据库中没有训练记录

        // 发送GET请求获取所有训练
        mockMvc.perform(MockMvcRequestBuilders.get("/api/lifting/workout"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data").isArray)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(0))
    }

    @Test
    fun `stopWorkout should update workout with end time`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))
        val startTime = LocalDateTime.now().minusHours(1)
        val workoutRequest = WorkoutRequest(
            id = null,
            startTime = startTime,
            endTime = null,
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "正在训练"
        )

        // 创建训练
        val createResponse = mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn()

        // 解析创建的训练ID
        val createdWorkout = objectMapper.readTree(createResponse.response.contentAsString)
        val workoutId = createdWorkout.get("data").get("id").asLong()

        // 结束训练
        val endTime = LocalDateTime.now()
        val stopWorkoutRequest = WorkoutRequest(
            id = workoutId,
            startTime = startTime,
            endTime = endTime,
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "训练结束"
        )

        // 发送POST请求结束训练
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout/stop")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(stopWorkoutRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").value(workoutId))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.endTime").isString)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.note").value("训练结束"))
    }

    @Test
    fun `findInProcessWorkout should return current workout when it exists`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))
        val todayWorkout = WorkoutRequest(
            id = null,
            startTime = LocalDateTime.now(),
            endTime = null,
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "今天的训练"
        )
        val yesterdayWorkout = WorkoutRequest(
            id = null,
            startTime = LocalDateTime.now().minusDays(1),
            endTime = LocalDateTime.now().minusDays(1).plusHours(1),
            gym = gym.id!!,
            routine = null,
            target = emptySet(),
            note = "昨天的训练"
        )

        // 创建两个训练，一个是今天的（进行中），一个是昨天的（已结束）
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(yesterdayWorkout))
        )
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(todayWorkout))
        )

        // 发送GET请求获取进行中的训练
        mockMvc.perform(MockMvcRequestBuilders.get("/api/lifting/workout/in-process"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.endTime").isEmpty)
    }

    @Test
    fun `workoutService getById should return workout when it exists`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))
        val startTime = LocalDateTime.now()
        val workout = workoutService.create(startTime, gym.id!!, null, emptySet(), "测试训练")

        // 使用workoutService的getById方法获取训练
        val retrievedWorkout = workoutService.getById(workout.id!!)

        // 验证获取的训练与创建的训练一致
        assert(retrievedWorkout.id == workout.id)
        assert(retrievedWorkout.startTime == startTime)
        assert(retrievedWorkout.note == "测试训练")
    }

    @Test
    fun `createWorkout with routine should associate routine with workout`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))
        val routine = routineRepository.save(
            Routine(
                name = "胸肌训练", 
                description = "专注胸肌训练",
                template = false,
                note = "胸肌训练计划"
            )
        )

        // 创建训练请求，包含routine
        val startTime = LocalDateTime.now()
        val workoutRequest = WorkoutRequest(
            id = null,
            startTime = startTime,
            endTime = null,
            gym = gym.id!!,
            routine = routine.id!!,
            target = emptySet(),
            note = "带计划的训练"
        )

        // 发送POST请求创建训练
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/workout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(workoutRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.routine.name").value("胸肌训练"))
    }
}