package com.iamalangreen.self.lifting

import com.iamalangreen.self.EntityAlreadyExistException
import com.iamalangreen.self.IllegalRequestArgumentException
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
import kotlin.jvm.optionals.getOrNull

data class CreateGymRequest(
    @field:jakarta.validation.constraints.NotBlank(message = "Gym name is required")
    @field:jakarta.validation.constraints.Size(min = 2, max = 100)
    val name: String,
    @field:jakarta.validation.constraints.NotBlank(message = "Location is required")
    @field:jakarta.validation.constraints.Size(min = 2, max = 200)
    val location: String
)

data class GymResponse(
    val id: Long,
    val name: String,
    val location: String,
)

fun Gym.toResponse(): GymResponse {
    return GymResponse(id!!, name, location)
}


@RestController
@RequestMapping("/api/lifting/gym")
class GymController(private val gymService: GymService) {

    @PostMapping
    fun createGym(@jakarta.validation.Valid @RequestBody request: CreateGymRequest): Response {
        if (request.name.isBlank() || request.location.isBlank()) {
            throw IllegalRequestArgumentException()
        }
        return success(gymService.createGym(request.name, request.location).toResponse())
    }

    @org.springframework.web.bind.annotation.PutMapping("/{id}")
    fun updateGym(@org.springframework.web.bind.annotation.PathVariable id: Long, @jakarta.validation.Valid @RequestBody request: CreateGymRequest): Response {
        if (request.name.isBlank() || request.location.isBlank()) {
            throw IllegalRequestArgumentException()
        }
        return success(gymService.updateGym(id, request.name, request.location).toResponse())
    }

    @GetMapping
    fun getAllGym(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(defaultValue = "id,asc") sort: String,
        @RequestParam(required = false) name: String?
    ): Response {
        val pageable = PageRequest.of(page, size, PaginationUtils.parseSort(sort))
        val result = gymService.getAllGym(name, pageable)
        val pageResponse = PageResponse.of(result.map { it.toResponse() })
        return success(pageResponse)
    }

}

interface GymService {
    fun createGym(name: String, location: String): Gym
    fun updateGym(id: Long, name: String, location: String): Gym
    fun getAllGym(name: String?, pageable: Pageable): Page<Gym>
    fun findByName(name: String): Gym?
    fun findById(id: Long): Gym?
    fun getById(id: Long): Gym
}

@Service
class DefaultGymService(private val gymRepository: GymRepository) : GymService {

    override fun createGym(name: String, location: String): Gym {
        if (findByName(name) != null) {
            throw EntityAlreadyExistException()
        }
        return gymRepository.save(Gym(name = name, location = location))
    }

    override fun updateGym(id: Long, name: String, location: String): Gym {
        val gym = getById(id)
        gym.name = name
        gym.location = location
        return gymRepository.save(gym)
    }

    override fun getAllGym(name: String?, pageable: Pageable): Page<Gym> {
        return if (name != null) {
            gymRepository.findByNameContainingIgnoreCase(name, pageable)
        } else {
            gymRepository.findAll(pageable)
        }
    }

    override fun findByName(name: String): Gym? {
        return gymRepository.findByName(name)
    }

    override fun findById(id: Long): Gym? {
        return gymRepository.findById(id).getOrNull()
    }

    override fun getById(id: Long): Gym {
        return gymRepository.findById(id).orElseThrow()
    }

}

interface GymRepository : JpaRepository<Gym, Long> {
    fun findByName(name: String): Gym?
    fun findByNameContainingIgnoreCase(name: String, pageable: Pageable): Page<Gym>
}

@Entity
@Table(name = "lifting_gym")
data class Gym(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var location: String
) {
    override fun toString(): String {
        return "Gym(id=$id, name='$name', location='$location')"
    }
}
