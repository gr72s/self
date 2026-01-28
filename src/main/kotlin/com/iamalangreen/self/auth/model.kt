package com.iamalangreen.self.auth

import jakarta.persistence.*
import java.time.LocalDateTime

data class UserResponse(
    val id: Long,
    val username: String,
    val email: String,
)

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