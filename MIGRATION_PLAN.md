# Algokit-Lora: Decoupling from algosdk Migration Plan

## Overview

This plan outlines the steps to decouple algokit-lora from direct algosdk dependency by migrating to algokit-utils-ts alpha (v10.0.0-alpha.7) and algokit-subscriber-ts (v1.0.0).

**Initial state:** 278 type errors across 67 files
**Current state:** 46 test file errors (0 non-test errors!) - down from 278

## Progress Summary

### Completed

- [x] Re-install algosdk for wallet compatibility
- [x] Create transaction conversion utility (`src/features/wallet/utils/transaction-converter.ts`)
- [x] Fix all module imports (app-arc56 → abi) - 29 files
- [x] Remove `.do()` calls from src files - 18 files
- [x] Fix property name changes (camelCase)
- [x] Fix OnApplicationComplete enum (algosdk uses `*OC` suffix, algokit-utils doesn't)
- [x] Fix `populateAppCallResources` to use new API
- [x] Fix Transaction property names (`applicationCall` → `appCall`, etc.)
- [x] Update `AssetFreezeParams.account` → `freezeTarget`
- [x] Fix Transaction type mismatches in `as-algosdk-transactions.ts`
- [x] Fix `makeEmptyTransactionSigner` to use algokit-utils
- [x] Fix Address type conflicts (`ReadableAddress`, `SendingAddress`)
- [x] Fix `SimulateResponse` type to use algokit-utils type
- [x] Fix indexer/subscriber transaction mapper type casts
- [x] Fix `KmdClient` API changes (request objects, method names)
- [x] Fix `send-transaction-result.ts` types and `txId()` method call
- [x] Fix `SubscribedTransaction` to `TransactionResult` conversion in `latest-blocks.ts`
- [x] Fix `TealKeyValue`/`TealValue` types in `applications/mappers/index.ts`
- [x] Fix `ABIType` conversions using `.toString()` and `ABIType.from()` pattern
- [x] Update `ABITypeTemplateParam` to use algokit-utils `ABIType`/`ABIValue`
- [x] Fix `state-delta-mappers.ts` to use algokit-utils `ABIType`
- [x] Fix `AlgorandFixture` → `ReturnType<typeof algorandFixture>` in test utility

### Remaining Work (46 test file errors)

All source file errors are fixed! Only test file errors remain:

#### Test File Patterns to Fix:
- `.do()` calls in mocks - remove `.do()` since new API returns promises directly
- Old property names in assertions (e.g., `getApplicationByID` → `getApplicationById`)
- Old type expectations (e.g., `AlgorandFixture` → `ReturnType<typeof algorandFixture>`)
- `OnApplicationComplete.OptInOC` → `OnApplicationComplete.OptIn`
- Method name changes: `lookupApplications` → `lookupApplicationById`
- Property access patterns in mocks (e.g., `.applicationID()` → direct promise)

### Test File Errors (~46 errors)

Test files have old API patterns:
- `.do()` calls in mocks
- Old property names in assertions
- Old type expectations
- `AlgorandFixture` should be `algorandFixture` (function, not type)

## Key Conversions Reference

### Transaction Signer Conversion
```typescript
import { wrapAlgosdkSigner, wrapUtilsSigner } from '@/features/wallet/utils/transaction-converter'

// algosdk signer → utils signer
const utilsSigner = wrapAlgosdkSigner(algosdkSigner)

// utils signer → algosdk signer
const algosdkSigner = wrapUtilsSigner(utilsSigner)
```

### OnApplicationComplete Enum
```typescript
// Import from algokit-utils, not algosdk
import { OnApplicationComplete } from '@algorandfoundation/algokit-utils/transact'

// Old (algosdk):     OnApplicationComplete.NoOpOC
// New (algokit-utils): OnApplicationComplete.NoOp
```

### ABIMethod/ABIType
```typescript
// Import from algokit-utils, not algosdk
import { ABIMethod, ABIType } from '@algorandfoundation/algokit-utils/abi'

// Create method from signature
ABIMethod.fromSignature('method_name(uint64)uint64')
```

### Address Types
```typescript
// Import ReadableAddress from algokit-utils
import { ReadableAddress, getAddress } from '@algorandfoundation/algokit-utils'

// Convert ReadableAddress to string
const addressString = getAddress(address).toString()
```

### SimulateResponse
```typescript
// Import from algokit-utils, not algosdk
import { SimulateResponse } from '@algorandfoundation/algokit-utils/algod-client'
```

### KMD Client API
```typescript
// Old API (algosdk)
await kmd.createWallet(name, password)
await kmd.initWalletHandle(id, password)
await kmd.generateKey(handle)
await kmd.releaseWalletHandle(handle)

// New API (algokit-utils)
await kmd.createWallet({ walletName: name, walletPassword: password })
await kmd.initWalletHandle({ walletId: id, walletPassword: password })
await kmd.generateKey({ walletHandleToken: handle })
await kmd.releaseWalletHandleToken({ walletHandleToken: handle })
```

## Files Modified in This Session

### Type Updates
- `src/features/accounts/components/address-or-nfd-link.tsx` - Added ReadableAddress type
- `src/features/transaction-wizard/mappers/as-description-list-items.tsx` - Updated address types
- `src/features/transaction-wizard/components/group-send-results.tsx` - SimulateResponse type
- `src/features/transaction-wizard/transaction-wizard-page.tsx` - SimulateResponse type
- `src/features/transaction-wizard/data/common.ts` - makeEmptyTransactionSigner
- `src/features/transaction-wizard/components/method-call-transaction-builder.tsx` - OnApplicationComplete
- `src/features/transactions/mappers/indexer-transaction-mappers.ts` - Type casts
- `src/features/transactions/mappers/subscriber-transaction-mappers.ts` - Type casts
- `src/features/blocks/data/latest-blocks.ts` - Use converted transaction instead of raw
- `src/features/fund/utils/kmd.ts` - New KMD API
- `src/features/transactions/data/send-transaction-result.ts` - New types and txId()
- `src/features/assets/data/circulating-supply.ts` - ABIMethod from algokit-utils
- `src/features/abi-methods/mappers/index.ts` - ABIType from algokit-utils
- `src/features/abi-methods/models/index.ts` - ABIType from algokit-utils
- `src/features/app-interfaces/models/index.ts` - ABIType from algokit-utils
- `src/features/app-interfaces/utils/is-avm-type.ts` - ABIType from algokit-utils
- `src/features/applications/mappers/index.ts` - TealKeyValue types

## Next Steps

1. **Fix remaining ABIType structural differences** by:
   - Updating code that uses `abiType.name` or `abiType.displayName` to use `.toString()` instead
   - Adding type assertions where needed

2. **Fix remaining TealKeyValue/TealValue conflicts** by:
   - Completing the type migration in `applications/mappers/index.ts`
   - Updating all functions that use these types

3. **Update test files** to use new API patterns

4. **Consider refactoring** internal types to use algokit-utils types natively instead of algosdk types
