package com.iamalangreen.self.config

import com.iamalangreen.self.auth.jwt.JwtAuthenticationFilter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

/**
 * Spring Security configuration for JWT-based authentication
 */
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter
) {
    
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            // Disable CSRF (not needed for stateless JWT)
            .csrf { it.disable() }
            
            // Stateless session management
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            
            // Configure authorization
            .authorizeHttpRequests { auth ->
                auth
                    // Allow public access to auth endpoints
                    .requestMatchers("/api/auth/**").permitAll()
                    
                    // All other /api endpoints require authentication
                    .requestMatchers("/api/**").authenticated()
                    
                    // Allow all other requests (e.g., actuator, health checks)
                    .anyRequest().permitAll()
            }
            
            // Add JWT filter before Spring Security's default filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)
        
        return http.build()
    }
}
