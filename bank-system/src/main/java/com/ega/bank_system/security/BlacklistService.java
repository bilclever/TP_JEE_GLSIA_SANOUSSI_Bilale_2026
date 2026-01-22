package com.ega.bank_system.security;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Stocke les tokens JWT invalidés pour permettre une révocation immédiate.
 * Implémentation en mémoire : pour la prod, préférer Redis ou une table dédiée.
 */
@Service
public class BlacklistService {

    // token -> expiration epoch millis
    private final Map<String, Long> revokedTokens = new ConcurrentHashMap<>();

    /**
     * Ajoute un token à la blacklist jusqu'à son expiration.
     */
    public void revoke(String token, long expiresAtMillis) {
        revokedTokens.put(token, expiresAtMillis);
    }

    /**
     * Vérifie si le token est blacklisté.
     */
    public boolean isRevoked(String token) {
        Long exp = revokedTokens.get(token);
        if (exp == null) {
            return false;
        }
        if (exp < Instant.now().toEpochMilli()) {
            revokedTokens.remove(token);
            return false;
        }
        return true;
    }

    /**
     * Nettoyage périodique des tokens expirés pour limiter la mémoire.
     */
    @Scheduled(fixedDelay = 60_000)
    public void purgeExpired() {
        long now = Instant.now().toEpochMilli();
        revokedTokens.entrySet().removeIf(entry -> entry.getValue() < now);
    }
}

