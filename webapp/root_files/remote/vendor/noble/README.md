Published builds of the noble libraries, copied unchanged: only the files the remote client's Noise implementation
(`../../noise.js`) uses and the files they import, with each package's LICENSE. Don't edit or minify them.
`../../index.html` maps `@noble/curves/`, `@noble/ciphers/` and `@noble/hashes/` here with an import map.

- @noble/curves 2.4.0 (x25519)
- @noble/ciphers 2.4.0 (ChaCha20-Poly1305)
- @noble/hashes 2.4.0 (BLAKE2s, HMAC)

To update, `npm pack` each package and copy the same files from its `package/` folder.
