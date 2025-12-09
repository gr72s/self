package com.iamalangreen.self.lifting

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class RoutineResponse(
    val id: Long,
)

fun Routine.toRoutineResponse(): RoutineResponse = RoutineResponse(id!!)

@RestController
@RequestMapping("/api/lifting/routine")
class RoutineController(val routineService: RoutineService) {

    fun createRoutine(): Response {
        return success()
    }

}

interface RoutineService {
    fun getById(id: Long): Routine
}

@Service
class DefaultRoutineService(private val routineRepository: RoutineRepository) : RoutineService {
    override fun getById(id: Long): Routine {
        return routineRepository.findById(id).orElseThrow()
    }
}

interface RoutineRepository : JpaRepository<Routine, Long>

@Entity
@Table(name = "lifting_routine")
data class Routine(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var description: String?,
    @Column
    val template: Boolean,
    @OneToOne(mappedBy = "routine", fetch = FetchType.LAZY, cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    var workout: Workout? = null,
    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "routine_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),
    @OneToMany(mappedBy = "routine", cascade = [CascadeType.ALL], orphanRemoval = true)
    var slots: MutableSet<Slot> = mutableSetOf(),
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    var checklist: MutableList<ChecklistItem> = mutableListOf(),
    @Column
    var note: String?
) {
    override fun toString(): String {
        return "Routine(name='$name', description=$description)"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as Routine

        return id == other.id
    }

    override fun hashCode(): Int {
        return id?.hashCode() ?: 0
    }

}

data class ChecklistItem(
    val name: String,
    val isOptional: Boolean = false
)

fun createRoutine(
    name: String,
    description: String? = null,
    target: MutableSet<Target> = mutableSetOf(),
    slots: MutableSet<Slot> = mutableSetOf(),
    checklist: MutableList<ChecklistItem> = mutableListOf(),
    note: String? = null,
): Routine {
    return Routine(
        name = name,
        description = description,
        template = false,
        target = target,
        slots = slots,
        checklist = checklist,
        note = note
    )
}

fun createRoutineTemplate(
    name: String,
    description: String? = null,
    target: MutableSet<Target> = mutableSetOf(),
    slots: MutableSet<Slot> = mutableSetOf(),
    checklist: MutableList<ChecklistItem> = mutableListOf(),
    note: String? = null,
): Routine {
    return Routine(
        name = name,
        description = description,
        template = true,
        target = target,
        slots = slots,
        checklist = checklist,
        note = note
    )
}

