package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.common.PageResponse
import com.iamalangreen.self.common.PaginationUtils
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*

data class RoutineRequest(
    val id: Long?,
    @field:jakarta.validation.constraints.NotBlank(message = "Name is required")
    @field:jakarta.validation.constraints.Size(min = 2, max = 100, message = "Name must be 2-100 characters")
    val name: String,
    @field:jakarta.validation.constraints.Size(max = 500, message = "Description too long")
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

private fun Routine.resolveTargets(): Set<TargetResponse> {
    if (target.isNotEmpty()) {
        return target.map { it.toResponse() }.toSet()
    }
    if (checklist.isNotEmpty()) {
        return checklist.mapIndexed { index, item ->
            TargetResponse(id = (index + 1).toLong(), name = item.name)
        }.toSet()
    }
    return emptySet()
}

fun Routine.toSummaryResponse(): RoutineResponse = RoutineResponse(
    id = id!!,
    name = name,
    description = description,
    workout = null,
    targets = resolveTargets(),
    slots = emptySet(),
    checklist = checklist,
    note = note
)

fun Routine.toResponse(): RoutineResponse = RoutineResponse(
    id = id!!,
    name = name,
    description = description,
    workout = workout?.toSummaryResponse(),
    targets = resolveTargets(),
    slots = slots.map { it.toSummaryResponse() }.toSet(),
    checklist = checklist,
    note = note
)

@RestController
@RequestMapping("/api/lifting/routine")
class RoutineController(
    val routineService: RoutineService,
    val slotService: SlotService,
) {

    @PostMapping
    fun createRoutine(@jakarta.validation.Valid @RequestBody request: RoutineRequest): Response {
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
    fun createRoutineTemplate(@jakarta.validation.Valid @RequestBody request: RoutineRequest): Response {
        val routine = routineService.createRoutineTemplate(
            request.name,
            request.description,
            request.targetIds,
            request.checklist,
            request.note
        )
        return success(routine.toResponse())
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    fun updateRoutine(@org.springframework.web.bind.annotation.PathVariable id: Long, @jakarta.validation.Valid @RequestBody request: RoutineRequest): Response {
        val routine = routineService.updateRoutine(
            id,
            request.name,
            request.description,
            request.targetIds,
            request.checklist,
            request.note
        )
        return success(routine.toResponse())
    }

    @GetMapping
    fun getAllRoutines(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "id,desc") sort: String,
        @RequestParam(required = false) name: String?
    ): Response {
        val pageable = PageRequest.of(page, size, PaginationUtils.parseSort(sort))
        val result = routineService.getAll(name, pageable)
        val pageResponse = PageResponse.of(result.map { it.toResponse() })
        return success(pageResponse)
    }

    @PostMapping("/exercise")
    fun addExercise(@RequestBody request: SlotRequest): Response {
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

    fun updateRoutine(
        id: Long,
        name: String,
        description: String?,
        targetIds: Set<Long>,
        checklist: List<ChecklistItem>,
        note: String?
    ): Routine

    fun getAll(name: String?, pageable: Pageable): Page<Routine>

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

    override fun updateRoutine(
        id: Long,
        name: String,
        description: String?,
        targetIds: Set<Long>,
        checklist: List<ChecklistItem>,
        note: String?
    ): Routine {
        val routine = getById(id)
        val targets = targetIds.map { targetService.getById(it) }

        routine.name = name
        routine.description = description
        routine.note = note

        routine.target.clear()
        routine.target.addAll(targets)

        routine.checklist.clear()
        routine.checklist.addAll(checklist)

        return routineRepository.save(routine)
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
        return routineRepository.save(routine)
    }

    override fun getById(id: Long): Routine {
        return routineRepository.findById(id).orElseThrow()
    }

    override fun getAll(name: String?, pageable: Pageable): Page<Routine> {
        return if (name != null) {
            routineRepository.findByNameContainingIgnoreCase(name, pageable)
        } else {
            routineRepository.findAll(pageable)
        }
    }
}

interface RoutineRepository : JpaRepository<Routine, Long> {
    fun findByNameContainingIgnoreCase(name: String, pageable: Pageable): Page<Routine>
}

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
        name = "lifting_routine_target",
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
