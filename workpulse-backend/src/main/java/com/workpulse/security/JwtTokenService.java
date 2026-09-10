package com.workpulse.security;

import com.workpulse.entity.Employee;

import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtTokenService {

    private final JwtEncoder jwtEncoder;

    public JwtTokenService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateToken(Employee employee) {

        Instant now = Instant.now();

        String accountRole =
                employee.getAccountRole() == null
                        ? "EMPLOYEE"
                        : employee.getAccountRole()
                                .trim()
                                .toUpperCase();

        JwtClaimsSet claims =
                JwtClaimsSet.builder()
                        .issuer("workpulse")
                        .issuedAt(now)
                        .expiresAt(
                                now.plusSeconds(60 * 60 * 8)
                        )
                        .subject(
                                employee.getEmployeeCode()
                        )
                        .claim(
                                "email",
                                employee.getEmail()
                        )
                        .claim(
                                "name",
                                employee.getName()
                        )
                        .claim(
                                "role",
                                accountRole
                        )
                        .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(
                                claims
                        )
                )
                .getTokenValue();
    }
}