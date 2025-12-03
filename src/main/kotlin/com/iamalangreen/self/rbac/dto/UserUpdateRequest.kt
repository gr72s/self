/*
 * @author   shen heren
 * @email    shenhr@winring.com.cn
 * @date     2025年07月10日 10:59
 * @brief
 * @modifier
 *
 * @Chengdu Winring Technology Co.,Ltd.
 * all rights reserved.
 */
package com.iamalangreen.self.rbac.dto

import jakarta.validation.constraints.Email

data class UserUpdateRequest(
    val username: String? = null,
    val password: String? = null,
    @field:Email(message = "Invalid email format")
    val email: String? = null,
)