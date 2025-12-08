package com.iamalangreen.self.lifting

import jakarta.persistence.*

data class TargetResponse(
    val id: Long,
    val name: String,
)

fun Target.toResponse(): TargetResponse {
    return TargetResponse(id!!, name)
}

@Entity
@Table(name = "lifting_target")
data class Target(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    val name: String,
) {
    override fun toString(): String {
        return "Target(name='$name')"
    }
}