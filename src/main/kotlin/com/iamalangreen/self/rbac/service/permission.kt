package com.iamalangreen.self.rbac.service

import com.iamalangreen.self.rbac.dto.PermissionCreateRequest
import com.iamalangreen.self.rbac.dto.PermissionResponse
import com.iamalangreen.self.rbac.model.Permission
import com.iamalangreen.self.rbac.repository.PermissionRepository
import org.springframework.stereotype.Service


interface PermissionService {
    fun createPermission(request: PermissionCreateRequest): PermissionResponse
    fun getAllPermissions(): List<PermissionResponse>
    fun getPermissionById(id: Long): PermissionResponse
}

@Service
class DefaultPermissionService(private val permissionRepository: PermissionRepository) : PermissionService {

    override fun createPermission(request: PermissionCreateRequest): PermissionResponse {
        if (permissionRepository.existsByName(request.name)) {
            throw RuntimeException("Permission with name '${request.name}' already exists.")
        }
        val permission = Permission(name = request.name)
        val savedPermission = permissionRepository.save(permission)
        return convertToPermissionResponse(savedPermission)
    }

    override fun getAllPermissions(): List<PermissionResponse> {
        return permissionRepository.findAll().map { convertToPermissionResponse(it) }
    }

    override fun getPermissionById(id: Long): PermissionResponse {
        val permission = permissionRepository.findById(id)
            .orElseThrow { RuntimeException("Permission not found with ID: $id") }
        return convertToPermissionResponse(permission)
    }

    private fun convertToPermissionResponse(permission: Permission): PermissionResponse {
        return PermissionResponse(
            id = permission.id,
            name = permission.name
        )
    }
}
