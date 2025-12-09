package com.iamalangreen.self.lifting

import com.fasterxml.jackson.annotation.JsonFormat
import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId

data class WorkoutRequest(
    val id: Long?,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    val startTime: LocalDateTime?,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    val endTime: LocalDateTime?,
    val gym: Long,
    val routine: Long?,
    val target: Set<Long> = setOf(),
    val note: String?
)

data class WorkoutResponse(
    val id: Long,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    val startTime: LocalDateTime?,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    val endTime: LocalDateTime?,
    val gym: GymResponse,
    val routine: RoutineResponse?,
    val target: Set<TargetResponse> = setOf(),
    val note: String?
)

fun Workout.toResponse(): WorkoutResponse {
    return WorkoutResponse(
        id!!,
        startTime,
        endTime,
        gym.toResponse(),
        routine?.toRoutineResponse(),
        target.map { it.toResponse() }.toSet(),
        note
    )
}

@RestController
@RequestMapping("/api/lifting/workout")
class WorkoutController(val workoutService: WorkoutService, val gymService: GymService) {

    @PostMapping
    fun createWorkout(request: WorkoutRequest): Response {
        val workout =
            workoutService.create(request.startTime, request.gym, request.routine, request.target, request.note)
        return success(workout.toResponse())
    }

    @GetMapping
    fun getAllWorkout(): Response {
        return success(workoutService.getAll().map { it.toResponse() })
    }

    @PostMapping("/stop")
    fun stopWorkout(request: WorkoutRequest): Response {
        val workout = workoutService.update(
            request.id!!,
            request.startTime,
            request.endTime,
            request.gym,
            request.routine,
            request.target,
            request.note
        )
        return success(workout.toResponse())
    }

    @GetMapping("/in-process")
    fun findInProcessWorkout(): Response {
        return success(workoutService.findInProcessWorkout().toResponse())
    }

}

@Service
class WorkoutService(
    private val workoutRepository: WorkoutRepository,
    private val targetService: TargetService,
    private val gymService: GymService,
    private val routineService: RoutineService
) {
    fun create(
        startTime: LocalDateTime?,
        gymId: Long,
        routineId: Long?,
        targetIds: Set<Long>,
        note: String?
    ): Workout {
        val gym = gymService.getById(gymId)
        val routine = routineId?.let { routineService.getById(routineId) }
        val targets = targetIds.map { targetService.getById(it) }.toMutableSet()
        val workout = workoutRepository.save(
            Workout(
                startTime = startTime,
                endTime = null,
                gym = gym,
                routine = routine,
                target = targets,
                note = note
            )
        )
        return workout
    }

    fun getAll(): List<Workout> {
        return workoutRepository.findAll()
    }

    fun update(
        id: Long,
        startTime: LocalDateTime?,
        endTime: LocalDateTime?,
        gym: Long,
        routine: Long?,
        target: Set<Long>,
        note: String?
    ): Workout {
        val workout = workoutRepository.findById(id).orElseThrow()
        if (startTime != workout.startTime)
            workout.startTime = startTime
        if (endTime != workout.endTime)
            workout.endTime = endTime
        if (gym != workout.gym.id)
            workout.gym = gymService.getById(gym)
        if (routine != null && routine != workout.routine?.id)
            workout.routine = routineService.getById(routine)
        if (target.isNotEmpty()) {
            workout.target.clear()
            workout.target.addAll(target.map { targetService.getById(it) })
        }
        return workoutRepository.save(workout)
    }

    fun findInProcessWorkout(): Workout {
        val workouts = getAll()
        val today = LocalDate.now(ZoneId.of("Asia/Shanghai"))
        val workout = workouts.first { it.startTime?.toLocalDate()?.equals(today) ?: false }
        return workout
    }
}

interface WorkoutRepository : JpaRepository<Workout, Long> {}

@Entity
@Table(name = "lifting_workout")
data class Workout(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var startTime: LocalDateTime?,
    @Column
    var endTime: LocalDateTime?,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    var gym: Gym,
    @OneToOne(fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinColumn(name = "routine_id")
    var routine: Routine?,
    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "workout_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),
    @Column
    var note: String?
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Workout

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

}