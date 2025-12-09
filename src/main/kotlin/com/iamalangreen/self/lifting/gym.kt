package com.iamalangreen.self.lifting

import com.iamalangreen.self.EntityAlreadyExistException
import com.iamalangreen.self.IllegalRequestArgumentException
import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import kotlin.jvm.optionals.getOrNull

data class CreateGymRequest(
    val name: String,
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
    fun createGym(request: CreateGymRequest): Response {
        if (request.name.isBlank() || request.location.isBlank()) {
            throw IllegalRequestArgumentException()
        }
        return success(gymService.createGym(request.name, request.location))
    }

    @GetMapping
    fun getAllGym(): Response {
        return success(gymService.getAllGym())
    }

}

interface GymService {
    fun createGym(name: String, location: String): Gym
    fun getAllGym(): List<Gym>
    fun findByName(name: String): Gym?
    fun findById(id: Long): Gym?
    fun getById(id: Long): Gym
}

@Service
class DefaultGymService(private val gymRepository: GymRepository) : GymService {

    override fun createGym(name: String, location: String): Gym {
        findByName(name) ?: throw EntityAlreadyExistException()
        return gymRepository.save(Gym(name = name, location = location))
    }

    override fun getAllGym(): List<Gym> {
        return gymRepository.findAll()
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