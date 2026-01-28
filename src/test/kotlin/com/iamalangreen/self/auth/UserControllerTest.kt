package com.iamalangreen.self.auth

import com.iamalangreen.self.test.TestConfig
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@AutoConfigureMockMvc
class UserControllerTest : TestConfig() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `getUser should return default user`() {
        mockMvc.perform(get("/api/users/current"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.username").value("alan green"))
    }
}
