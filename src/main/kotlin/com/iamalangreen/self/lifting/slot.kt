package com.iamalangreen.self.lifting

import jakarta.persistence.*

data class SlotResponse(
    val id: Long,
    val exercise: ExerciseResponse,
    val category: Category,
    val setNumber: Int,
    val weight: Float,
    val reps: Int,
    val duration: Int,
    val sequence: Int
)

fun Slot.toResponse(): SlotResponse {
    return SlotResponse(
        id!!,
        exercise.toResponse(),
        category,
        setNumber,
        weight,
        reps,
        duration,
        sequence
    )
}

@Entity
@Table(name = "lifting_slot")
data class Slot(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id")
    var exercise: Exercise,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id") // 数据库外键
    var routine: Routine? = null,
    @Column
    var stars: Int,
    @Column
    @Enumerated(EnumType.STRING)
    var category: Category = Category.WorkingSets,
    @Column
    var setNumber: Int,
    @Column
    var weight: Float,
    @Column
    var reps: Int,
    @Column
    var duration: Int,
    @Column
    var sequence: Int
)

enum class Category {
    Mobility, // Self-MyofascialRelease FoamRolling
    WarmUp,
    Activation,
    WorkingSets,
}