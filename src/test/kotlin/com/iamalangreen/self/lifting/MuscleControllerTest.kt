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
class MuscleControllerTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var muscleRepository: MuscleRepository

    @BeforeEach
    fun setup() {
        muscleRepository.deleteAll()
    }

    @Test
    fun `createMuscle should return created muscle`() {
        val request = MuscleRequest("Test Muscle", "Description", "Function", "Origin")

        mockMvc.perform(
            MockMvcRequestBuilders.post("/api/lifting/muscle")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").isNumber)
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("Test Muscle"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.function").value("Function"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.originName").value("Origin"))
    }

    @Test
    fun `updateMuscle should return updated muscle`() {
        val savedMuscle = muscleRepository.save(Muscle(name = "Old Name", description = "Old Desc"))
        val request = MuscleRequest("Updated Muscle", "Updated Desc", "Updated Function", "Updated Origin")

        mockMvc.perform(
            MockMvcRequestBuilders.put("/api/lifting/muscle/{id}", savedMuscle.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("Updated Muscle"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.function").value("Updated Function"))
    }

    @Test
    fun `getAllMuscle should return list of muscles`() {
        muscleRepository.save(Muscle(name = "M1", description = "D1"))
        muscleRepository.save(Muscle(name = "M2", description = "D2"))

        mockMvc.perform(MockMvcRequestBuilders.get("/api/lifting/muscle"))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.length()").value(2))
    }

    @Test
    fun `getById should return muscle`() {
        val savedMuscle = muscleRepository.save(Muscle(name = "M1", description = "D1"))

        mockMvc.perform(MockMvcRequestBuilders.get("/api/lifting/muscle/{id}", savedMuscle.id))
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.success").value(true))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.id").value(savedMuscle.id))
            .andExpect(MockMvcResultMatchers.jsonPath("$.data.name").value("M1"))
    }
}
