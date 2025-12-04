package com.iamalangreen.self.lifting

import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@Entity
@Table(name = "lifting_movement")
@EntityListeners(AuditingEntityListener::class)
data class Movement(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    var name: String,
    @Column
    var originName: String,
    @Column
    var shortName: String,

    @Type(ListArrayType::class)
    @Column(name = "keypoint", columnDefinition = "text[]")
    var keypoint: MutableList<String> = mutableListOf(),

    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "lifting_target",
        joinColumns = [JoinColumn(name = "movement_id")],
        inverseJoinColumns = [JoinColumn(name = "target_id")]
    )
    var target: MutableSet<Target> = mutableSetOf(),

    @CreatedDate
    @Column(updatable = false)
    var createTime: LocalDateTime? = null,
    @LastModifiedDate
    var updateTime: LocalDateTime? = null,
)