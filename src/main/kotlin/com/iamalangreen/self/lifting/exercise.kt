package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*

data class ExerciseRequest(
    val id: Long?,
    val name: String,
    val description: String? = null,
    val mainMuscles: Set<Long> = setOf(),
    val supportMuscles: Set<Long> = setOf(),
    val cues: List<String> = listOf(),
)

data class ExerciseResponse(
    val id: Long,
    val name: String,
    val description: String? = null,
    val mainMuscles: Set<MuscleResponse> = setOf(),
    val supportMuscles: Set<MuscleResponse> = setOf(),
    val cues: List<String> = listOf(),
)

fun Exercise.toResponse(): ExerciseResponse {
    return ExerciseResponse(
        id!!,
        name,
        description,
        mainMuscles.map { it.toResponse() }.toSet(),
        supportMuscles.map { it.toResponse() }.toSet(),
        cues
    )
}

@RestController
@RequestMapping("/api/lifting/exercise")
class ExerciseController(val exerciseService: ExerciseService) {
    @PostMapping
    fun createExercise(@RequestBody request: ExerciseRequest): Response {
        val exercise = exerciseService.create(
            request.name,
            request.description,
            request.mainMuscles,
            request.supportMuscles,
            request.cues
        )
        return success(exercise.toResponse())
    }

    @PutMapping("/{id}")
    fun updateExercise(@PathVariable id: Long, @RequestBody request: ExerciseRequest): Response {
        val exercise = exerciseService.update(
            id,
            request.name,
            request.description,
            request.mainMuscles,
            request.supportMuscles,
            request.cues
        )
        return success(exercise.toResponse())
    }

    @GetMapping
    fun getAllExercises(): Response {
        return success(exerciseService.getAll().map { it.toResponse() })
    }
}

interface ExerciseService {
    fun create(
        name: String,
        description: String?,
        mainMuscleIds: Set<Long>,
        supportMuscleIds: Set<Long>,
        cues: List<String>
    ): Exercise
    fun update(
        id: Long,
        name: String,
        description: String?,
        mainMuscleIds: Set<Long>,
        supportMuscleIds: Set<Long>,
        cues: List<String>
    ): Exercise
    fun getById(id: Long): Exercise
    fun getAll(): List<Exercise>
}

@Service
class DefaultExerciseService(
    private val exerciseRepository: ExerciseRepository,
    private val muscleService: MuscleService,
) : ExerciseService {
    override fun create(
        name: String,
        description: String?,
        mainMuscleIds: Set<Long>,
        supportMuscleIds: Set<Long>,
        cues: List<String>
    ): Exercise {
        val mainMuscles = mainMuscleIds.map { muscleService.getById(it) }
        val supportMuscles = supportMuscleIds.map { muscleService.getById(it) }
        val exercise = Exercise(name = name)
        exercise.description = description
        exercise.mainMuscles.addAll(mainMuscles)
        exercise.supportMuscles.addAll(supportMuscles)
        exercise.cues.addAll(cues)
        return exerciseRepository.save(exercise)
    }

    override fun update(
        id: Long,
        name: String,
        description: String?,
        mainMuscleIds: Set<Long>,
        supportMuscleIds: Set<Long>,
        cues: List<String>
    ): Exercise {
        val exercise = getById(id)
        val mainMuscles = mainMuscleIds.map { muscleService.getById(it) }
        val supportMuscles = supportMuscleIds.map { muscleService.getById(it) }

        exercise.name = name
        exercise.description = description

        exercise.mainMuscles.clear()
        exercise.mainMuscles.addAll(mainMuscles)

        exercise.supportMuscles.clear()
        exercise.supportMuscles.addAll(supportMuscles)

        exercise.cues.clear()
        exercise.cues.addAll(cues)

        return exerciseRepository.save(exercise)
    }

    override fun getById(id: Long): Exercise {
        return exerciseRepository.findById(id).orElseThrow()
    }

    override fun getAll(): List<Exercise> {
        return exerciseRepository.findAll()
    }
}

interface ExerciseRepository : JpaRepository<Exercise, Long>

@Entity
@Table(name = "lifting_exercise")
data class Exercise(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var description: String? = null,
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "lifting_main_muscle_exercise",
        joinColumns = [JoinColumn(name = "exercise_id")],
        inverseJoinColumns = [JoinColumn(name = "muscle_id")]
    )
    var mainMuscles: MutableSet<Muscle> = mutableSetOf(),
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "lifting_support_muscle_exercise",
        joinColumns = [JoinColumn(name = "exercise_id")],
        inverseJoinColumns = [JoinColumn(name = "muscle_id")]
    )
    var supportMuscles: MutableSet<Muscle> = mutableSetOf(),
    @Type(ListArrayType::class)
    @Column(name = "cues", columnDefinition = "text[]")
    var cues: MutableList<String> = mutableListOf(),
) {

    override fun toString(): String {
        return "Exercise(name='$name', description=$description)"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Exercise

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
}
