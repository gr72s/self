package com.iamalangreen.self.auth

import jakarta.persistence.*

@Entity
@Table(name = "users")
data class User(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    @Column
    var username: String,
    @Column
    var password: String,
    @Column
    var email: String,
)