package com.iamalangreen.self.auth

import com.iamalangreen.self.auth.dto.AuthRequest
import com.iamalangreen.self.auth.dto.AuthResponse
import com.iamalangreen.self.auth.dto.DeviceAuthRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

@ExtendWith(MockitoExtension::class)
class AuthControllerTest {

    @Mock
    private lateinit var authService: AuthService

    @InjectMocks
    private lateinit var authController: AuthController

    @Test
    fun `authenticate should return JWT token when credentials are valid`() {
        // Given
        val authRequest = AuthRequest("testuser", "password123")
        val authResponse = AuthResponse("mock-jwt-token")
        `when`(authService.authenticate(authRequest)).thenReturn(authResponse)

        // When
        val response = authController.authenticate(authRequest)

        // Then
        assert(response.statusCode == HttpStatus.OK)
        assert(response.body == authResponse)
    }

    @Test
    fun `authenticateDevice should return JWT token when device is valid`() {
        // Given
        val deviceAuthRequest = DeviceAuthRequest("device123", "{\"userAgent\":\"test-agent\"}")
        val authResponse = AuthResponse("mock-jwt-token")
        `when`(authService.authenticateDevice(deviceAuthRequest)).thenReturn(authResponse)

        // When
        val response = authController.authenticateDevice(deviceAuthRequest)

        // Then
        assert(response.statusCode == HttpStatus.OK)
        assert(response.body == authResponse)
    }
}
