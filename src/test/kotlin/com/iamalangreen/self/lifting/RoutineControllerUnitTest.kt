package com.iamalangreen.self.lifting

import com.iamalangreen.self.success
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class RoutineControllerUnitTest {

    @Mock
    private lateinit var routineService: RoutineService

    @Mock
    private lateinit var slotService: SlotService

    @InjectMocks
    private lateinit var routineController: RoutineController

    @Test
    fun `createRoutine should return created routine`() {
        val request = RoutineRequest(
            null,
            "Split A",
            "Description",
            100L,
            setOf(1L, 2L),
            listOf(ChecklistItem("Item 1", false)),
            "Note"
        )
        
        val routine = Routine(
            1L,
            "Split A",
            "Description",
            false,
            null,
            mutableSetOf(),
            mutableSetOf(),
            mutableListOf(ChecklistItem("Item 1", false)),
            "Note"
        )
        // Add targets to routine mocked object if needed for response
        routine.target.add(Target(1L, "Target 1"))

        `when`(routineService.createRoutine(
            request.name,
            request.description,
            request.workoutId!!,
            request.targetIds,
            request.checklist,
            request.note
        )).thenReturn(routine)

        val response = routineController.createRoutine(request)
        
        assert(response == success(routine.toResponse()))
    }
}
