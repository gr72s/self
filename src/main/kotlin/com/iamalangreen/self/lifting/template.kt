package com.iamalangreen.self.lifting

import com.iamalangreen.self.piano.PianoPractice
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

@Entity
@Table(name = "lifting_template")
data class Template(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,

    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "template_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),

    @OneToMany(mappedBy = "template", cascade = [CascadeType.ALL], orphanRemoval = true)
    var exercises: MutableSet<Exercise> = mutableSetOf(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    var checklist: MutableList<ChecklistItem> = mutableListOf(),

    @Column
    var note: String?
)

data class ChecklistItem(
    val name: String,
    val isOptional: Boolean = false
)