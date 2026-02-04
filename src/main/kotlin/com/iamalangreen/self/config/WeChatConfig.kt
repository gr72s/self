package com.iamalangreen.self.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "wechat.miniprogram")
data class WeChatConfig(
    var appid: String = "",
    var secret: String = ""
)
