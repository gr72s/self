package com.iamalangreen.self.lifting

import jakarta.persistence.*


@Entity
@Table(name = "lifting_target")
data class Target(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    val name: String,
)