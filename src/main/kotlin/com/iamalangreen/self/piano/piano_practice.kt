package com.iamalangreen.self.piano

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

data class CreatePianoPracticeRequest(
    val session: Long,
    val minutes: Int,
    val piece: Long,
    val tags: List<Long> = emptyList(),
    val note: String?,
    val bpm: Int,
    val type: PianoPracticeType,
)

data class PianoPracticeResponse(
    val id: Long,
    val minutes: Int,
    val piece: PieceResponse?,
    val tags: List<TagResponse>,
    val note: String?,
    val bpm: Int?,
    val type: PianoPracticeType,
)

fun PianoPractice.toResponse(): PianoPracticeResponse {
    return PianoPracticeResponse(
        id = id!!,
        minutes = minutes,
        piece = piece?.toResponse(),
        tags = tags.map { it.toResponse() },
        note = note,
        bpm = bpm,
        type = type,
    )
}

@RestController
@RequestMapping("/api/piano/piano-practice")
class PianoPracticeController(
    val pianoPracticeService: PianoPracticeService,
    val practiceSessionService: PracticeSessionService,
    val pieceService: PieceService
) {

    @PostMapping
    fun createPianoPractice(@RequestBody request: CreatePianoPracticeRequest): Response {
        val practiceSession = practiceSessionService.getPracticeSession(request.session)
        val piece = pieceService.getPiece(request.piece)
        val pianoPractice = pianoPracticeService.createPianoPractice(
            practiceSession,
            request.minutes,
            piece,
            request.note,
            request.bpm,
            request.type
        )
        return success(pianoPractice.toResponse())
    }

}

@Service
class PianoPracticeService(private val practiceRepository: PianoPracticeRepository) {

    fun createPianoPractice(
        practiceSession: PracticeSession,
        minutes: Int,
        piece: Piece,
        note: String?,
        bpm: Int,
        type: PianoPracticeType
    ): PianoPractice {
        val practicePractice = PianoPractice(
            session = practiceSession,
            minutes = minutes,
            piece = piece,
            note = note,
            bpm = bpm,
            type = type
        )
        practiceRepository.save(practicePractice)
        return practicePractice
    }

}

interface PianoPracticeRepository : JpaRepository<PianoPractice, Long> {
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

) {
    override fun toString(): String {
        return "PianoPractice(id=$id, minutes=$minutes, piece=${piece?.title}, note=$note, bpm=$bpm)"
    }
}

enum class PianoPracticeType {
    FUNDAMENTAL, // 吊臂、手型等基础
    TECHNIQUE,   // 哈农、音阶
    REPERTOIRE   // 乐曲
}
