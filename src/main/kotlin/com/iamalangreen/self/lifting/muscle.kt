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
    var originName: String,
    @Column
    var function: String?,
    @OneToMany(mappedBy = "muscle", cascade = [CascadeType.ALL], orphanRemoval = true)
    var exercises: MutableSet<Exercise> = mutableSetOf(),
) {
    override fun toString(): String {
        return "Muscle(name='$name')"
    }
}