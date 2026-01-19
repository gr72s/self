package com.iamalangreen.self.auth

import com.iamalangreen.self.auth.config.JwtService
import com.iamalangreen.self.auth.dto.UserCreateRequest
import com.iamalangreen.self.auth.dto.UserResponse
import com.iamalangreen.self.auth.dto.UserUpdateRequest
import jakarta.servlet.http.HttpServletRequest
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity

@ExtendWith(MockitoExtension::class)
class UserControllerTest {

    @Mock
    private lateinit var userService: UserService

    @Mock
    private lateinit var jwtService: JwtService

    @Mock
    private lateinit var httpServletRequest: HttpServletRequest

    @InjectMocks
    private lateinit var userController: UserController

    @Test
    fun `createUser should return created user when request is valid`() {
        // Given
        val userCreateRequest = UserCreateRequest("newuser", "password123", "newuser@example.com")
        val userResponse = UserResponse(1L, "newuser", "newuser@example.com")
        `when`(userService.createUser(userCreateRequest)).thenReturn(userResponse)

        // When
        val response = userController.createUser(userCreateRequest)

        // Then
        assert(response.statusCode == HttpStatus.CREATED)
        assert(response.body == userResponse)
    }

    @Test
    fun `getUserById should return current user when token is valid`() {
        // Given
        val jwtToken = "mock-jwt-token"
        val username = "testuser"
        val userResponse = UserResponse(1L, username, "testuser@example.com")
        
        `when`(httpServletRequest.getHeader("Authorization")).thenReturn("Bearer $jwtToken")
        `when`(jwtService.extractUsername(jwtToken)).thenReturn(username)
        `when`(userService.getUserByUsername(username)).thenReturn(userResponse)

        // When
        val response = userController.getUserById(httpServletRequest)

        // Then
        assert(response.statusCode == HttpStatus.OK)
        assert(response.body == userResponse)
    }

    @Test
    fun `updateCurrentUser should return updated user when request is valid`() {
        // Given
        val jwtToken = "mock-jwt-token"
        val username = "testuser"
        val userUpdateRequest = UserUpdateRequest(email = "updated@example.com")
        val updatedUserResponse = UserResponse(1L, username, "updated@example.com")
        val mockUser = User(1L, username, "password123", "testuser@example.com")
        
        `when`(httpServletRequest.getHeader("Authorization")).thenReturn("Bearer $jwtToken")
        `when`(userService.getCurrentUser("Bearer $jwtToken")).thenReturn(mockUser)
        `when`(userService.updateUser(mockUser, userUpdateRequest)).thenReturn(updatedUserResponse)

        // When
        val response = userController.updateCurrentUser(userUpdateRequest, httpServletRequest)

        // Then
        assert(response.statusCode == HttpStatus.OK)
        assert(response.body == updatedUserResponse)
    }
}
