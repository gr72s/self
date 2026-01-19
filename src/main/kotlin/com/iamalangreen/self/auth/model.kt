package com.iamalangreen.self.auth

import jakarta.persistence.*
import java.time.LocalDateTime

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


@Entity
@Table(name = "devices")
data class Device(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column
    val deviceId: String,

    @Column
    val deviceInfo: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: User,

    @Column
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column
    var lastUsedAt: LocalDateTime = LocalDateTime.now()
)