package com.iamalangreen.self.lifting


import com.iamalangreen.self.success
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class GymControllerUnitTest {

    @Mock
    private lateinit var gymService: GymService

    @InjectMocks
    private lateinit var gymController: GymController

    @Test
    fun `createGym should return created gym when request is valid`() {
        val request = CreateGymRequest("Test Gym", "Test Location")
        val gym = Gym(1L, "Test Gym", "Test Location")
        
        `when`(gymService.createGym("Test Gym", "Test Location")).thenReturn(gym)

        val response = gymController.createGym(request)
        
        assertEquals(success(gym.toResponse()), response)
    }

    @Test
    fun `getAllGym should return list of gyms`() {
        val gyms = listOf(
            Gym(1L, "Gym 1", "Loc 1"),
            Gym(2L, "Gym 2", "Loc 2")
        )
        
        `when`(gymService.getAllGym()).thenReturn(gyms)

        val response = gymController.getAllGym()
        
        assertEquals(success(gyms.map { it.toResponse() }), response)
    }
}
