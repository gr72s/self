package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class ExerciseRequest(
    val id: Long?,
    val name: String,
    val originName: String,
    val muscles: Set<Long> = setOf(),
    val keypoint: List<String> = listOf(),
    val cues: List<String> = listOf(),
)

data class ExerciseResponse(
    val id: Long,
    val name: String,
    val originName: String,
    val keypoint: List<String> = listOf(),
    val cues: List<String> = listOf(),
)

fun Exercise.toResponse(): ExerciseResponse {
    return ExerciseResponse(
        id!!,
        name,
        originName,
        keypoint,
        cues
    )
}

@RestController
@RequestMapping("/api/lifting/exercise")
class ExerciseController(val exerciseService: ExerciseService) {
    @PostMapping
    fun createExercise(request: ExerciseRequest): Response {
        val exercise = exerciseService.create(
            request.name,
            request.originName,
            request.muscles,
            request.keypoint,
            request.cues
        )
        return success(exercise.toResponse())
    }
}

interface ExerciseService {
    fun create(
        name: String,
        originName: String,
        muscleIds: Set<Long>,
        keypoint: List<String>,
        cues: List<String>
    ): Exercise
}

@Service
class DefaultExerciseService(
    private val exerciseRepository: ExerciseRepository,
    private val muscleService: MuscleService,
) : ExerciseService {
    override fun create(
        name: String,
        originName: String,
        muscleIds: Set<Long>,
        keypoint: List<String>,
        cues: List<String>
    ): Exercise {
        val muscles = muscleIds.map { muscleService.getById(it) }
        val exercise = Exercise(name = name, originName = originName)
        exercise.muscles.addAll(muscles)
        exercise.keypoint.addAll(keypoint)
        exercise.cues.addAll(cues)
        return exerciseRepository.save(exercise)
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
    var originName: String,
    @ManyToMany
    @JoinTable(
        name = "lifting_muscle_exercise",
        joinColumns = [JoinColumn(name = "exercise_id")],
        inverseJoinColumns = [JoinColumn(name = "muscle_id")]
    )
    var muscles: MutableSet<Muscle> = mutableSetOf(),
    @Type(ListArrayType::class)
    @Column(name = "keypoint", columnDefinition = "text[]")
    var keypoint: MutableList<String> = mutableListOf(),
    @Type(ListArrayType::class)
    @Column(name = "cues", columnDefinition = "text[]")
    var cues: MutableList<String> = mutableListOf(),
) {

    override fun toString(): String {
        return "Exercise(name='$name', keypoint=$keypoint, cues=$cues)"
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