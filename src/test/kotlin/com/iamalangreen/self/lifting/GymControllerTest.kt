package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import com.iamalangreen.self.lifting.CreateGymRequest
import com.iamalangreen.self.lifting.GymController
import com.iamalangreen.self.lifting.GymService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class GymControllerTest {

    @Mock
    private lateinit var gymService: GymService

    @InjectMocks
    private lateinit var gymController: GymController

    @Test
    fun `createGym should return created gym when request is valid`() {
        // Given
        val createGymRequest = CreateGymRequest("测试健身场所", "测试位置")
        
        val gym = Gym(
            id = 1L,
            name = "测试健身场所",
            location = "测试位置"
        )
        
        val expectedResponse = success(gym)
        
        `when`(gymService.createGym(
            createGymRequest.name,
            createGymRequest.location
        )).thenReturn(gym)

        // When
        val response = gymController.createGym(createGymRequest)

        // Then
        assert(response == expectedResponse)
    }

    @Test
    fun `getAllGym should return all gyms when called`() {
        // Given
        val gym1 = Gym(
            id = 1L,
            name = "健身场所1",
            location = "位置1"
        )
        
        val gym2 = Gym(
            id = 2L,
            name = "健身场所2",
            location = "位置2"
        )
        
        val gymList = listOf(gym1, gym2)
        val expectedResponse = success(gymList)
        
        `when`(gymService.getAllGym()).thenReturn(gymList)

        // When
        val response = gymController.getAllGym()

        // Then
        assert(response == expectedResponse)
    }
}
