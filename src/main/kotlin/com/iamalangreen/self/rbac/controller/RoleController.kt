package com.iamalangreen.self.rbac.controller

import com.iamalangreen.self.rbac.dto.AssignPermissionRequest
import com.iamalangreen.self.rbac.dto.RoleCreateRequest
import com.iamalangreen.self.rbac.dto.RoleResponse
import com.iamalangreen.self.rbac.service.RoleService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/roles")
class RoleController(private val roleService: RoleService) {

    @PostMapping
    @PreAuthorize("hasAuthority('role:manage')")
    fun createRole(@Valid @RequestBody request: RoleCreateRequest): ResponseEntity<RoleResponse> {
        val role = roleService.createRole(request)
        return ResponseEntity(role, HttpStatus.CREATED)
    }

    @GetMapping
    @PreAuthorize("hasAuthority('role:manage') or hasAuthority('role:read')") // 或者根据需要更精细的权限
    fun getAllRoles(): ResponseEntity<List<RoleResponse>> {
        val roles = roleService.getAllRoles()
        return ResponseEntity.ok(roles)
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('role:manage') or hasAuthority('role:read')")
    fun getRoleById(@PathVariable id: Long): ResponseEntity<RoleResponse> {
        val role = roleService.getRoleById(id)
        return ResponseEntity.ok(role)
    }

    @PostMapping("/{id}/permissions/assign")
    @PreAuthorize("hasAuthority('role:manage')")
    fun assignPermissionToRole(
        @PathVariable id: Long,
        @Valid @RequestBody request: AssignPermissionRequest
    ): ResponseEntity<RoleResponse> {
        val role = roleService.assignPermissionToRole(id, request)
        return ResponseEntity.ok(role)
    }

    @PostMapping("/{id}/permissions/remove")
    @PreAuthorize("hasAuthority('role:manage')")
    fun removePermissionFromRole(
        @PathVariable id: Long,
        @Valid @RequestBody request: AssignPermissionRequest
    ): ResponseEntity<RoleResponse> {
        val role = roleService.removePermissionFromRole(id, request)
        return ResponseEntity.ok(role)
    }

}