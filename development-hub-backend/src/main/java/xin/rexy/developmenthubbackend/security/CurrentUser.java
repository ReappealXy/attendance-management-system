package xin.rexy.developmenthubbackend.security;

public record CurrentUser(
        Long id,
        String username,
        String name,
        String role,
        String department
) {

    public boolean isAdmin() {
        return "admin".equals(role) || "super_admin".equals(role);
    }

    public boolean isSuperAdmin() {
        return "super_admin".equals(role);
    }
}
