use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use anyhow::{Context, Result};
use base64::{engine::general_purpose::STANDARD, Engine};
use rand::RngCore;
use sha2::{Digest, Sha256};

/// Derive 256-bit encryption key from master password + static salt
pub fn derive_key(master_key: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(master_key.as_bytes());
    hasher.update(b"autocontent-pro-salt-v1");
    let result = hasher.finalize();
    let mut key = [0u8; 32];
    key.copy_from_slice(&result);
    key
}

/// Encrypt plaintext -> base64(nonce + ciphertext)
pub fn encrypt(plaintext: &str, master_key: &str) -> Result<String> {
    let key = derive_key(master_key);
    let cipher =
        Aes256Gcm::new_from_slice(&key).context("Invalid key length")?;

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;

    // Prepend nonce to ciphertext before base64 encoding
    let mut combined = nonce_bytes.to_vec();
    combined.extend_from_slice(&ciphertext);

    Ok(STANDARD.encode(&combined))
}

/// Decrypt base64(nonce + ciphertext) -> plaintext
pub fn decrypt(encrypted: &str, master_key: &str) -> Result<String> {
    let key = derive_key(master_key);
    let cipher =
        Aes256Gcm::new_from_slice(&key).context("Invalid key length")?;

    let combined = STANDARD.decode(encrypted).context("Invalid base64")?;

    if combined.len() < 12 {
        anyhow::bail!("Encrypted data too short");
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext).context("Invalid UTF-8 in decrypted data")
}

/// Generate device-specific master key from hostname
pub fn get_device_master_key() -> String {
    let hostname = hostname::get()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();
    format!("autocontent-{}-master", hostname)
}
