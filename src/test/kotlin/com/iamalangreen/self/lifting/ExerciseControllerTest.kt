package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import com.iamalangreen.self.lifting.ExerciseController
import com.iamalangreen.self.lifting.ExerciseRequest
import com.iamalangreen.self.lifting.ExerciseService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class ExerciseControllerTest {

    @Mock
    private lateinit var exerciseService: ExerciseService

    @InjectMocks
    private lateinit var exerciseController: ExerciseController

    @Test
    fun `createExercise should return created exercise when request is valid`() {
        // Given
        val exerciseRequest = ExerciseRequest(
            null,
            "测试动作",
            "Test Exercise",
            "这是一个测试动作",
            emptySet(),
            emptySet(),
            emptyList()
        )
        
        val exercise = Exercise(
            id = 1L,
            name = "测试动作",
            originName = "Test Exercise",
            description = "这是一个测试动作"
        )
        
        val exerciseResponse = exercise.toResponse()
        val expectedResponse = success(exerciseResponse)
        
        `when`(exerciseService.create(
            exerciseRequest.name,
            exerciseRequest.originName,
            exerciseRequest.description,
            exerciseRequest.mainMuscles,
            exerciseRequest.supportMuscles,
            exerciseRequest.cues
        )).thenReturn(exercise)

        // When
        val response = exerciseController.createExercise(exerciseRequest)

        // Then
        assert(response == expectedResponse)
    }
}
