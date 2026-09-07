# 🛡️ UPI-Shield: Contextual Digital Payment Scam & Coercion Detector
### Problem Statement ID: `[CC-GFG-02]` | Career Catalyst Club × GeeksforGeeks 4-Hour Software Hackathon
> **Theme:** Fintech Security & NLP | **Track Difficulty:** Beginner / Open Track  
> **Core Philosophy:** *Working Prototype over Slide Decks* — Live execution, deterministic risk scoring, and zero-trust verification.

---

## 📌 Problem Summary & Real-World Context

In 2026, millions of digital payment users in India remain critically vulnerable to social-urgency deception and psychological manipulation (e.g., *"electricity power disconnection tonight"*, *"account freeze"*, or *"nominal ₹1 verification fee for refunds"*). 

Traditional security layers like **Two-Factor Authentication (2FA)** and **UPI PIN (MPIN)** fail fundamentally against social engineering because **the victim willingly enters their MPIN and authorizes the transaction under duress, fear, or false promises**. 

**UPI-Shield** is an automated, zero-trust pre-payment security layer that analyzes incoming messages (SMS, WhatsApp, Payment Notes, Raw UPI Intent Links, and Screenshots) to detect coercive patterns, psychological triggers, and spoofed authority claims before the user ever opens their payment app.

---

## 🌟 Key Deliverables & Features

### 1. Multi-Channel Ingestion Interface
- Ingests text from **SMS**, **WhatsApp**, **UPI Payment Notes**, and **Raw UPI Deep Links** (`upi://pay?pa=...`).
- Direct clipboard pasting with keyboard shortcuts (`Ctrl+Enter` to analyze).
- Interactive preset scenarios for instant demonstration.

### 2. Generalizable Behavioral NLP Engine (Not Plain String Matching)
- Strictly rejects trivial keyword checks (`if "pin" in text`) in favor of **semantic intent evaluation**.
- Evaluates 6 psychological and social-engineering triggers with confidence scores:
  - **Payment Demands / Token Traps**: Demanding money or nominal fee to "receive" funds.
  - **Coercion & Intimidation**: Threatening power disconnection, account freezes, or police action.
  - **Authority Impersonation**: Posing as SBI, RBI, Electricity Boards (BESCOM, TNEB, etc.), or NPCI.
  - **Credential Solicitation**: Soliciting PIN, OTP, or remote desktop sharing (AnyDesk, RustDesk).
  - **Persona Impersonation**: Pretending to be courier executives, customer care, or managers.
  - **Artificial Urgency**: Creating countdowns (*"within 10 minutes"*, *"tonight at 9:30 PM"*).

### 3. Application-Governed Deterministic Risk Engine (0–100 Threat Score)
- AI is used for semantic understanding, while **scoring is deterministic and controlled by application logic**:
  - Weight distribution: Payment Demand (25), Coercion (20), Authority (15), Credentials (15), Impersonation (15), Urgency (10).
- **Hard Guardrail Rules**:
  - **Rule 1 (Payment + Coercion)**: Elevates score to minimum **HIGH (65)**.
  - **Rule 2 (Payment + Authority)**: Elevates score to minimum **HIGH (60)**.
  - **Rule 3 (Credential Request + Impersonation)**: Elevates score to minimum **HIGH (60)**.
  - **Rule 4 (Direct PIN/OTP Solicitation)**: Elevates score to minimum **HIGH (60)**.
  - **Rule 5 (Verification Refund Trap / Nominal Fee)**: Mandates minimum **HIGH (70)** threat. *Receiving funds in UPI NEVER requires sending money or entering a PIN.*

### 4. Bilingual Safety Cards & Speech Synthesis (English + हिन्दी)
- Outputs actionable, jargon-free warnings in **English** and **Natural Idiomatic Hindi** (Devanagari script).
- Integrated **Web Speech API** text-to-speech synthesis (voice readout in English and Hindi for illiterate/elderly users).
- 1-Click **WhatsApp Safety Share** to quickly forward alerts to family members and elderly relatives.
- Direct quick-dial link to the **National Cyber Helpline `1930`** (Golden Hour fund recovery).

### 5. Bonus Feature 1: Raw UPI Intent String Parser (`upi://pay`)
- Deep-links compliant with NPCI UPI 1.6 specifications.
- Parses `pa` (VPA), `pn` (Payee Name), `am` (Amount), `cu` (Currency), `tn` (Transaction Note), and `mc` (Merchant Code).
- **Heuristics & Anti-Spoofing**:
  - Catches consumer handles pretending to be official desks (e.g., `refund.verify@paytm`, `electricity.desk@ybl`).
  - Flags nominal amount reversal traps (`am <= 10.00`).
  - Detects institutional names assigned to personal PSP domains.

### 6. Bonus Feature 2: Multimodal Screenshot OCR & Visual Inspection
- Drag-and-drop or paste (`Ctrl+V`) mobile screenshots of suspicious SMS, WhatsApp chats, or payment popups.
- Examined directly by **Gemini 3.8 Flash Multimodal Vision** to detect fake bank logos, deceptive collect modals, and extracted text artifacts.
- Visual badge verification rendered directly on the verdict slip.

---

## 🏛️ System Architecture

