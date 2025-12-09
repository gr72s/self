package com.iamalangreen.self.piano

import com.iamalangreen.self.Response
import com.iamalangreen.self.success
import jakarta.persistence.*
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service
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

    fun createOrGetTag(request: CreateTagRequest): Response {
        val tag = tagService.createOrGetTag(request.name)
        return success(tag.toResponse())
    }

    fun deleteTag(id: Long): Response {
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

    override fun deleteTag(id: Long) {
        repository.deleteById(id)
    }

    override fun getTags(ids: List<Long>): List<Tag> {
        return repository.findAllById(ids)
    }

}

interface TagRepository : JpaRepository<Tag, Long> {
    fun findByName(name: String): Tag?
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