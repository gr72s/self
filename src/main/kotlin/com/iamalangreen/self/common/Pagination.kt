package com.iamalangreen.self.common

import org.springframework.data.domain.Page
import org.springframework.data.domain.Sort

/**
 * Pagination response wrapper
 */
data class PageResponse<T>(
    val data: List<T>,
    val page: PageInfo
) {
    companion object {
        fun <T> of(springPage: Page<T>): PageResponse<T> {
            return PageResponse(
                data = springPage.content,
                page = PageInfo(
                    number = springPage.number,
                    size = springPage.size,
                    totalElements = springPage.totalElements,
                    totalPages = springPage.totalPages
                )
            )
        }
    }
}

/**
 * Page metadata information
 */
data class PageInfo(
    val number: Int,         // Current page number (0-indexed)
    val size: Int,           // Page size
    val totalElements: Long, // Total number of elements
    val totalPages: Int      // Total number of pages
)

/**
 * Utility object for pagination helpers
 */
object PaginationUtils {
    /**
     * Parse sort parameter string into Spring Data Sort object
     * Format: "field,direction" e.g., "startTime,desc"
     */
    fun parseSort(sortParam: String): Sort {
        val parts = sortParam.split(",")
        if (parts.size != 2) {
            // Default sort by id descending
            return Sort.by(Sort.Direction.DESC, "id")
        }
        
        val field = parts[0].trim()
        val direction = when(parts[1].trim().lowercase()) {
            "asc" -> Sort.Direction.ASC
            "desc" -> Sort.Direction.DESC
            else -> Sort.Direction.DESC
        }
        
        return Sort.by(direction, field)
    }
}
