package com.iamalangreen.self.piano

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDateTime

data class CreateTagRequest(val name: String)

data class TagResponse(
    val id: Long,
    val name: String,
)

fun Tag.toResponse(): TagResponse {
    return TagResponse(
        id!!,
        name,
    )
}

@RestController
@RequestMapping("/api/piano/tag")
class TagController(private val tagService: TagService) {

    @PostMapping
    fun createOrGetTag(@RequestBody request: CreateTagRequest): Response {
        val tag = tagService.createOrGetTag(request.name)
        return success(tag.toResponse())
    }

    @DeleteMapping("/{id}")
    fun deleteTag(@PathVariable id: Long): Response {
        tagService.deleteTag(id)
        return success()
    }

}

interface TagService {
    fun createOrGetTag(name: String): Tag
    fun deleteTag(id: Long)
    fun getTags(ids: List<Long>): List<Tag>
}

@Service
class DefaultTagService(private val repository: TagRepository) : TagService {

    override fun createOrGetTag(name: String): Tag {
        val tag = repository.findByName(name) ?: run {
            repository.save(Tag(name = name))
        }
        return tag
    }

    @Transactional
    override fun deleteTag(id: Long) {
        if (repository.existsById(id)) {
            repository.deletePieceTagLinks(id)
            repository.deletePracticeTagLinks(id)
            repository.deleteById(id)
        }
    }

    override fun getTags(ids: List<Long>): List<Tag> {
        return repository.findAllById(ids)
    }

}

interface TagRepository : JpaRepository<Tag, Long> {
    fun findByName(name: String): Tag?

    @Modifying
    @Query(value = "delete from piece_tags where tag_id = :tagId", nativeQuery = true)
    fun deletePieceTagLinks(tagId: Long)

    @Modifying
    @Query(value = "delete from practice_tags where tag_id = :tagId", nativeQuery = true)
    fun deletePracticeTagLinks(tagId: Long)

    @Modifying
    @Query(value = "delete from piece_tags", nativeQuery = true)
    fun deleteAllPieceTagLinks()

    @Modifying
    @Query(value = "delete from practice_tags", nativeQuery = true)
    fun deleteAllPracticeTagLinks()

    @Transactional
    override fun deleteAll() {
        deleteAllPracticeTagLinks()
        deleteAllPieceTagLinks()
        deleteAllInBatch()
    }
}

@Entity
@Table(name = "piano_tags")
@EntityListeners(AuditingEntityListener::class)
data class Tag(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    @Column
    val name: String,
    @CreatedDate
    @Column
    var createTime: LocalDateTime? = null,
    @LastModifiedDate
    var updateTime: LocalDateTime? = null,
) {
    override fun toString(): String {
        return "Tag(name='$name')"
    }
}
