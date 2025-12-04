package com.iamalangreen.self

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestControllerAdvice


abstract class SelfServerException(val statusCode: Int, val reason: String, message: String) :
    RuntimeException(message)

const val UNKNOWN_ERROR_STATUS_CODE = 4000

class NotFoundEntityException : SelfServerException(4001, "NotFoundEntity", "Not found entity")
class UnsupportedIntervalException : SelfServerException(4002, "UnsupportedInterval", "Unsupported interval")

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(Exception::class)
    @ResponseBody
    fun handleException(e: Exception): ResponseEntity<Response> {
        e.printStackTrace()

        return when (e) {
            is SelfServerException -> ResponseEntity.ok(serverError(e))
            else -> ResponseEntity.ok(unknownError(e))
        }
    }

}