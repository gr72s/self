package com.iamalangreen.self.auth.wechat

import com.iamalangreen.self.config.WeChatConfig
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

/**
 * Response from WeChat jscode2session API
 */
data class WeChatSession(
    val openid: String = "",
    val session_key: String = "",
    val unionid: String? = null,
    val errcode: Int? = null,
    val errmsg: String? = null
)

/**
 * Client for calling WeChat Miniprogram APIs
 */
@Component
class WeChatApiClient(private val weChatConfig: WeChatConfig) {
    
    private val webClient = WebClient.builder()
        .baseUrl("https://api.weixin.qq.com")
        .build()
    
    /**
     * Call WeChat jscode2session API to exchange code for session
     * 
     * @param code Temporary login code from wx.login()
     * @return WeChatSession containing openid and session_key
     * @throws RuntimeException if WeChat API returns error
     */
    suspend fun code2Session(code: String): WeChatSession {
        val response = webClient.get()
            .uri { builder ->
                builder.path("/sns/jscode2session")
                    .queryParam("appid", weChatConfig.appid)
                    .queryParam("secret", weChatConfig.secret)
                    .queryParam("js_code", code)
                    .queryParam("grant_type", "authorization_code")
                    .build()
            }
            .retrieve()
            .awaitBody<WeChatSession>()
        
        // Check for errors
        if (response.errcode != null && response.errcode != 0) {
            throw RuntimeException("WeChat API error [${response.errcode}]: ${response.errmsg}")
        }
        
        return response
    }
}
