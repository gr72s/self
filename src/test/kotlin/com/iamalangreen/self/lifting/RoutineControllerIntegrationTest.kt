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
class RoutineControllerIntegrationTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var gymRepository: GymRepository

    @Autowired
    private lateinit var workoutRepository: WorkoutRepository

    @Autowired
    private lateinit var exerciseRepository: ExerciseRepository

    @Autowired
    private lateinit var muscleRepository: MuscleRepository

    @BeforeEach
    fun setup() {
        // 清空数据库
        workoutRepository.deleteAll()
        gymRepository.deleteAll()
        exerciseRepository.deleteAll()
        muscleRepository.deleteAll()
    }

    @Test
    fun `createRoutine should create a new routine with workout`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心"))
        val workout = workoutRepository.save(
            Workout(
                startTime = LocalDateTime.now(),
                endTime = null,
                gym = gym,
                routine = null,
                target = mutableSetOf(),
                note = "今天的训练"
            )
        )

        // 创建训练计划请求
        val routineRequest = RoutineRequest(
            id = null,
            name = "周一胸肌训练",
            description = "专注胸肌和三头肌",
            workoutId = workout.id,
            targetIds = emptySet(),
            checklist = listOf(ChecklistItem("热身", false), ChecklistItem("拉伸", true)),
            note = "记得控制重量"
        )

        // 发送POST请求创建训练计划
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/routine")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(routineRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("周一胸肌训练"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").value("专注胸肌和三头肌"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.workout.id").value(workout.id))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.targets.length()").value(2))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.checklist.length()").value(2))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.note").value("记得控制重量"))
    }

    @Test
    fun `createRoutineTemplate should create a new routine template`() {
        // 创建训练计划模板请求
        val routineRequest = RoutineRequest(
            id = null,
            name = "减脂训练模板",
            description = "适合减脂阶段的训练",
            workoutId = null,
            targetIds = emptySet(),
            checklist = listOf(ChecklistItem("有氧热身", false), ChecklistItem("力量训练", false)),
            note = "每周执行3次"
        )

        // 发送POST请求创建训练计划模板
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/routine/template")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(routineRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("减脂训练模板"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.description").value("适合减脂阶段的训练"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.workout").isEmpty)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.targets.length()").value(2))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.checklist.length()").value(2))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.note").value("每周执行3次"))
    }

    @Test
    fun `addExercise should add a slot to routine`() {
        // 创建测试数据
        val gym = gymRepository.save(Gym(name = "城市健身房", location = "市中心健身房"))
        val workout = workoutRepository.save(
            Workout(
                startTime = LocalDateTime.now(),
                endTime = null,
                gym = gym,
                routine = null,
                target = mutableSetOf(),
                note = "今天的训练"
            )
        )
        val muscle = muscleRepository.save(Muscle(name = "胸大肌", originName = "Pectoralis Major", function = "胸肌"))
        val exercise = exerciseRepository.save(
            Exercise(
                name = "平板卧推",
                originName = "Barbell Bench Press",
                description = "胸肌训练动作",
                mainMuscles = mutableSetOf(muscle),
                supportMuscles = mutableSetOf(),
                cues = mutableListOf()
            )
        )

        // 创建训练计划
        val routineRequest = RoutineRequest(
            id = null,
            name = "胸肌训练",
            description = "胸肌训练计划",
            workoutId = workout.id,
            targetIds = emptySet(),
            checklist = emptyList(),
            note = null
        )

        val createRoutineResponse = mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/routine")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(routineRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andReturn()

        // 解析创建的训练计划ID
        val createdRoutine = objectMapper.readTree(createRoutineResponse.response.contentAsString)
        val routineId = createdRoutine.get("data").get("id").asLong()

        // 创建添加动作请求
        val slotRequest = SlotRequest(
            id = null,
            routineId = routineId,
            exerciseId = exercise.id!!,
            stars = 5,
            category = Category.WorkingSets,
            setNumber = 1,
            weight = 80.0f,
            reps = 10,
            duration = null,
            sequence = 1
        )

        // 发送POST请求添加动作
        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/routine/exercise")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(slotRequest))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.exercise.name").value("平板卧推"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.category").value("WorkingSets"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.setNumber").value(1))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.weight").value(80.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.reps").value(10))
    }

    @Test
    fun `getAllRoutines should return all routines`() {
        // 发送GET请求获取所有训练计划
        mockMvc.perform(MockMvcRequestBuilders.get("/api/lifting/routine"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
    }
}
