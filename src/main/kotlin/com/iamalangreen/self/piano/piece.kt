package com.iamalangreen.self.piano

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
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

data class CreatePieceRequest(
    val title: String,
    val composer: String?,
    val status: PieceStatus,
    val tags: List<Long> = emptyList()
)

data class PieceResponse(
    val id: Long,
    val title: String,
    val composer: String?,
    val status: PieceStatus,
    val tags: List<TagResponse>
)

fun Piece.toResponse() = PieceResponse(
    id = id!!,
    title = title,
    composer = composer,
    status = status,
    tags = tags.sortedBy { it.id }.map { tag -> tag.toResponse() }
)

@RestController
@RequestMapping("/api/piano/piece")
class PieceController(private val pieceService: PieceService) {

    @PostMapping
    fun createPiece(@RequestBody request: CreatePieceRequest): Response {
        val piece = pieceService.createPiece(request.title, request.composer, request.status, request.tags)
        return success(piece.toResponse())
    }

}

@Service
class PieceService(private val pieceRepository: PieceRepository, private val tagService: TagService) {
    fun createPiece(title: String, composer: String?, status: PieceStatus, tags: List<Long>): Piece {
        val piece = Piece(
            title = title,
            composer = composer,
            status = status,
        )
        piece.tags.addAll(tagService.getTags(tags))
        return pieceRepository.save(piece)
    }

    fun getPiece(id: Long): Piece {
        return pieceRepository.findById(id).orElseThrow()
    }

}


interface PieceRepository : JpaRepository<Piece, Long> {
}

@Entity
@Table(name = "piano_pieces")
@EntityListeners(AuditingEntityListener::class)
data class Piece(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column
    var title: String,

    @Column
    var composer: String? = null,

    @Enumerated(EnumType.STRING)
    var status: PieceStatus = PieceStatus.LEARNING,

    @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.MERGE])
    @JoinTable(
        name = "piece_tags",
        joinColumns = [JoinColumn(name = "piece_id")],
        inverseJoinColumns = [JoinColumn(name = "tag_id")]
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
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
