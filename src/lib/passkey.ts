// Passkey / WebAuthn Integration
// Uses @simplewebauthn/browser for Passkey creation and authentication

import type { PasskeyCredential } from '@/types'

// We use the WebAuthn API directly for simplicity in a demo context
// In production, this would use @simplewebauthn/browser with a proper server-side challenge

const PASSKEY_RP_ID = window.location.hostname
const PASSKEY_RP_NAME = 'Sovereign Hub'

export async function createPasskey(username: string): Promise<PasskeyCredential | null> {
  try {
    const challenge = generateChallenge()
    const userId = crypto.getRandomValues(new Uint8Array(32))

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: PASSKEY_RP_NAME,
          id: PASSKEY_RP_ID,
        },
        user: {
          id: userId,
          name: username,
          displayName: username,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'required',
        },
        timeout: 60000,
        attestation: 'none',
      },
    }) as PublicKeyCredential

    if (!credential) return null

    const publicKey = arrayBufferToBase64(credential.response)
    return {
      id: credential.id,
      publicKey,
      counter: 0,
      createdAt: Date.now(),
    }
  } catch (error) {
    console.error('Passkey creation failed:', error)
    return null
  }
}

export async function authenticatePasskey(credentialId?: string): Promise<boolean> {
  try {
    const challenge = generateChallenge()

    const allowCredentials: PublicKeyCredentialDescriptor[] = credentialId
      ? [{ id: base64ToArrayBuffer(credentialId), type: 'public-key' }]
      : []

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: PASSKEY_RP_ID,
        allowCredentials,
        userVerification: 'required',
        timeout: 60000,
      },
    })

    return !!assertion
  } catch (error) {
    console.error('Passkey authentication failed:', error)
    return false
  }
}

export function isPasskeySupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

function generateChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32))
}

function arrayBufferToBase64(response: AuthenticatorResponse): string {
  const attResponse = response as AuthenticatorAttestationResponse
  const buffer = attResponse.getPublicKey ? (attResponse.getPublicKey() || new ArrayBuffer(0)) : new ArrayBuffer(0)
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}
