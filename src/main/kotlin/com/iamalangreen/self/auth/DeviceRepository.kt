package com.iamalangreen.self.auth

import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface DeviceRepository : JpaRepository<Device, Long> {
    fun findByDeviceId(deviceId: String): Optional<Device>
    fun existsByDeviceId(deviceId: String): Boolean
}
