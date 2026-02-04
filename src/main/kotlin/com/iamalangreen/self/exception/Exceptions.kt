package com.iamalangreen.self.exception

/**
 * Base exception for domain-specific errors
 */
abstract class ApplicationException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

/**
 * Thrown when a requested resource is not found
 */
class ResourceNotFoundException(message: String) : ApplicationException(message)

/**
 * Thrown when request validation fails
 */
class ValidationException(
    message: String,
    val errors: Map<String, String> = emptyMap()
) : ApplicationException(message)

/**
 * Thrown when authentication fails or is required
 */
class UnauthorizedException(message: String) : ApplicationException(message)

/**
 * Thrown when request parameters are invalid
 */
class BadRequestException(message: String) : ApplicationException(message)
