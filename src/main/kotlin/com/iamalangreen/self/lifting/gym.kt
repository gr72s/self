package com.iamalangreen.self.lifting

import jakarta.persistence.*

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
)