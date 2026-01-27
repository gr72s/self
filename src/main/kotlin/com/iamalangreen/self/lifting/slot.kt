package com.iamalangreen.self.lifting

import jakarta.persistence.*
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service

data class SlotRequest(
    val id: Long?,
    val routineId: Long,
    val exerciseId: Long,
    val stars: Int,
    val category: Category,
    val setNumber: Int?,
    val weight: Float?,
    val reps: Int?,
    val duration: Int? = 0,
    val sequence: Int
)

data class SlotResponse(
    val id: Long,
    val routine: RoutineResponse,
    val exercise: ExerciseResponse,
    val stars: Int,
    val category: Category,
    val setNumber: Int?,
    val weight: Float?,
    val reps: Int?,
    val duration: Int?,
    val sequence: Int
)

fun Slot.toSummaryResponse(): SlotResponse {
    return SlotResponse(
        id!!,
        routine.toSummaryResponse(),
        exercise.toResponse(),
        stars,
        category,
        setNumber,
        weight,
        reps,
        duration,
        sequence
    )
}

fun Slot.toResponse(): SlotResponse {
    return SlotResponse(
        id!!,
        routine.toSummaryResponse(),
        exercise.toResponse(),
        stars,
        category,
        setNumber,
        weight,
        reps,
        duration,
        sequence
    )
}

interface SlotService {
    fun createSlotInRoutine(
        routineId: Long,
        exerciseId: Long,
        stars: Int,
        category: Category,
        setNumber: Int?,
        weight: Float?,
        reps: Int?,
        duration: Int?,
        sequence: Int
    ): Slot
}

@Service
class DefaultSlotService(
    private val routineService: RoutineService,
    private val exerciseService: ExerciseService,
    private val slotRepository: SlotRepository,
) : SlotService {

    override fun createSlotInRoutine(
        routineId: Long,
        exerciseId: Long,
        stars: Int,
        category: Category,
        setNumber: Int?,
        weight: Float?,
        reps: Int?,
        duration: Int?,
        sequence: Int
    ): Slot {
        val routine = routineService.getById(routineId)
        val exercise = exerciseService.getById(exerciseId)
        val slot = Slot(null, exercise, routine, stars, category, setNumber, weight, reps, duration, sequence)
        return slotRepository.save(slot)
    }

}

interface SlotRepository : JpaRepository<Slot, Long>

@Entity
@Table(name = "lifting_slot")
data class Slot(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    var exercise: Exercise,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id") // 数据库外键
    var routine: Routine,
    @Column
    var stars: Int,
    @Column
    @Enumerated(EnumType.STRING)
    var category: Category = Category.WorkingSets,
    @Column
    var setNumber: Int?,
    @Column
    var weight: Float?,
    @Column
    var reps: Int?,
    @Column
    var duration: Int?,
    @Column
    var sequence: Int
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Slot

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }
}

enum class Category {
    Mobility, // Self-MyofascialRelease FoamRolling, 泡沫轴松解
    WarmUp, // 热身
    Activation, // 激活
    WorkingSets, // 正式组
    Corrective, // 纠正性训练
    Aerobic, // 有氧
    CoolDown // 静态拉伸
}
