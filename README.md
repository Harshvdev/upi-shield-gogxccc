# 🛡️ UPI-Shield — Zero-Trust UPI Scam & Psychological Manipulation Detection

> Detect UPI payment scams, nominal fee traps, and coercion before you authorize transactions. Powered by **Next.js 16**, **Bun**, **Google Gemini 3.8 Flash**, and a **Deterministic Risk Scoring Engine**.

---

## 🌟 Key Features

1. **Semantic Deceptive Trigger Identification**:
   - Analyzes social-engineering behaviors rather than simple keyword blacklists.
   - Evaluates 6 psychological indicators: Urgency, Authority Impersonation, Payment Demands, Coercion/Threats, Credential Solicitation, and Identity Impersonation.
2. **Deterministic Risk Policy Engine (0–100 Threat Score)**:
   - Application-controlled weighted mathematical scoring: Payment (25), Coercion (20), Authority (15), Sensitive Info (15), Impersonation (15), Urgency (10).
   - Enforces deterministic safety rules (e.g., Payment + Authority elevates to minimum 60 / HIGH threat).
3. **Bilingual Safety Cards (English & हिन्दी)**:
   - Simultaneous natural English and Hindi warnings with text-to-speech voice readouts.
   - 1-click **WhatsApp Safety Alert Share** to forward warnings to family members and senior citizens.
4. **Raw UPI Intent Parser (`upi://pay`) [Bonus Feature]**:
   - Decodes raw UPI deep links (`pa`, `pn`, `am`, `cu`, `tn`, `mc`).
   - Detects spoofed consumer VPAs (e.g. `refund.verify@paytm`) and nominal fee reversal traps (₹1 - ₹10).
5. **Multimodal Screenshot OCR [Bonus Feature]**:
   - Drag & drop or paste (`Ctrl+V`) mobile screenshots of suspicious SMS, WhatsApp chats, or payment popups.
   - Inspected directly by Gemini 3.8 Flash multimodal vision.
6. **Dedicated Scanner Route (`/analyze`)**:
   - Full-screen deep scanning mode supporting URL query parameters (`?text=...&source=...&scenario=...`).
7. **National Cyber Helpline 1930 Integration**:
   - Quick emergency dialer for the National Cyber Crime Reporting Portal (Golden Hour fund recovery).
   - "5 Golden Rules of UPI" interactive safety protocol.

---

## 🚀 Quick Start with Bun

This project is built and optimized for **[Bun](https://bun.sh)** (v1.3+).

### 1. Install Dependencies
```bash
bun install
```

### 2. Configure Environment Variables
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

Populate your API keys:
```env
# Primary AI Provider: Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Fallback AI Provider: Groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```

### 3. Run Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the test suite powered by Bun's native runner:
```bash
bun test
```

Run TypeScript compilation check:
```bash
bun run typecheck
```

Compile production build:
```bash
bun run build
```

---

## 📐 Architecture Overview

```text
Message / Screenshot / UPI URI
           │
           ▼
     Input Validator
           │
           ▼
   Gemini 3.8 Flash (Primary) ──(failover)──► Groq Qwen 3.8 27B
           │
           ▼
     Zod Output Guard
           │
           ▼
   Deterministic Risk Engine
  (Score: 0–100 | Safeguards)
           │
           ▼
  Threat Meter + Bilingual Safety Card
```

---

## 🔒 Privacy Guarantee
- **Zero Message Storage**: No user messages or uploaded screenshots are ever stored on disk, databases, or third-party servers.
- **Client-Sanitized**: All temporary preview URLs and form fields are cleared upon reset.
