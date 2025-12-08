package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


data class WorkoutResponse(
    val id: Long,
    val name: String,
    val gym: GymResponse,
    val target: Set<TargetResponse> = setOf(),
    val note: String?
)

fun Workout.toResponse(): WorkoutResponse {
    return WorkoutResponse(
        id!!,
        name,
        gym.toResponse(),
        target.map { it.toResponse() }.toSet(),
        note
    )
}

@RestController
@RequestMapping("/api/lifting/workout")
class WorkoutController(val workoutService: WorkoutService) {

    @GetMapping
    fun getAllWorkout(): Response {
        return success(workoutService.getAllWorkout())
    }

}

@Service
class WorkoutService(private val workoutRepository: WorkoutRepository) {
    fun getAllWorkout(): List<Workout> {
        return workoutRepository.findAll()
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
    var name: String,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    var gym: Gym,
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id")
    var routine: Routine,
    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "workout_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),
    @Column
    var note: String?
)