package com.iamalangreen.self.auth.jwt

import com.iamalangreen.self.config.JwtConfig
import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtil(private val jwtConfig: JwtConfig) {
    
    private val secretKey: SecretKey = Keys.hmacShaKeyFor(jwtConfig.secret.toByteArray())
    
    /**
     * Generate JWT token with userId and openid
     */
    fun generateToken(userId: Long, openid: String): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtConfig.expiration)
        
        return Jwts.builder()
            .subject(userId.toString())
            .claim("openid", openid)
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(secretKey)
            .compact()
    }
    
    /**
     * Extract user ID from token
     */
    fun getUserIdFromToken(token: String): Long? {
        return try {
            val claims = parseToken(token)
            claims.subject.toLong()
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Extract openid from token
     */
    fun getOpenidFromToken(token: String): String? {
        return try {
            val claims = parseToken(token)
            claims["openid"] as? String
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Validate token
     */
    fun validateToken(token: String): Boolean {
        return try {
            parseToken(token)
            true
        } catch (e: JwtException) {
            false
        } catch (e: IllegalArgumentException) {
            false
        }
    }
    
    /**
     * Parse and validate token
     */
    private fun parseToken(token: String): Claims {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .payload
    }
}
