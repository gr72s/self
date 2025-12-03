package com.iamalangreen.self.rbac.service

import com.iamalangreen.self.rbac.config.JwtService
import com.iamalangreen.self.rbac.dto.AuthRequest
import com.iamalangreen.self.rbac.dto.AuthResponse
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.stereotype.Service


interface AuthService {
    fun authenticate(request: AuthRequest): AuthResponse
}

@Service
class DefaultAuthService(
    private val authenticationManager: AuthenticationManager,
    private val userDetailsService: UserDetailsService,
    private val jwtService: JwtService
) : AuthService {

    override fun authenticate(request: AuthRequest): AuthResponse {
        val token = UsernamePasswordAuthenticationToken(request.username, request.password)
        authenticationManager.authenticate(token)
        val userDetails: UserDetails = userDetailsService.loadUserByUsername(request.username)
        val jwtToken = jwtService.generateToken(userDetails)
        return AuthResponse(jwtToken)
    }

}