package com.iamalangreen.self.exception

import jakarta.servlet.http.HttpServletRequest
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.LocalDateTime

/**
 * Error response format
 */
data class ErrorResponse(
    val code: String,
    val message: String,
    val details: Map<String, Any>? = null,
    val timestamp: LocalDateTime = LocalDateTime.now(),
    val path: String? = null
)

/**
 * Global exception handler for all controllers
 */
@RestControllerAdvice
class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(
        ex: ResourceNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(
                code = "RESOURCE_NOT_FOUND",
                message = ex.message ?: "Resource not found",
                path = request.requestURI
            ))
    }
    
    @ExceptionHandler(ValidationException::class)
    fun handleValidation(
        ex: ValidationException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(
                code = "VALIDATION_ERROR",
                message = ex.message ?: "Validation failed",
                details = ex.errors,
                path = request.requestURI
            ))
    }
    
    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorized(
        ex: UnauthorizedException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.UNAUTHORIZED)
            .body(ErrorResponse(
                code = "UNAUTHORIZED",
                message = ex.message ?: "Authentication required",
                path = request.requestURI
            ))
    }
    
    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequest(
        ex: BadRequestException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(
                code = "BAD_REQUEST",
                message = ex.message ?: "Invalid request",
                path = request.requestURI
            ))
    }
    
    @ExceptionHandler(NoSuchElementException::class)
    fun handleNoSuchElement(
        ex: NoSuchElementException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(
                code = "RESOURCE_NOT_FOUND",
                message = ex.message ?: "Resource not found",
                path = request.requestURI
            ))
    }
    
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException::class)
    fun handleMethodArgumentNotValid(
        ex: org.springframework.web.bind.MethodArgumentNotValidException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val errors = ex.bindingResult.fieldErrors
            .associate { it.field to (it.defaultMessage ?: "Invalid value") }
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(
                code = "VALIDATION_ERROR",
                message = "Request validation failed",
                details = errors,
                path = request.requestURI
            ))
    }
    
    @ExceptionHandler(jakarta.validation.ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: jakarta.validation.ConstraintViolationException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val errors = ex.constraintViolations
            .associate { 
                it.propertyPath.toString() to it.message 
            }
        
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(
                code = "VALIDATION_ERROR",
                message = "Constraint validation failed",
                details = errors,
                path = request.requestURI
            ))
    }
    
    @ExceptionHandler(Exception::class)
    fun handleGeneral(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        // Log the actual exception for debugging
        ex.printStackTrace()
        
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ErrorResponse(
                code = "INTERNAL_ERROR",
                message = "An unexpected error occurred",
                path = request.requestURI
            ))
    }
}
