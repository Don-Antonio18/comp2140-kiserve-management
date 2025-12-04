package com.kiserve.kiserve.models;

import jakarta.persistence.*;

@Entity
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long permissionID;

    private String permissionName;

    // Getters and setters
    public Long getPermissionID() { return permissionID; }
    public void setPermissionID(Long permissionID) { this.permissionID = permissionID; }

    public String getPermissionName() { return permissionName; }
    public void setPermissionName(String permissionName) { this.permissionName = permissionName; }
}
