package com.iamalangreen.self.piano

import com.fasterxml.jackson.annotation.JsonValue
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import org.hibernate.annotations.Type
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.LocalDateTime

@Entity
@Table(name = "tags")
@EntityListeners(AuditingEntityListener::class)
data class Tag(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column(nullable = false, unique = true)
    val name: String,
    @CreatedDate
    @Column(updatable = false)
    var createTime: LocalDateTime? = null,
    @LastModifiedDate
    var updateTime: LocalDateTime? = null,
)

@Entity
@Table(name = "practice_sessions")
@EntityListeners(AuditingEntityListener::class)
data class PracticeSession(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column
    val startTime: LocalDateTime = LocalDateTime.now(),

    @Column
    val summary: String? = null,

    @OneToMany(mappedBy = "session", cascade = [CascadeType.ALL], orphanRemoval = true)
    var practiceRecords: MutableList<PianoPractice> = mutableListOf(),

    @OneToMany(mappedBy = "session", cascade = [CascadeType.ALL], orphanRemoval = true)
    var earTrainingRecords: MutableList<EarTrainingPractice> = mutableListOf(),

    @CreatedDate
    @Column(updatable = false)
    var createTime: LocalDateTime? = null,

    @LastModifiedDate
    var updateTime: LocalDateTime? = null,
)


fun PracticeSession.addRecord(record: PianoPractice) {
    practiceRecords.add(record)
    record.session = this
}

fun PracticeSession.totalMinutes(): Int {
    return practiceRecords.sumOf { it.minutes }
}

@Entity
@Table(name = "piano_practices")
@EntityListeners(AuditingEntityListener::class)
data class PianoPractice(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false) // 数据库外键
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "piece_id")
    var piece: Piece? = null,

    @Column
    var note: String? = null,

    @Column
    val bpm: Int? = null,

    @Enumerated(EnumType.STRING)
    val type: PianoPracticeType

)

enum class PianoPracticeType {
    FUNDAMENTAL, // 吊臂、手型等基础
    TECHNIQUE,   // 哈农、音阶
    REPERTOIRE   // 乐曲
}

@Entity
@Table(name = "ear_training_practices")
@EntityListeners(AuditingEntityListener::class)
data class EarTrainingPractice(
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
    @Column(name = "intervals",columnDefinition = "text[]")
    var intervals: MutableSet<String> = mutableSetOf()

)

@Entity
@Table(name = "pieces")
@EntityListeners(AuditingEntityListener::class)
data class Piece(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(nullable = false)
    var title: String,

    @Column
    var composer: String? = null,

    @Enumerated(EnumType.STRING)
    var status: PieceStatus = PieceStatus.LEARNING,

    @ManyToMany(cascade = [CascadeType.PERSIST, CascadeType.MERGE])
    @JoinTable(
        name = "piece_tags",
        joinColumns = [JoinColumn(name = "piece_id")],
        inverseJoinColumns = [JoinColumn(name = "tag_id")]
    )
    var tags: MutableSet<Tag> = mutableSetOf(),

    @CreatedDate
    @Column(updatable = false)
    var createTime: LocalDateTime? = null,

    @LastModifiedDate
    var updateTime: LocalDateTime? = null
)

enum class PieceStatus {
    WISHLIST,   // 想练（在清单里）
    LEARNING,   // 正在练（重点关注）
    MAINTAINING, // 已学会，偶尔复习
    ARCHIVED    // 封存/放弃
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
