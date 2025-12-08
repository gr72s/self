package com.iamalangreen.self.lifting

import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type

data class ExerciseResponse(
    val id: Long,
    val name: String,
    val originName: String,
    val keypoint: List<String> = listOf(),
    val target: Set<TargetResponse> = setOf(),
    val cues: List<String> = listOf(),
)

fun Exercise.toResponse(): ExerciseResponse {
    return ExerciseResponse(
        id!!,
        name,
        originName,
        keypoint,
        target.map { it.toResponse() }.toSet(),
        cues
    )
}

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
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "muscle_id")
    var muscle: Muscle,
    @Type(ListArrayType::class)
    @Column(name = "keypoint", columnDefinition = "text[]")
    var keypoint: MutableList<String> = mutableListOf(),
    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "exercise_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),
    @Type(ListArrayType::class)
    @Column(name = "cues", columnDefinition = "text[]")
    var cues: MutableList<String> = mutableListOf(),
) {
    override fun toString(): String {
        return "Exercise(name='$name', keypoint=$keypoint, cues=$cues)"
    }
}