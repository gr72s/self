package com.iamalangreen.self.lifting

import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes


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

    @OneToMany(mappedBy = "workout", cascade = [CascadeType.ALL], orphanRemoval = true)
    var exercises: MutableSet<Exercise> = mutableSetOf(),

    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "workout_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    var checklist: List<ChecklistItem> = mutableListOf(),

    @Column
    var note: String?
)