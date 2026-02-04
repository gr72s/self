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
    
    @Column(unique = true, nullable = false)
    val openid: String,  // WeChat openid (required)
    
    @Column(name = "session_key")
    var sessionKey: String? = null,  // WeChat session_key
    
    @Column(name = "union_id")
    var unionId: String? = null,  // WeChat unionid
    
    @Column
    var nickname: String? = null,  // Display name
    
    @Column(name = "avatar_url")
    var avatarUrl: String? = null,  // Profile picture URL
    
    @Column
    var username: String? = null,  // Optional username
    
    @Column
    var password: String? = null,  // Optional password (not used for WeChat login)
    
    @Column
    var email: String? = null,  // Optional email
    
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at")
    var updatedAt: LocalDateTime = LocalDateTime.now()
)