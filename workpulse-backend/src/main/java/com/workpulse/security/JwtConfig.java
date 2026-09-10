package com.workpulse.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.Base64;

@Configuration
public class JwtConfig {

    @Value("${workpulse.jwt.key-directory:./keys}")
    private String keyDirectory;

    // =========================================================
    // RSA KEY PAIR
    // =========================================================

    @Bean
    public KeyPair rsaKeyPair() {

        try {

            Path directory =
                    Paths.get(keyDirectory);

            Files.createDirectories(directory);

            Path privateKeyFile =
                    directory.resolve("workpulse-private.key");

            Path publicKeyFile =
                    directory.resolve("workpulse-public.key");

            // -------------------------------------------------
            // If keys already exist → LOAD THEM
            // -------------------------------------------------

            if (
                    Files.exists(privateKeyFile)
                            && Files.exists(publicKeyFile)
            ) {

                byte[] privateKeyBytes =
                        Base64.getDecoder().decode(
                                Files.readString(privateKeyFile)
                                        .trim()
                        );

                byte[] publicKeyBytes =
                        Base64.getDecoder().decode(
                                Files.readString(publicKeyFile)
                                        .trim()
                        );

                KeyFactory keyFactory =
                        KeyFactory.getInstance("RSA");

                RSAPrivateKey privateKey =
                        (RSAPrivateKey)
                                keyFactory.generatePrivate(
                                        new PKCS8EncodedKeySpec(
                                                privateKeyBytes
                                        )
                                );

                RSAPublicKey publicKey =
                        (RSAPublicKey)
                                keyFactory.generatePublic(
                                        new X509EncodedKeySpec(
                                                publicKeyBytes
                                        )
                                );


                return new KeyPair(
                        publicKey,
                        privateKey
                );
            }

            // -------------------------------------------------
            // First startup → GENERATE NEW KEYS
            // -------------------------------------------------


            KeyPairGenerator keyPairGenerator =
                    KeyPairGenerator.getInstance("RSA");

            keyPairGenerator.initialize(2048);

            KeyPair keyPair =
                    keyPairGenerator.generateKeyPair();

            RSAPrivateKey privateKey =
                    (RSAPrivateKey)
                            keyPair.getPrivate();

            RSAPublicKey publicKey =
                    (RSAPublicKey)
                            keyPair.getPublic();

            // Save private key
            Files.writeString(
                    privateKeyFile,
                    Base64.getEncoder().encodeToString(
                            privateKey.getEncoded()
                    )
            );

            // Save public key
            Files.writeString(
                    publicKeyFile,
                    Base64.getEncoder().encodeToString(
                            publicKey.getEncoded()
                    )
            );

            return keyPair;

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to load or generate WorkPulse JWT keys.",
                    exception
            );
        }
    }

    // =========================================================
    // RSA JWK
    // =========================================================

    @Bean
    public RSAKey rsaJwk(KeyPair keyPair) {

        RSAPublicKey publicKey =
                (RSAPublicKey)
                        keyPair.getPublic();

        RSAPrivateKey privateKey =
                (RSAPrivateKey)
                        keyPair.getPrivate();

        return new RSAKey.Builder(publicKey)
                .privateKey(privateKey)
                .keyID("workpulse-key")
                .build();
    }

    // =========================================================
    // JWK SOURCE
    // =========================================================

    @Bean
    public JWKSource<SecurityContext> jwkSource(
            RSAKey rsaKey
    ) {

        JWKSet jwkSet =
                new JWKSet(rsaKey);

        return (selector, context) ->
                selector.select(jwkSet);
    }

    // =========================================================
    // JWT ENCODER
    // =========================================================

    @Bean
    public JwtEncoder jwtEncoder(
            JWKSource<SecurityContext> jwkSource
    ) {

        return new NimbusJwtEncoder(
                jwkSource
        );
    }

    // =========================================================
    // JWT DECODER
    // =========================================================

    @Bean
    public JwtDecoder jwtDecoder(
            KeyPair keyPair
    ) {

        RSAPublicKey publicKey =
                (RSAPublicKey)
                        keyPair.getPublic();

        return NimbusJwtDecoder
                .withPublicKey(publicKey)
                .build();
    }
}