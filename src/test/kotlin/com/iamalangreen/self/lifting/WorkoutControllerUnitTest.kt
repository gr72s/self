package com.iamalangreen.self.lifting

import com.iamalangreen.self.success
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class WorkoutControllerUnitTest {

    @Mock
    private lateinit var workoutService: WorkoutService

    @Mock
    private lateinit var gymService: GymService

    @InjectMocks
    private lateinit var workoutController: WorkoutController

    @Test
    fun `createWorkout should return created workout`() {
        val now = LocalDateTime.now()
        val request = WorkoutRequest(
            null,
            now,
            null,
            1L,
            null,
            setOf(),
            "Note"
        )
        
        val gym = Gym(1L, "Gym", "Loc")
        val workout = Workout(
            1L,
            now,
            null,
            gym,
            null,
            mutableSetOf(),
            "Note"
        )

        `when`(workoutService.create(
            request.startTime,
            request.gym,
            request.routine,
            request.target,
            request.note
        )).thenReturn(workout)

        val response = workoutController.createWorkout(request)
        
        assert(response == success(workout.toResponse()))
    }
}
