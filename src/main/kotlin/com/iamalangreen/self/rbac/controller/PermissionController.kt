package com.iamalangreen.self.rbac.controller

import com.iamalangreen.self.rbac.dto.PermissionCreateRequest
import com.iamalangreen.self.rbac.dto.PermissionResponse
import com.iamalangreen.self.rbac.service.PermissionService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/permissions")
class PermissionController(private val permissionService: PermissionService) {

    @PostMapping
    @PreAuthorize("hasAuthority('permission:manage')")
    fun createPermission(@RequestBody request: PermissionCreateRequest): ResponseEntity<PermissionResponse> {
        val permission = permissionService.createPermission(request)
        return ResponseEntity(permission, HttpStatus.CREATED)
    }

    @GetMapping
    @PreAuthorize("hasAuthority('permission:manage') or hasAuthority('permission:read')")
    fun getAllPermissions(): ResponseEntity<List<PermissionResponse>> {
        val permissions = permissionService.getAllPermissions()
        return ResponseEntity.ok(permissions)
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('permission:manage') or hasAuthority('permission:read')")
    fun getPermissionById(@PathVariable id: Long): ResponseEntity<PermissionResponse> {
        val permission = permissionService.getPermissionById(id)
        return ResponseEntity.ok(permission)
    }

}