package com.iamalangreen.self.lifting

import jakarta.persistence.*

@Entity
@Table(name = "lifting_muscle")
data class Muscle(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var function: String
) {
    override fun toString(): String {
        return "Muscle(name='$name', function='$function')"
    }
}