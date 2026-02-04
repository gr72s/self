package com.iamalangreen.self.auth.wechat

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * Controller for WeChat Miniprogram authentication
 */
@RestController
@RequestMapping("/api/auth/wechat")
class WeChatAuthController(
    private val weChatAuthService: WeChatAuthService
) {
    
    /**
     * WeChat login endpoint
     * 
     * Accepts a temporary code from wx.login() and returns a JWT token
     * 
     * @param request Contains the WeChat login code
     * @return JWT token and user information
     */
    @PostMapping("/login")
    fun login(@RequestBody request: WeChatLoginRequest): ResponseEntity<WeChatLoginResponse> {
        val response = weChatAuthService.login(request)
        return ResponseEntity.ok(response)
    }
}
