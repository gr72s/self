package com.iamalangreen.self.lifting

import jakarta.persistence.*
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service

data class MuscleResponse(
    val id: Long,
    val name: String,
    val originName: String,
    val function: String
)

fun Muscle.toResponse(): MuscleResponse {
    return MuscleResponse(
        id!!,
        name,
        originName,
        function
    )
}

interface MuscleService {
    fun getById(id: Long): Muscle
}

@Service
class DefaultMuscleRepository(private val muscleRepository: MuscleRepository) : MuscleService {
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
    var originName: String,
    @Column
    var function: String,
    @ManyToMany(mappedBy = "mainMuscles")
    var exercisesAsMain: MutableSet<Exercise> = mutableSetOf(),
    @ManyToMany(mappedBy = "supportMuscles")
    var exercisesAsSupport: MutableSet<Exercise> = mutableSetOf()
) {
    override fun toString(): String {
        return "Muscle(name='$name', originName='$originName', function='$function')"
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