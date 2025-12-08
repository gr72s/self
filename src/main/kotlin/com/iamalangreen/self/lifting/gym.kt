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

@Service
class GymService(private val gymRepository: GymRepository) {

    fun createGym(name: String, location: String): Gym {
        findGym(name) ?: throw EntityAlreadyExistException()
        return gymRepository.save(Gym(name = name, location = location))
    }

    fun getAllGym(): List<Gym> {
        return gymRepository.findAll()
    }

    fun findGym(name: String): Gym? {
        return gymRepository.findByName(name)
    }

}

interface GymRepository : JpaRepository<Gym, Int> {
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