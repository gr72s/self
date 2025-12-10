package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class RoutineRequest(
    val id: Long?,
    val name: String,
    val description: String?,
    val workoutId: Long?,
    val targetIds: Set<Long> = setOf(),
    val checklist: List<ChecklistItem> = listOf(),
    val note: String?
)

data class RoutineResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val workout: WorkoutResponse? = null,
    val targets: Set<TargetResponse> = setOf(),
    val slots: Set<SlotResponse> = setOf(),
    val checklist: List<ChecklistItem> = listOf(),
    val note: String? = null
)

fun Routine.toResponse(): RoutineResponse = RoutineResponse(
    id!!,
    name,
    description,
    workout?.toResponse(),
    target.map { it.toResponse() }.toSet(),
    slots.map { it.toResponse() }.toSet(),
    checklist,
    note
)

@RestController
@RequestMapping("/api/lifting/routine")
class RoutineController(
    val routineService: RoutineService,
    val slotService: SlotService,
) {

    @PostMapping
    fun createRoutine(request: RoutineRequest): Response {
        require(request.workoutId != null)
        val routine = routineService.createRoutine(
            request.name,
            request.description,
            request.workoutId,
            request.targetIds,
            request.checklist,
            request.note
        )
        return success(routine.toResponse())
    }

    @PostMapping("/template")
    fun createRoutineTemplate(request: RoutineRequest): Response {
        val routine = routineService.createRoutineTemplate(
            request.name,
            request.description,
            request.targetIds,
            request.checklist,
            request.note
        )
        return success(routine.toResponse())
    }

    @GetMapping
    fun getAllRoutines(): Response {
        return success()
    }

    @PostMapping("/exercise")
    fun addExercise(request: SlotRequest): Response {
        val slot = slotService.createSlotInRoutine(
            request.routineId,
            request.exerciseId,
            request.stars,
            request.category,
            request.setNumber,
            request.weight,
            request.reps,
            request.duration,
            request.sequence,
        )
        return success(slot.toResponse())
    }

}

interface RoutineService {
    fun createRoutine(
        name: String,
        description: String?,
        workoutId: Long,
        targetIds: Set<Long>,
        checklist: List<ChecklistItem>,
        note: String?
    ): Routine

    fun createRoutineTemplate(
        name: String,
        description: String?,
        targetIds: Set<Long>,
        checklist: List<ChecklistItem>,
        note: String?
    ): Routine


    fun getById(id: Long): Routine
}

@Service
class DefaultRoutineService(
    private val routineRepository: RoutineRepository,
    private val targetService: TargetService,
    private val workoutService: WorkoutService,
) : RoutineService {

    override fun createRoutine(
        name: String,
        description: String?,
        workoutId: Long,
        targetIds: Set<Long>,
        checklist: List<ChecklistItem>,
        note: String?
    ): Routine {
        return create(name, description, workoutId, targetIds, checklist, note)
    }

    override fun createRoutineTemplate(
        name: String,
        description: String?,
        targetIds: Set<Long>,
        checklist: List<ChecklistItem>,
        note: String?
    ): Routine {
        return create(name, description, null, targetIds, checklist, note)
    }

    fun create(
        name: String,
        description: String?,
        workoutId: Long?,
        targetIds: Set<Long>,
        checklist: List<ChecklistItem>,
        note: String?
    ): Routine {

        val workout = workoutId?.let { workoutService.getById(it) }
        val targets = targetIds.map { targetService.getById(it) }

        val routine = Routine(
            name = name,
            description = description,
            template = workout == null,
            workout = workout,
            note = note
        )
        routine.target.addAll(targets)
        routine.checklist.addAll(checklist)
        return routine
    }

    override fun getById(id: Long): Routine {
        return routineRepository.findById(id).orElseThrow()
    }
}

interface RoutineRepository : JpaRepository<Routine, Long>

@Entity
@Table(name = "lifting_routine")
data class Routine(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var description: String?,
    @Column
    val template: Boolean,
    @OneToOne(mappedBy = "routine", fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    var workout: Workout? = null,
    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "routine_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),
    @OneToMany(mappedBy = "routine", cascade = [CascadeType.ALL], orphanRemoval = true)
    var slots: MutableSet<Slot> = mutableSetOf(),
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    var checklist: MutableList<ChecklistItem> = mutableListOf(),
    @Column
    var note: String?
) {
    override fun toString(): String {
        return "Routine(name='$name', description=$description)"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Routine

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

}

data class ChecklistItem(
    val name: String,
    val isOptional: Boolean = false
)