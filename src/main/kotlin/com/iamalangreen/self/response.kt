package com.iamalangreen.self

import org.springframework.http.HttpStatus

data class Response(
    val status: Int = HttpStatus.OK.value(),
    val message: String = String(),
    val data: Any? = null,
    val error: Any? = null
)

fun errorResponse(status: Int, message: String, error: Any?): Response {
    return Response(status, message, error)
}

private const val SUCCESS = "success"
private const val ERROR = "error"

fun success(data: Any? = null): Response {
    return Response(HttpStatus.OK.value(), SUCCESS, data)
}

private data class ExceptionWrapper(val reason: String, val message: String? = null, val stackTrace: String? = null)

fun serverError(e: SelfServerException): Response {
    return errorResponse(e.statusCode, ERROR, ExceptionWrapper(e.reason, e.message, e.stackTraceToString()))
}

fun unknownError(e: Exception): Response {
    return errorResponse(
        UNKNOWN_ERROR_STATUS_CODE,
        ERROR,
        ExceptionWrapper("Unknown", e.localizedMessage, e.stackTraceToString())
    )
}