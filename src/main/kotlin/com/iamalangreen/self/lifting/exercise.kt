package com.iamalangreen.self.lifting

import jakarta.persistence.*

@Entity
@Table(name = "lifting_exercise")
data class Exercise(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movement_id")
    var movement: Movement,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id") // 数据库外键
    var template: Template? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id") // 数据库外键
    var workout: Workout? = null,

    @Column
    var category: String,
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