# HHC LASER — Fiserv / Scotiabank Test Payment Gateway Setup

This document explains how the **sandbox (test)** payment gateway was configured for HHC LASER certification against Scotiabank / Fiserv IPG.

---

## 1. Overview

| Item | Value |
|------|--------|
| Acquirer / gateway | Scotiabank → Fiserv International Payment Gateway (IPG) |
| Environment | **Sandbox / Test** |
| Integration style | Fiserv **Connect** hosted checkout (browser form POST) |
| Store ID | `81186299021` |
| Currency | USD (`840`) |
| Local frontend | `http://localhost:4200` |
| Local API | `http://localhost:3000` |
| Gateway URL | `https://test.ipg-online.com/connect/gateway/processing` |
| Virtual Terminal | [https://test.ipg-online.com/vt/login](https://test.ipg-online.com/vt/login) |

Customers never enter card data on HHC LASER pages. The site builds a signed form, posts it to Fiserv, and Fiserv hosts the card / 3-D Secure screens.

---

## 2. Credentials & environment variables

Configured in `backend/.env` (never commit secrets to git):

| Variable | Purpose | Test value / notes |
|----------|---------|-------------------|
| `FISERV_STORE_ID` | Merchant store ID (`storename` field) | `81186299021` |
| `FISERV_STORE_NAME` | Same as store ID (fallback) | `81186299021` |
| `FISERV_SHARED_SECRET` | HMAC key for `hashExtended` | Provided by Scotiabank (keep private) |
| `FISERV_CURRENCY` | ISO 4217 numeric | `840` (USD) |
| `FISERV_BASE_URL` | Test host | `https://test.ipg-online.com` |
| `FISERV_GATEWAY_URL` | Connect processing endpoint | `…/connect/gateway/processing` |
| `FISERV_SUCCESS_URL` | Browser return on approve | `http://localhost:3000/api/payments/success` |
| `FISERV_FAILURE_URL` | Browser return on decline | `http://localhost:3000/api/payments/error` |
| `FISERV_CALLBACK_URL` | Server notification URL | `http://localhost:3000/api/payments/callback` |
| `API_BASE_URL` | Backend base | `http://localhost:3000` |
| `FRONTEND_URL` | Angular app | `http://localhost:4200` |
| `ALLOWED_ORIGINS` | CORS allowlist | Includes `http://localhost:4200` |

**Important:** Only one `FISERV_SHARED_SECRET` line may exist in `.env`. Duplicate keys caused invalid hashes during setup (dotenv uses the first value).

---

## 3. Architecture / payment flow

```
[Home page test button]
        │
        │  POST /api/payments/generate-hash  { chargeTotal }
        ▼
[Express backend]
  • Builds Connect fields
  • Creates oid (UUID)
  • Computes hashExtended (HMAC-SHA256)
        │
        │  JSON → formFields + gatewayUrl
        ▼
[Angular checkout component]
  • Builds hidden HTML form
  • POST → test.ipg-online.com
        ▼
[Fiserv hosted page]
  • Card entry
  • 3-D Secure (Modirum ACS simulator)
        │
        ├── Approve ──► POST /api/payments/success
        │                    └── 303 → /payment/success?oid=…&approvalCode=…
        │
        └── Decline ──► POST /api/payments/error
                         └── 303 → /payment/failure?…
```

### Key code locations

| Piece | Path |
|-------|------|
| Hash + form builder (test path) | `backend/src/routes/payments.routes.ts` |
| HMAC helper | `backend/src/payments/fiserv/fiserv.crypto.ts` |
| Booking payment client (future path) | `backend/src/payments/fiserv/fiserv.client.ts` |
| Test buttons on home | `frontend/src/app/features/public/home/home.component.ts` |
| Form auto-submit | `frontend/src/app/shared/components/checkout/checkout.component.ts` |
| Result UI | `frontend/src/app/features/public/payment-result/payment-result.component.ts` |
| CORS (`Origin: null` for gateway returns) | `backend/src/server.ts` |

---

## 4. How `hashExtended` is built

Per Fiserv Connect / Scotiabank LATAM guidance:

1. Collect **all** outbound form fields **except** `hashExtended` itself (and never put the shared secret in the form).
2. Sort field **names** alphabetically.
3. Join field **values** with `|`.
4. Compute **HMAC-SHA256** using `FISERV_SHARED_SECRET`.
5. Encode the digest as **Base64** → that string is `hashExtended`.

Also send `hash_algorithm=HMACSHA256`.

### Fields posted for certification tests

| Field | Example / source |
|-------|------------------|
| `chargetotal` | `1.00`, `2.00`, or `8.99` |
| `checkoutoption` | `combinedpage` |
| `currency` | `840` |
| `hash_algorithm` | `HMACSHA256` |
| `oid` | Random UUID (Order ID shared with the bank) |
| `responseSuccessURL` | Local success endpoint |
| `responseFailURL` | Local error endpoint |
| `storename` | `81186299021` |
| `timezone` | `America/Jamaica` |
| `txndatetime` | `YYYY:MM:DD-HH:mm:ss` in Jamaica time |
| `txntype` | `sale` |
| `hashExtended` | Computed as above |

---

## 5. Local return URLs & CORS

Fiserv posts the browser back to the **API**, not directly to Angular:

- Success: `POST http://localhost:3000/api/payments/success`
- Failure: `POST http://localhost:3000/api/payments/error`

Those handlers:

1. Read `oid`, `approval_code`, amount, etc. from the body.
2. Log `[Fiserv SUCCESS]` / `[Fiserv DECLINE]`.
3. **303 redirect** to:
   - `http://localhost:4200/payment/success?…`
   - `http://localhost:4200/payment/failure?…`

### CORS note

3DS return posts often send header `Origin: null`. The API explicitly allows that origin string so the return is not rejected before redirect.

### Result page note

Query params use camelCase (`approvalCode`, `oid`). The result component accepts both camelCase and snake_case. Approval codes starting with `Y:` are treated as approved.

---

## 6. How to run the local test environment

```powershell
# Terminal 1 — API
cd HCC-LASER-3.0-master\backend
npm run dev

# Terminal 2 — frontend
cd HCC-LASER-3.0-master\frontend
npm start
```

Open **http://localhost:4200**. On the home page:

| Button | Amount | Purpose |
|--------|--------|---------|
| Test $1.00 Approve | `1.00` | Settlement / approve test |
| Test $2.00 Approve | `2.00` | Second approve test |
| Test $8.99 Decline | `8.99` | Expected expired-card decline |

---

## 7. Scotiabank certification test cards

| Scenario | Card | Brand | Notes |
|----------|------|-------|--------|
| Approve | `5204740000002745` | Mastercard | 3DS: enter **Secret33** if a password field appears; otherwise click **Yes** on the ACS simulator |
| Decline | `4004430000000007` | Visa | Amount must be exactly **$8.99**; expect `N:54-EXPIREDCARD` |

Expiry/CVV for sandbox: any future expiry and any CVV are typically accepted unless the scenario overrides them.

### 3-D Secure (3DS)

After card entry, the browser may open the Modirum ACS test page (`3ds-acs.test.modirum.com`). That page is the bank authentication simulator. Successful auth is required for approve tests.

---

## 8. Issues found during setup (and fixes)

| Issue | Cause | Fix |
|-------|--------|-----|
| Invalid hash / gateway reject | Duplicate `FISERV_SHARED_SECRET` in `.env`; hash only covered a subset of posted fields | Single secret; hash **all** outbound fields |
| Success URL returned JSON 500 | CORS blocked `Origin: null` from 3DS return | Allow `origin === 'null'` |
| Success page showed “Declined” | UI looked for `approval_code` but redirect sent `approvalCode` | Accept both param names; treat `Y:` as approved |
| Spanish hosted page | Store default language (LATAM) | Optional `language=en_US` was tried then reverted (can be re-enabled with bank confirmation) |
| $8.99 decline returned ECI-7 merchant block | Store rejects unauthenticated ECI-7 txs | Escalate to Scotiabank (not an app hash bug) |

---

## 9. Successful certification Order IDs (sandbox)

Recorded during Step 5 testing:

| Test | Order ID (`oid`) | Approval Code |
|------|------------------|---------------|
| $1.00 Approve | `85bc3cc8-143e-4160-b4c0-0ee88bcc707f` | `Y:OK9303:4666701416:PPXX:403279` |
| $2.00 Approve | `c334766f-9e97-4f03-86a5-c50ce475b3b3` | `Y:OK9463:4666701418:PPXX:403285` |

These Order IDs should also appear in the Test Virtual Terminal for Garfield Mitchell / bank certification.

---

## 10. Going live (not done yet)

When Scotiabank certifies the store:

1. Switch base/gateway URLs from `test.ipg-online.com` to production IPG hosts provided by the bank.
2. Replace store ID and shared secret with **live** credentials.
3. Point `FISERV_SUCCESS_URL` / `FISERV_FAILURE_URL` / `FISERV_CALLBACK_URL` at the public HTTPS API (not localhost).
4. Set production `FRONTEND_URL` and `ALLOWED_ORIGINS`.
5. Remove or hide home-page test payment buttons.
6. Wire the real booking checkout to the same Connect + callback flow so paid appointments are marked confirmed in the database.

---

## 11. Related bank follow-up

- Confirm approve Order IDs in VT.
- Configure Transaction Notifications (manual page 13).
- Resolve ECI-7 block so the `$8.99` / `N:54-EXPIREDCARD` decline test can complete.

---

*Document generated for HHC LASER 3.0 / Fiserv sandbox setup. Do not publish shared secrets.*
