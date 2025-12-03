package com.iamalangreen.self.rbac.service

import com.iamalangreen.self.rbac.dto.AssignPermissionRequest
import com.iamalangreen.self.rbac.dto.RoleCreateRequest
import com.iamalangreen.self.rbac.dto.RoleResponse
import com.iamalangreen.self.rbac.model.Role
import com.iamalangreen.self.rbac.repository.PermissionRepository
import com.iamalangreen.self.rbac.repository.RoleRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

interface RoleService {
    fun createRole(request: RoleCreateRequest): RoleResponse
    fun getAllRoles(): List<RoleResponse>
    fun getRoleById(id: Long): RoleResponse
    fun assignPermissionToRole(roleId: Long, request: AssignPermissionRequest): RoleResponse
    fun removePermissionFromRole(roleId: Long, request: AssignPermissionRequest): RoleResponse
}

@Service
class DefaultRoleService(
    private val roleRepository: RoleRepository,
    private val permissionRepository: PermissionRepository
) : RoleService {

    @Transactional
    override fun createRole(request: RoleCreateRequest): RoleResponse {
        if (roleRepository.existsByName(request.name)) {
            throw RuntimeException("Role with name '${request.name}' already exists.")
        }

        val permissions = request.permissionNames?.mapNotNull { permissionName ->
            permissionRepository.findByName(permissionName).orElse(null)
        }?.toMutableSet() ?: mutableSetOf()

        val role = Role(name = request.name, permissions = permissions)
        val savedRole = roleRepository.save(role)
        return convertToRoleResponse(savedRole)
    }

    override fun getAllRoles(): List<RoleResponse> {
        return roleRepository.findAll().map { convertToRoleResponse(it) }
    }

    override fun getRoleById(id: Long): RoleResponse {
        val role = roleRepository.findById(id)
            .orElseThrow { RuntimeException("Role not found with ID: $id") }
        return convertToRoleResponse(role)
    }

    @Transactional
    override fun assignPermissionToRole(roleId: Long, request: AssignPermissionRequest): RoleResponse {
        val role = roleRepository.findById(roleId)
            .orElseThrow { RuntimeException("Role not found with ID: $roleId") }
        val permission = permissionRepository.findByName(request.permissionName)
            .orElseThrow { RuntimeException("Permission not found with name: ${request.permissionName}") }

        role.permissions.add(permission)
        val updatedRole = roleRepository.save(role)
        return convertToRoleResponse(updatedRole)
    }

    @Transactional
    override fun removePermissionFromRole(roleId: Long, request: AssignPermissionRequest): RoleResponse {
        val role = roleRepository.findById(roleId)
            .orElseThrow { RuntimeException("Role not found with ID: $roleId") }
        val permission = permissionRepository.findByName(request.permissionName)
            .orElseThrow { RuntimeException("Permission not found with name: ${request.permissionName}") }

        role.permissions.remove(permission)
        val updatedRole = roleRepository.save(role)
        return convertToRoleResponse(updatedRole)
    }

    private fun convertToRoleResponse(role: Role): RoleResponse {
        return RoleResponse(
            id = role.id,
            name = role.name,
            permissions = role.permissions.map { it.name }.toSet()
        )
    }

}