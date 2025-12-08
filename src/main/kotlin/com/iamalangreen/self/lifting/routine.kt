package com.iamalangreen.self.lifting

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

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
    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "template_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),
    @OneToMany(mappedBy = "routineTemplate", cascade = [CascadeType.ALL], orphanRemoval = true)
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

