# Security Specification: DeliSign Ecosystem

## Data Invariants
1. **Uniqueness**: Screen IDs and Store IDs must be valid strings.
2. **Bounds**: Coordinates (x, y) must be percentages between 0 and 100.
3. **Immutability**: Store IDs and Screen IDs cannot be changed via update.
4. **Ownership**: Only the verified admin (`itsuppdpm@gmail.com`) can perform writes.

## The Dirty Dozen Payloads (Rejection Expected)
1. **Unauthenticated Write**: Attempt to create a store without auth.
2. **False Admin**: Attempt to write with a different email.
3. **Unverified Email**: Attempt to write with `email_verified: false`.
4. **Invalid Coordinates**: `x: 105` (out of percentage bounds).
5. **Giant Payload**: `name` string > 1MB.
6. **Shadow Field Injection**: Adding `isVerified: true` to a store document.
7. **Type Mismatch**: `priceLabel: 123` (expected string).
8. **Malicious ID**: `stores/../malicious` (checking `isValidId` patterns).
9. **Orphaned Writes**: (Handled by app logic, but rules ensure path integrity).
10. **State Skipping**: (Not applicable as there is no status workflow currently, but will add terminal locking if needed).
11. **Denial of Wallet**: Large batch of nested reads (handled by `allow read: if true` but restricted pathing).
12. **PII Leak**: (No PII except store names/menu items).

## Test Runner (Logic Check)
The rules will be verified against these constraints. Valid store/screen/category/item creation is restricted to the specific admin user.
