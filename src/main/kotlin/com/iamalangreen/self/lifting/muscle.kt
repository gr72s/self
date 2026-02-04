package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.common.PageResponse
import com.iamalangreen.self.common.PaginationUtils
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*

data class MuscleRequest(
    @field:jakarta.validation.constraints.NotBlank(message = "Muscle name is required")
    @field:jakarta.validation.constraints.Size(min = 2, max = 100)
    val name: String,
    @field:jakarta.validation.constraints.Size(max = 500)
    val description: String?,
    @field:jakarta.validation.constraints.Size(max = 200)
    val function: String?,
    @field:jakarta.validation.constraints.Size(max = 100)
    val originName: String?
)

data class MuscleResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val function: String?,
    val originName: String?
)

fun Muscle.toResponse(): MuscleResponse {
    return MuscleResponse(
        id!!,
        name,
        description,
        function,
        originName
    )
}

@RestController
@RequestMapping("/api/lifting/muscle")
class MuscleController(private val muscleService: MuscleService) {

    @PostMapping
    fun createMuscle(@jakarta.validation.Valid @RequestBody request: MuscleRequest): Response {
        return success(
            muscleService.create(request.name, request.description, request.function, request.originName).toResponse()
        )
    }

    @PutMapping("/{id}")
    fun updateMuscle(@PathVariable id: Long, @jakarta.validation.Valid @RequestBody request: MuscleRequest): Response {
        return success(
            muscleService.update(id, request.name, request.description, request.function, request.originName).toResponse()
        )
    }

    @GetMapping
    fun getAllMuscle(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "id,asc") sort: String,
        @RequestParam(required = false) name: String?
    ): Response {
        val pageable = PageRequest.of(page, size, PaginationUtils.parseSort(sort))
        val result = muscleService.getAll(name, pageable)
        val pageResponse = PageResponse.of(result.map { it.toResponse() })
        return success(pageResponse)
    }

    @GetMapping("/{id}")
    fun getById(@PathVariable id: Long): Response {
        return success(muscleService.getById(id).toResponse())
    }
}


interface MuscleService {
    fun create(name: String, description: String?, function: String?, originName: String?): Muscle
    fun update(id: Long, name: String, description: String?, function: String?, originName: String?): Muscle
    fun getAll(name: String?, pageable: Pageable): Page<Muscle>
    fun getById(id: Long): Muscle
}

@Service
class DefaultMuscleRepository(private val muscleRepository: MuscleRepository) : MuscleService {
    
    override fun create(name: String, description: String?, function: String?, originName: String?): Muscle {
        return muscleRepository.save(Muscle(name = name, description = description, function = function, originName = originName))
    }

    override fun update(id: Long, name: String, description: String?, function: String?, originName: String?): Muscle {
        val muscle = getById(id)
        muscle.name = name
        muscle.description = description
        muscle.function = function
        muscle.originName = originName
        return muscleRepository.save(muscle)
    }

    override fun getAll(name: String?, pageable: Pageable): Page<Muscle> {
        return if (name != null) {
            muscleRepository.findByNameContainingIgnoreCase(name, pageable)
        } else {
            muscleRepository.findAll(pageable)
        }
    }

    override fun getById(id: Long): Muscle {
        return muscleRepository.findById(id).orElseThrow()
    }
}

interface MuscleRepository : JpaRepository<Muscle, Long> {
    fun findByNameContainingIgnoreCase(name: String, pageable: Pageable): Page<Muscle>
}

@Entity
@Table(name = "lifting_muscle")
data class Muscle(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var description: String?,
    @Column
    var function: String? = null,
    @Column(name = "origin_name")
    var originName: String? = null,
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