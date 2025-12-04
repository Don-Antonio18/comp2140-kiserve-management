package com.kiserve.kiserve.security;

import com.kiserve.kiserve.dto.auth.AuthRequest;
import com.kiserve.kiserve.dto.auth.AuthResponse;
import com.kiserve.kiserve.dto.auth.RegisterRequest;
import com.kiserve.kiserve.models.Role;
import com.kiserve.kiserve.models.User;
import com.kiserve.kiserve.repositories.RoleRepository;
import com.kiserve.kiserve.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthenticationController(AuthenticationManager authManager,
                                    JwtService jwtService,
                                    UserRepository userRepo,
                                    RoleRepository roleRepo,
                                    BCryptPasswordEncoder passwordEncoder) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.findByEmail(req.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        User u = new User();
        u.setEmail(req.getEmail());
        u.setUserName(req.getUserName());
        u.setPassword(passwordEncoder.encode(req.getPassword()));

        Role role = null;
        if (req.getRoleName() != null) {
            role = roleRepo.findAll().stream()
                    .filter(r -> r.getRoleName().equalsIgnoreCase(req.getRoleName()))
                    .findFirst().orElse(null);
        }
        if (role == null) {
            // fallback: pick first role or null
            role = roleRepo.findAll().stream().findFirst().orElse(null);
        }
        u.setRole(role);

        userRepo.save(u);
        String token = jwtService.generateToken(u.getEmail());
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        String token = jwtService.generateToken(req.getEmail());
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
