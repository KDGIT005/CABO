package com.cabo.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Verifies Firebase ID tokens using Google's public certificates.
 * No Firebase Admin SDK or service account key required.
 */
@Component
public class FirebaseTokenVerifier {

    private static final String GOOGLE_CERTS_URL =
            "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

    @Value("${cabo.firebase.project-id}")
    private String projectId;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private volatile Map<String, PublicKey> publicKeys = new ConcurrentHashMap<>();
    private volatile long keysCacheExpiry = 0;

    /**
     * Verifies a Firebase ID token and returns the decoded payload claims.
     *
     * @param token the raw Firebase ID token (JWT)
     * @return a Map of claims (uid, email, etc.)
     * @throws Exception if the token is invalid, expired, or cannot be verified
     */
    public Map<String, Object> verifyIdToken(String token) throws Exception {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new Exception("Invalid token format");
        }

        // Decode header
        String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
        Map<String, Object> header = objectMapper.readValue(headerJson, new TypeReference<>() {});

        String kid = (String) header.get("kid");
        String alg = (String) header.get("alg");
        if (!"RS256".equals(alg)) {
            throw new Exception("Unsupported algorithm: " + alg);
        }
        if (kid == null || kid.isEmpty()) {
            throw new Exception("Missing key ID in token header");
        }

        // Get the public key for this kid
        refreshKeysIfNeeded();
        PublicKey publicKey = publicKeys.get(kid);
        if (publicKey == null) {
            // Key might have rotated — force refresh once
            refreshKeys();
            publicKey = publicKeys.get(kid);
            if (publicKey == null) {
                throw new Exception("Unknown key ID: " + kid);
            }
        }

        // Verify RSA signature
        Signature sig = Signature.getInstance("SHA256withRSA");
        sig.initVerify(publicKey);
        sig.update((parts[0] + "." + parts[1]).getBytes());
        byte[] signature = Base64.getUrlDecoder().decode(parts[2]);
        if (!sig.verify(signature)) {
            throw new Exception("Invalid token signature");
        }

        // Decode payload
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
        Map<String, Object> payload = objectMapper.readValue(payloadJson, new TypeReference<>() {});

        // Validate standard claims
        long now = System.currentTimeMillis() / 1000;

        String iss = (String) payload.get("iss");
        if (!("https://securetoken.google.com/" + projectId).equals(iss)) {
            throw new Exception("Invalid issuer: " + iss);
        }

        String aud = (String) payload.get("aud");
        if (!projectId.equals(aud)) {
            throw new Exception("Invalid audience: " + aud);
        }

        Number exp = (Number) payload.get("exp");
        if (exp == null || exp.longValue() < now) {
            throw new Exception("Token expired");
        }

        Number iat = (Number) payload.get("iat");
        if (iat == null || iat.longValue() > now + 300) { // 5 min clock skew tolerance
            throw new Exception("Token issued in the future");
        }

        String sub = (String) payload.get("sub");
        if (sub == null || sub.isEmpty()) {
            throw new Exception("Missing subject (uid)");
        }

        return payload;
    }

    /** Returns the uid from decoded token claims. */
    public String getUid(Map<String, Object> claims) {
        return (String) claims.get("sub");
    }

    /** Returns the email from decoded token claims (may be null). */
    public String getEmail(Map<String, Object> claims) {
        return (String) claims.get("email");
    }

    private void refreshKeysIfNeeded() throws Exception {
        if (System.currentTimeMillis() < keysCacheExpiry) return;
        refreshKeys();
    }

    private synchronized void refreshKeys() throws Exception {
        // Avoid redundant refresh if another thread just did it
        if (System.currentTimeMillis() < keysCacheExpiry) return;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GOOGLE_CERTS_URL))
                .GET()
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new Exception("Failed to fetch Google public keys: HTTP " + response.statusCode());
        }

        // Parse max-age from Cache-Control for cache expiry
        long maxAge = 3600; // default 1 hour
        String cacheControl = response.headers().firstValue("cache-control").orElse("");
        for (String directive : cacheControl.split(",")) {
            directive = directive.trim();
            if (directive.startsWith("max-age=")) {
                try {
                    maxAge = Long.parseLong(directive.substring(8));
                } catch (NumberFormatException ignored) {}
            }
        }
        keysCacheExpiry = System.currentTimeMillis() + (maxAge * 1000);

        // Parse certificates
        Map<String, String> certs = objectMapper.readValue(response.body(), new TypeReference<>() {});
        Map<String, PublicKey> newKeys = new ConcurrentHashMap<>();
        CertificateFactory cf = CertificateFactory.getInstance("X.509");

        for (Map.Entry<String, String> entry : certs.entrySet()) {
            X509Certificate cert = (X509Certificate) cf.generateCertificate(
                    new ByteArrayInputStream(entry.getValue().getBytes()));
            newKeys.put(entry.getKey(), cert.getPublicKey());
        }

        publicKeys = newKeys;
    }
}
