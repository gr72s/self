package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*

data class MuscleRequest(
    val name: String,
    val description: String
)

data class MuscleResponse(
    val id: Long,
    val name: String,
    val description: String
)

fun Muscle.toResponse(): MuscleResponse {
    return MuscleResponse(
        id!!,
        name,
        description
    )
}

@RestController
@RequestMapping("/api/lifting/muscle")
class MuscleController(private val muscleService: MuscleService) {

    @PostMapping
    fun createMuscle(@RequestBody request: MuscleRequest): Response {
        return success(
            muscleService.create(request.name, request.description).toResponse()
        )
    }

    @PutMapping("/{id}")
    fun updateMuscle(@PathVariable id: Long, @RequestBody request: MuscleRequest): Response {
        return success(
            muscleService.update(id, request.name, request.description).toResponse()
        )
    }

    @GetMapping
    fun getAllMuscle(): Response {
        return success(muscleService.getAll().map { it.toResponse() })
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): Response {
        return success(muscleService.getById(id).toResponse())
    }
}


interface MuscleService {
    fun create(name: String, description: String): Muscle
    fun update(id: Long, name: String, description: String): Muscle
    fun getAll(): List<Muscle>
    fun getById(id: Long): Muscle
}

@Service
class DefaultMuscleRepository(private val muscleRepository: MuscleRepository) : MuscleService {
    
    override fun create(name: String, description: String): Muscle {
        return muscleRepository.save(Muscle(name = name, description = description))
    }

    override fun update(id: Long, name: String, description: String): Muscle {
        val muscle = getById(id)
        muscle.name = name
        muscle.description = description
        return muscleRepository.save(muscle)
    }

    override fun getAll(): List<Muscle> {
        return muscleRepository.findAll()
    }

    override fun getById(id: Long): Muscle {
        return muscleRepository.findById(id).orElseThrow()
    }
}

interface MuscleRepository : JpaRepository<Muscle, Long>

@Entity
@Table(name = "lifting_muscle")
data class Muscle(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var description: String,
    @ManyToMany(mappedBy = "mainMuscles")
    var exercisesAsMain: MutableSet<Exercise> = mutableSetOf(),
    @ManyToMany(mappedBy = "supportMuscles")
    var exercisesAsSupport: MutableSet<Exercise> = mutableSetOf()
) {
    override fun toString(): String {
        return "Muscle(name='$name', description='$description')"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Muscle

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

}