# SuiAge
## Project Description
SuiAge is a zero-knowledge (ZK) age verification protocol built on the Sui blockchain.

It allows users to prove that they are above a certain age threshold (e.g., 18+) without revealing their actual birthdate or any personal information.

By extracting the user's birth year from an identity document (such as Indonesia’s KTP), a zk-SNARK proof is generated off-chain and verified on-chain. This enables trustless and privacy-preserving access control for age-restricted content in dApps, games, and DeFi applications.

## SuiAgeNFT Integration

Once a user is verified, they can mint an NFT as proof of their verified age status using the companion NFT project:

👉 [SuiAgeNFT GitHub Repository](https://github.com/Iqbalfachry19/SuiAgeNFT)

This NFT acts as a credential on-chain, signaling that the user has passed the age verification check.
## Tech Stack
- [React](https://react.dev/) as the UI framework
- [TypeScript](https://www.typescriptlang.org/) for type checking
- [Vite](https://vitejs.dev/) for build tooling
- [Radix UI](https://www.radix-ui.com/) for pre-built UI components
- [ESLint](https://eslint.org/)
- [`@mysten/dapp-kit`](https://sdk.mystenlabs.com/dapp-kit) for connecting to
  wallets and loading data
- [pnpm](https://pnpm.io/) for package management

## Starting dapp

To install dependencies you can run

```bash
pnpm install
```

To start your dApp in development mode run

```bash
pnpm dev
```

## Building

To build your app for deployment you can run

```bash
pnpm build
```

