package com.iamalangreen.self


import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestControllerAdvice


abstract class SelfServerException(val statusCode: Int, val reason: String, message: String) :
    RuntimeException(message)

const val UNKNOWN_ERROR_STATUS_CODE = 4000

class NotFoundEntityException : SelfServerException(4001, "NotFoundEntity", "Not found entity")
class EntityAlreadyExistException : SelfServerException(4002, "EntityAlreadyExist", "Entity already exist")
class UnsupportedIntervalException : SelfServerException(4003, "UnsupportedInterval", "Unsupported interval")
class IllegalRequestArgumentException: SelfServerException(4004, "IllegalRequestArgument", "Illegal request argument")

@RestControllerAdvice
class GlobalExceptionHandler {





    @ExceptionHandler(Exception::class)
    @ResponseBody
    fun handleException(e: Exception): ResponseEntity<Response> {
        e.printStackTrace()

        return when (e) {
            is SelfServerException ->
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(serverError(e))
            else -> ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(unknownError(e))
        }
    }

}
