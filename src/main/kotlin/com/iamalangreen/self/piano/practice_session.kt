package com.iamalangreen.self.piano

import com.fasterxml.jackson.annotation.JsonFormat
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
import java.time.temporal.ChronoUnit


data class CreatePracticeSessionRequest(
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm")
    val startTime: LocalDateTime
)

data class PracticeSessionResponse(
    val id: Long,
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    val startTime: LocalDateTime,
    val summary: String? = null,
    val practiceRecords: List<PianoPractice> = listOf(),
    val earTrainingRecords: List<SolfeggioPractice> = listOf(),
)

fun PracticeSession.toResponse(): PracticeSessionResponse {
    return PracticeSessionResponse(
        id!!,
        startTime,
        summary,
        practiceRecords,
        earTrainingRecords,
    )
}

@RestController
@RequestMapping("/api/piano/practice-session")
class PracticeSessionController(private val practiceSessionService: PracticeSessionService) {

    @PostMapping
    fun createPracticeSession(@RequestBody request: CreatePracticeSessionRequest): Response {
        val startTime = request.startTime.truncatedTo(ChronoUnit.MINUTES)
        val practiceSession = practiceSessionService.createPracticeSession(startTime)
        return success(practiceSession.toResponse())
    }

}

@Service
class PracticeSessionService(val practiceSessionRepository: PracticeSessionRepository) {

    fun createPracticeSession(startTime: LocalDateTime): PracticeSession {
        val cleanStartTime = startTime.truncatedTo(ChronoUnit.MINUTES)
        val practiceSession = PracticeSession(startTime = cleanStartTime)
        practiceSessionRepository.save(practiceSession)
        return practiceSession
    }

    fun getPracticeSession(id: Long): PracticeSession {
        return practiceSessionRepository.findById(id).orElseThrow()
    }

}

interface PracticeSessionRepository : JpaRepository<PracticeSession, Long> {
}


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
    var earTrainingRecords: MutableList<SolfeggioPractice> = mutableListOf(),

    @CreatedDate
    @Column(updatable = false)
    var createTime: LocalDateTime? = null,

    @LastModifiedDate
    var updateTime: LocalDateTime? = null,
)

fun PracticeSession.totalMinutes(): Int {
    return practiceRecords.sumOf { it.minutes }
}