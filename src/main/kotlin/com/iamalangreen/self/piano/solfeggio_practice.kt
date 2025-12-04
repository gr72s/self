package com.iamalangreen.self.piano

import com.fasterxml.jackson.annotation.JsonValue
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface SolfeggioPracticeRepository : JpaRepository<SolfeggioPractice, Long> {
}

@Entity
@Table(name = "piano_solfeggio_practices")
@EntityListeners(AuditingEntityListener::class)
data class SolfeggioPractice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    var session: PracticeSession? = null,

    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "practice_tags",
        joinColumns = [JoinColumn(name = "practice_id")],
        inverseJoinColumns = [JoinColumn(name = "tag_id")]
    )
    var tags: MutableSet<Tag> = mutableSetOf(),

    @CreatedDate
    @Column(updatable = false)
    var createTime: LocalDateTime? = null,

    @LastModifiedDate
    var updateTime: LocalDateTime? = null,

    @Column(name = "minutes")
    var minutes: Int,

    @Type(ListArrayType::class)
    @Column(name = "intervals", columnDefinition = "text[]")
    var intervals: MutableSet<String> = mutableSetOf()

) {
    override fun toString(): String {
        return "SolfeggioPractice(id=$id, minutes=$minutes, intervals=$intervals)"
    }
}

/**
 * title 完整名称 (用于显示，如 "Major 3rd")
 * shortName 简写 (用于 Tag 或小图标，如 "M3")
 * semitones 半音数 (用于计算逻辑，如 4)
 */
enum class Interval(
    val title: String,
    val shortName: String,
    val semitones: Int
) {
    // 纯一度
    PERFECT_UNISON("Perfect Unison", "P1", 0),

    // 小二度
    MINOR_SECOND("Minor 2nd", "m2", 1),

    // 大二度
    MAJOR_SECOND("Major 2nd", "M2", 2),

    // 小三度
    MINOR_THIRD("Minor 3rd", "m3", 3),

    // 大三度
    MAJOR_THIRD("Major 3rd", "M3", 4),

    // 纯四度
    PERFECT_FOURTH("Perfect 4th", "P4", 5),

    // 三全音
    TRITONE("Tritone", "TT", 6),

    // 纯五度
    PERFECT_FIFTH("Perfect 5th", "P5", 7),

    // 小六度
    MINOR_SIXTH("Minor 6th", "m6", 8),

    // 大六度
    MAJOR_SIXTH("Major 6th", "M6", 9),

    // 小七度
    MINOR_SEVENTH("Minor 7th", "m7", 10),

    // 大七度
    MAJOR_SEVENTH("Major 7th", "M7", 11),

    PERFECT_OCTAVE("Octave", "P8", 12); // 纯八度

    @JsonValue
    fun toValue(): String = this.title
}

fun Interval.fromSemitones(semitones: Int): Interval? {
    return Interval.entries.find { it.semitones == semitones }
}
