import { ethers } from 'ethers'
import { SEPOLIA_CONFIG } from '@/types'

let provider: ethers.JsonRpcProvider | null = null

export function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(SEPOLIA_CONFIG.rpcUrl)
  }
  return provider
}

export function createWalletFromMnemonic(mnemonic: string): ethers.HDNodeWallet {
  return ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(mnemonic))
}

export function createRandomWallet(): { wallet: ethers.HDNodeWallet; mnemonic: string } {
  const mnemonicPhrase = ethers.Mnemonic.entropyToPhrase(ethers.randomBytes(16))
  const mnemonicObj = ethers.Mnemonic.fromPhrase(mnemonicPhrase)
  const wallet = ethers.HDNodeWallet.fromMnemonic(mnemonicObj)
  return { wallet, mnemonic: mnemonicPhrase }
}

export function importWalletFromPrivateKey(privateKey: string): ethers.Wallet {
  return new ethers.Wallet(privateKey)
}

export async function getBalance(address: string): Promise<string> {
  const prov = getProvider()
  const balance = await prov.getBalance(address)
  return ethers.formatEther(balance)
}

export async function sendTransaction(
  wallet: ethers.Wallet,
  to: string,
  value: string
): Promise<ethers.TransactionResponse> {
  const connectedWallet = wallet.connect(getProvider())
  const tx = await connectedWallet.sendTransaction({
    to,
    value: ethers.parseEther(value),
  })
  return tx
}

export async function estimateGas(to: string, value: string): Promise<string> {
  const prov = getProvider()
  const gasEstimate = await prov.estimateGas({
    to,
    value: ethers.parseEther(value),
  })
  const feeData = await prov.getFeeData()
  const gasCost = gasEstimate * (feeData.gasPrice || 0n)
  return ethers.formatEther(gasCost)
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
  return `${SEPOLIA_CONFIG.blockExplorer}/${type}/${hash}`
}

export function validateMnemonic(mnemonic: string): boolean {
  try {
    ethers.Mnemonic.fromPhrase(mnemonic)
    return true
  } catch {
    return false
  }
}

export function validatePrivateKey(key: string): boolean {
  try {
    new ethers.Wallet(key)
    return true
  } catch {
    return false
  }
}

export function parseEtherValue(value: string): bigint {
  return ethers.parseEther(value)
}

export function formatEtherValue(value: bigint): string {
  return ethers.formatEther(value)
}
