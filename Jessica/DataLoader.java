package com.kiserve.kiserve.config;

import com.kiserve.kiserve.models.Permission;
import com.kiserve.kiserve.models.Role;
import com.kiserve.kiserve.models.User;
import com.kiserve.kiserve.repositories.PermissionRepository;
import com.kiserve.kiserve.repositories.RoleRepository;
import com.kiserve.kiserve.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final PermissionRepository permRepo;
    private final UserRepository userRepo;
    private final BCryptPasswordEncoder encoder;

    public DataLoader(RoleRepository roleRepo, PermissionRepository permRepo, UserRepository userRepo, BCryptPasswordEncoder encoder) {
        this.roleRepo = roleRepo;
        this.permRepo = permRepo;
        this.userRepo = userRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if(roleRepo.count() == 0) {
            Permission p1 = new Permission(); p1.setPermissionName("ROLE_USER"); permRepo.save(p1);
            Permission p2 = new Permission(); p2.setPermissionName("ROLE_ADMIN"); permRepo.save(p2);

            Role userRole = new Role(); userRole.setRoleName("USER"); userRole.setPermissions(List.of(p1));
            Role adminRole = new Role(); adminRole.setRoleName("ADMIN"); adminRole.setPermissions(List.of(p1,p2));
            roleRepo.save(userRole);
            roleRepo.save(adminRole);
        }

        if(userRepo.count() == 0) {
            Role adminRole = roleRepo.findAll().stream().filter(r -> r.getRoleName().equals("ADMIN")).findFirst().orElse(null);
            User admin = new User();
            admin.setEmail("admin@kiserve.test");
            admin.setUserName("Admin");
            admin.setPassword(encoder.encode("Password123"));
            admin.setRole(adminRole);
            userRepo.save(admin);
        }
    }
}