```text
       Incoming User Artifacts (SMS / WhatsApp / Payment Note / UPI URI / Screenshot)
                                      │
                                      ▼
                        Input Validation Guard (Zod)
                                      │
                 ┌────────────────────┴──────────────────┐
                 │                                       │
        [Raw UPI Intent?]                       [Screenshot Attached?]
                 │                                       │
        Extract URI Parameters                  Multimodal Vision / OCR
     (VPA, Payee, Amount, Note)                 (Visual Cues & Text)
                 │                                       │
                 └────────────────────┬──────────────────┘
                                      ▼
                     Dual-Provider AI Semantic Engine
              Primary: Google Gemini 3.8 Flash (Low Latency)
                       │ (Automatic Failover on quota/error)
              Fallback: Groq Qwen 3.8 27B (Ultra-fast LLM)
                                      │
                                      ▼
                        Zod Output Schema Enforcement
                   (6 Triggers, Confidences, Evidence)
                                      │
                                      ▼
                      Deterministic Risk Policy Engine
                     (Weighted Sum + 5 Safety Overrides)
                                      │
                                      ▼
                Final Verdict: Threat Score (0–100) & Risk Level
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
  Physical Bank Slip          Bilingual Advisory           Action Center
   (Threat Meter Stamp)      (English + हिन्दी Audio)     (WhatsApp / 1930)
```

---

## 📦 Libraries, Models, and Public Datasets Utilized

As required by Hackathon Document 2 (Section 5):

| Category | Technology / Model / Resource | Purpose |
| :--- | :--- | :--- |
| **Runtime & Bundler** | **[Bun](https://bun.sh) v1.3+** | Ultra-fast JavaScript/TypeScript runtime, package manager, and test runner. |
| **Framework** | **Next.js 16 (App Router)** | Modern full-stack React framework with serverless edge API routes. |
| **Primary AI Model** | **Google Gemini 3.8 Flash** (`@google/genai`) | Free-tier multimodal foundation model for deep intent reasoning and visual screenshot OCR. |
| **Fallback AI Model**| **Groq Qwen 3.8 27B** (`groq-sdk`) | Sub-second LPUs for instantaneous semantic trigger classification failover. |
| **Data Validation** | **Zod v4** | Strict bidirectional schema enforcement for both incoming payloads and LLM outputs. |
| **Speech APIs** | **HTML5 Web Speech API** | Browser-native bilingual text-to-speech (en-US, hi-IN) without external proprietary audio costs. |
| **Styling & UI** | **Tailwind CSS v4 & Lucide Icons** | High-density Indian banking counter & physical certificate design system. |
| **Standards & Data** | **NPCI UPI 1.6 Linking Specs** | Public UPI intent specification and PSP handle whitelist for anomaly detection. |

---

## ⚡ Quick Start & Installation Instructions

This project is built and optimized for **[Bun](https://bun.sh)**.

### 1. Prerequisites
Ensure you have Bun installed:
```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Clone and Install Dependencies
```bash
git clone https://github.com/Harshvdev/upi-shield-cccxgog.git
cd upi-shield-cccxgog
bun install
```

### 3. Environment Variables Setup
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

Add your free-tier API keys:
```env
# Primary AI Provider: Google Gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash

# Fallback AI Provider: Groq
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b
```
*(The system automatically fails over between providers if one encounters rate limits).*

### 4. Run Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🧪 Automated Testing & Code Verification

Run the comprehensive unit test suite:
```bash
bun test
```
*Executes deterministic risk engine boundary tests, weight validations, and raw UPI intent spoof detection tests.*

Run TypeScript type check:
```bash
bun run typecheck
```

Build production bundle:
```bash
bun run build
```

---

## ⏱️ Official 60–90 Second Live Demo Script (For Presenters)

According to Hackathon Document 1 & 2 Pitch Regulations:

1. **Step 1 (0:00 - 0:25) — Problem & Verification Refund Trap**:
   - Click preset scenario **"Verification Refund Scam"** (`Your refund of ₹4,999 is pending. For verification, send ₹1 within 10 mins...`).
   - Click **"Check message"**.
   - **Show Result**: Live stamped verdict **HIGH THREAT (70)**, explaining the core Golden Rule: *You never have to pay money or enter your PIN to receive a refund.*
   - Click **"Listen"** to demonstrate the Hindi voice readout.

2. **Step 2 (0:25 - 0:50) — Bonus Feature 1: Raw UPI Deep Link Parser**:
   - Click preset **"Raw UPI Intent Refund Trap"** (`upi://pay?pa=refund.verification@paytm&am=1.00...`).
   - Highlight the **Raw UPI Intent Slip** displaying the decoded VPA, the suspicious personal `@paytm` handle posing as an official desk, and the nominal ₹1 trap.

3. **Step 3 (0:50 - 1:15) — Legitimate Contrast & Non-Trivial NLP**:
   - Click preset **"Legitimate Utility Bill"** (`Electricity bill of ₹850 is due on 15 Sept. Use bescom.karnataka.gov.in...`).
   - Click **"Check message"**.
   - **Show Result**: **SAFE (10 / LOW RISK)**. Highlight to judges: *Notice it mentions "electricity" and "bill", but the NLP engine correctly recognizes zero coercive or fraudulent intent!*

4. **Step 4 (1:15 - 1:30) — Emergency Golden Hour Protocol**:
   - Point out the **1930 Cyber Helpline quick-dial** and the **1-Click WhatsApp Family Alert Share**.

---

## 🔒 Privacy & Responsible AI Safeguards
- **Zero Data Logging**: User messages and images are analyzed strictly in-memory; no customer data is persisted to disk or databases.
- **Ethical Disclaimer**: UPI-Shield operates as an informational advisory companion and does not store credentials, process financial transactions, or access private banking accounts.

