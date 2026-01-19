package com.iamalangreen.self.auth

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findByUsername(username: String): Optional<User>
    fun existsByUsername(username: String): Boolean
    fun existsByEmail(email: String): Boolean
}

@Repository
interface DeviceRepository : JpaRepository<Device, Long> {
    fun findByDeviceId(deviceId: String): Optional<Device>
    fun existsByDeviceId(deviceId: String): Boolean
}
