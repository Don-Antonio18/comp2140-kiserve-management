package com.kiserve.kiserve.dto.auth;

public class RegisterRequest {
    private String email;
    private String password;
    private String userName;
    private String roleName; // optional: "ADMIN" or "USER"

    public RegisterRequest() {}
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
