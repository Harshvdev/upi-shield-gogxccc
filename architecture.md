
# UPI-Shield — Detailed Technical Architecture

## 1. Technology Stack

### Frontend

* **Next.js 16** (Turbopack, App Router, React 19)
* **TypeScript**
* **Tailwind CSS v4**
* **shadcn/ui & Lucide Icons**
* **Bun v1.3+** (High-performance JavaScript runtime, package manager & native test runner)
* React state for zero-dependency client UI state
* No external frontend state-management library


### Backend

* **Next.js Route Handlers**
* Same Next.js application contains both frontend and backend
* No separate FastAPI server

### AI / NLP

**Primary**

* Google Gemini API
* Model: `gemini-3.8-flash`

**Fallback**

* Groq API
* Model: `qwen/qwen3.8-27b`

Both providers produce the same application-level JSON schema, so the rest of the system does not care which model generated the analysis.

Gemini supports schema-constrained structured output, including Zod schemas for JavaScript/TypeScript applications.

### Validation

* **Zod**
* Validate user input
* Validate model output
* Reject malformed or unsafe response structures

### Deployment

* **Vercel**
* GitHub repository
* Environment variables for API keys

### Storage

**None for the MVP.**

The application does not need:

* PostgreSQL
* Firebase
* MongoDB
* Redis
* Vector database
* Authentication

The competition specification does not require a database or accounts.

---

# 2. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │                      │
                         │ SMS / WhatsApp /     │
                         │ Payment Note input   │
                         └──────────┬───────────┘
                                    │
                                    │ POST /api/analyze
                                    ▼
                    ┌──────────────────────────────┐
                    │       Next.js Backend        │
                    │                              │
                    │  1. Input validation         │
                    │  2. Request throttling       │
                    │  3. Provider selection       │
                    └──────────────┬───────────────┘
                                   │
                     ┌─────────────┴─────────────┐
                     │                           │
                     ▼                           ▼
            ┌──────────────────┐       ┌──────────────────┐
            │   Gemini 3.8     │       │ Qwen 3.8 27B     │
            │     Flash        │       │     via Groq     │
            │    PRIMARY       │       │     FALLBACK     │
            └────────┬─────────┘       └────────┬─────────┘
                     │                          │
                     └──────────┬───────────────┘
                                ▼
                       ┌─────────────────┐
                       │  Zod Validator  │
                       │                 │
                       │ Validate AI     │
                       │ response       │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Risk Engine   │
                       │                 │
                       │ Deterministic   │
                       │ Threat Score    │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Analysis Result │
                       │      DTO        │
                       └────────┬────────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │       Next.js UI       │
                    │                        │
                    │ HIGH RISK              │
                    │ 87 / 100               │
                    │                        │
                    │ Why?                   │
                    │ • Urgency              │
                    │ • Fake authority       │
                    │ • Payment request      │
                    │                        │
                    │ English warning       │
                    │ Hindi warning         │
                    └────────────────────────┘
```

---

# 3. Core Design Principle

The most important architectural decision is:

> **The AI identifies semantic signals. Your application calculates the final risk score.**

Do **not** ask Gemini:

```text
"Give me a risk score from 0-100."
```

and blindly display that number.

Instead:

```text
Gemini
   ↓
Identifies scam characteristics
   ↓
Your deterministic scoring engine
   ↓
Final score
```

This makes the system more explainable and easier to defend during judging.

The organizers specifically care about correct deceptive-trigger identification and explanation clarity rather than a simple `SCAM = TRUE` output.

---

# 4. Input Layer

The interface should support three input modes because those are explicitly required:

```text
SMS
WhatsApp
Payment Note
```

The user does not need to connect an actual SMS or WhatsApp account.

The competition specification only requires an interface capable of ingesting that content.

## UI

```text
┌──────────────────────────────────────────────┐
│ UPI-SHIELD                                   │
│ Detect payment scams before you pay          │
│                                              │
│  [ SMS ] [ WhatsApp ] [ Payment Note ]       │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Paste suspicious message here...         │ │
│ │                                          │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│           [ Analyze Message ]                │
└──────────────────────────────────────────────┘
```

Also provide demo examples:

```text
Verification Refund
Electricity Disconnection
Fake Bank Authority
UPI KYC Expiry
Prize / Cashback
```

This makes the live demonstration much faster.

---

# 5. Request Contract

The browser sends:

```ts
{
  text: string;
  source: "sms" | "whatsapp" | "payment_note";
}
```

Example:

```json
{
  "source": "sms",
  "text": "Your refund verification failed. Pay ₹1 now to receive your refund."
}
```

The API validates:

* text exists
* text is not empty
* maximum length
* source is one of the allowed values

Example maximum:

```text
4,000 characters
```

There is no reason for a normal SMS/WhatsApp message to require a huge context window.

---

# 6. Backend API

Use a single endpoint:

```text
POST /api/analyze
```

### Request

```json
{
  "text": "...",
  "source": "whatsapp"
}
```

### Response

```json
{
  "riskLevel": "HIGH",
  "riskScore": 87,
  "scamDetected": true,
  "triggers": {
    "urgency": true,
    "authorityImpersonation": false,
    "paymentRequest": true,
    "coercion": true,
    "sensitiveInfoRequest": false,
    "impersonation": true
  },
  "evidence": [
    "Requests immediate payment",
    "Uses refund verification as justification",
    "Creates pressure to act immediately"
  ],
  "scamType": "refund_verification",
  "englishWarning": "...",
  "hindiWarning": "...",
  "recommendedAction": "Do not make the payment."
}
```

---

# 7. AI Provider Abstraction

Do not put Gemini calls directly inside `/api/analyze`.

Create a provider abstraction.

```text
AIProvider
   │
   ├── GeminiProvider
   │
   └── GroqProvider
```

Interface:

```ts
interface ScamAnalysisProvider {
  analyze(input: ScamAnalysisInput): Promise<ScamAnalysis>;
}
```

Then:

```text
provider = GeminiProvider
```

normally.

If Gemini fails:

```text
Gemini
  │
  ├── success → continue
  │
  └── failure
        ↓
      Groq
        ↓
   Qwen 3.8 27B
```

This is much cleaner than scattering fallback code throughout the application.

---

# 8. When to Trigger the Fallback

The Qwen fallback should activate for:

```text
HTTP 429
HTTP 500
HTTP 502
HTTP 503
Timeout
Network error
Provider unavailable
Invalid model output after retry
```

Do **not** fallback for normal user errors such as:

```text
Empty message
Message too long
Invalid request
```

Those are application errors and should return directly.

---

# 9. Provider Flow

## Normal request

```text
POST /api/analyze
        │
        ▼
Validate input
        │
        ▼
Gemini 3.8 Flash
        │
        ▼
Validate structured response
        │
        ▼
Risk Engine
        │
        ▼
Return result
```

## Gemini failure

```text
POST /api/analyze
        │
        ▼
Validate input
        │
        ▼
Gemini 3.8 Flash
        │
        X
        │
        ▼
Fallback handler
        │
        ▼
Groq Qwen 3.8 27B
        │
        ▼
Validate structured response
        │
        ▼
Risk Engine
        │
        ▼
Return result
```

Groq currently lists Qwen 3.8 27B as supporting JSON object and JSON schema modes, which makes it suitable as a drop-in structured-output fallback.

---

# 10. AI Output Schema

The model should never return arbitrary prose as the primary API contract.

Use Zod:

```ts
const ScamAnalysisSchema = z.object({
  scamDetected: z.boolean(),

  triggers: z.object({
    urgency: z.boolean(),
    authorityImpersonation: z.boolean(),
    paymentRequest: z.boolean(),
    coercion: z.boolean(),
    sensitiveInfoRequest: z.boolean(),
    impersonation: z.boolean()
  }),

  confidence: z.object({
    urgency: z.number().min(0).max(1),
    authorityImpersonation: z.number().min(0).max(1),
    paymentRequest: z.number().min(0).max(1),
    coercion: z.number().min(0).max(1),
    sensitiveInfoRequest: z.number().min(0).max(1),
    impersonation: z.number().min(0).max(1)
  }),

  evidence: z.array(z.string()).max(5),

  scamType: z.enum([
    "payment_request",
    "refund_verification",
    "fake_authority",
    "account_threat",
    "credential_theft",
    "impersonation",
    "other",
    "none"
  ]),

  englishWarning: z.string(),
  hindiWarning: z.string(),

  recommendedAction: z.string()
});
```

Gemini's structured-output system is explicitly designed for this type of structured classification/extraction workflow, and Google recommends validating the returned values in your own application even when schema-constrained output is used.

---

# 11. What Gemini Actually Does

Give Gemini a carefully designed system prompt.

Its job is to determine whether the message contains **social-engineering characteristics**, not merely suspicious words.

It should analyze:

### Urgency

Examples:

```text
Pay immediately
within 10 minutes
today only
your account will be blocked
```

### Authority impersonation

Examples:

```text
RBI
bank manager
electricity department
police
government officer
```

### Payment request

Examples:

```text
send ₹500
pay verification fee
make a UPI payment
scan this QR
```

### Coercion / threat

Examples:

```text
account will be closed
legal action
electricity disconnected
police complaint
```

### Sensitive information request

Examples:

```text
UPI PIN
OTP
CVV
bank password
card details
```

### Impersonation

Examples:

```text
"I'm your bank manager"
"This is customer support"
"I'm from the government"
```

The key instruction should be:

```text
Determine the underlying intent and social-engineering behavior.

Do not classify a message as fraudulent merely because it contains words
such as "OTP", "PIN", "urgent", "refund", or "bank".

Consider the relationship between the claims, requested action,
urgency, authority, threats, and requested financial/sensitive information.
```

That directly avoids the trivial keyword-matching approach the organizers reject.

---

# 12. Evidence Extraction

For every detected trigger, Gemini should produce concise evidence.

Example:

```json
{
  "paymentRequest": true,
  "evidence": [
    "Requests a ₹1 payment to process a refund"
  ]
}
```

Another:

```json
{
  "authorityImpersonation": true,
  "evidence": [
    "Claims to be contacting the recipient on behalf of a bank"
  ]
}
```

The UI can then display:

```text
WHY THIS IS RISKY

⚠ Urgency
"Pay immediately"

⚠ Payment request
"As a verification payment"

⚠ Authority claim
"Bank verification department"
```

This is much easier for a non-technical judge to understand than raw model output.

---

# 13. Deterministic Risk Engine

This is your own application logic.

Suggested weights:

| Trigger                       |  Weight |
| ----------------------------- | ------: |
| Payment request               |      25 |
| Coercion / threat             |      20 |
| Authority impersonation       |      15 |
| Sensitive information request |      15 |
| Urgency                       |      10 |
| Impersonation                 |      15 |
| **Total**                     | **100** |

Calculate:

```text
score =
  urgencyConfidence × 10
+ authorityConfidence × 15
+ paymentConfidence × 25
+ coercionConfidence × 20
+ sensitiveInfoConfidence × 15
+ impersonationConfidence × 15
```

Then:

```text
0–29   LOW
30–59  MEDIUM
60–100 HIGH
```

The model does **not** determine the final score.

Your application does.

---

# 14. Additional Safety Rules

Add a few deterministic consistency rules.

For example:

```text
IF payment request = true
AND coercion = true
→ minimum score = 55
```

```text
IF payment request = true
AND authority impersonation = true
→ minimum score = 60
```

```text
IF sensitive information request = true
AND impersonation = true
→ minimum score = 60
```

These are not keyword detectors. They are logical safeguards applied **after semantic classification**.

This also lets you explain the system as:

```text
Semantic understanding
        +
Transparent risk policy
        =
Final threat score
```

---

# 15. Threat Levels

The frontend should have only three major states:

```text
LOW
MEDIUM
HIGH
```

### LOW

```text
Low Risk

No strong social-engineering indicators detected.
```

### MEDIUM

```text
Medium Risk

This message contains suspicious characteristics.
Verify the sender before taking action.
```

### HIGH

```text
High Risk

This message shows multiple signs of social engineering.

Do not make the requested payment.
Do not share your UPI PIN, OTP, or other sensitive credentials.
```

The exact warning should be generated by the AI but constrained by the application's output schema.

---

# 16. Bilingual Warning Generation

The same AI call should generate:

```text
englishWarning
hindiWarning
```

Do **not** create a second translation API call.

That gives:

```text
1 user message
      ↓
1 Gemini request
      ↓
analysis + explanation + English + Hindi
```

rather than:

```text
Gemini analysis
      ↓
Google Translate
      ↓
another API call
```

This saves latency and API quota.

The requirement is specifically English + Hindi, so the system should always return both fields.

---

# 17. Result UI

The result page should be visually organized around the Threat Meter.

```text
┌───────────────────────────────────────────────┐
│ ANALYSIS RESULT                               │
│                                               │
│              HIGH RISK                        │
│                                               │
│              ████████████░░                   │
│                  87 / 100                     │
│                                               │
│ ───────────────────────────────────────────── │
│                                               │
│ WHY THIS IS RISKY                             │
│                                               │
│ ⚠ Payment request                             │
│   Requests a payment for refund verification  │
│                                               │
│ ⚠ Urgency                                     │
│   Pressures you to act immediately            │
│                                               │
│ ⚠ Coercion                                    │
│   Suggests consequences for not paying        │
│                                               │
│ ───────────────────────────────────────────── │
│                                               │
│ SAFETY WARNING                                │
│                                               │
│ Do not make the requested payment...          │
│                                               │
│ हिंदी                                         │
│                                               │
│ मांगे गए भुगतान को न करें...                   │
│                                               │
└───────────────────────────────────────────────┘
```

This directly addresses the organizer's requirement for a Threat Meter and bilingual safety card.

---

# 18. Frontend Component Structure

```text
components/
│
├── analyzer/
│   ├── MessageInput.tsx
│   ├── SourceSelector.tsx
│   ├── ExampleMessages.tsx
│   └── AnalyzeButton.tsx
│
├── results/
│   ├── ThreatMeter.tsx
│   ├── RiskBadge.tsx
│   ├── TriggerList.tsx
│   ├── EvidenceList.tsx
│   ├── SafetyCard.tsx
│   └── AnalysisResult.tsx
│
└── ui/
    └── shadcn components
```

---

# 19. Backend Structure

```text
lib/
│
├── ai/
│   ├── types.ts
│   ├── schema.ts
│   ├── prompt.ts
│   ├── provider.ts
│   ├── gemini.ts
│   └── groq.ts
│
├── risk/
│   ├── score.ts
│   └── rules.ts
│
├── validation/
│   └── input.ts
│
└── utils/
    └── errors.ts
```

API:

```text
app/
│
├── page.tsx
│
├── analyze/
│   └── page.tsx
│
└── api/
    └── analyze/
        └── route.ts
```

---

# 20. Recommended Project Structure

```text
upi-shield/
│
├── app/
│   ├── page.tsx
│   ├── analyze/
│   │   └── page.tsx
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── analyzer/
│   ├── results/
│   └── ui/
│
├── lib/
│   ├── ai/
│   │   ├── gemini.ts
│   │   ├── groq.ts
│   │   ├── provider.ts
│   │   ├── prompt.ts
│   │   ├── schema.ts
│   │   └── types.ts
│   │
│   ├── risk/
│   │   ├── score.ts
│   │   └── rules.ts
│   │
│   └── validation/
│       └── input.ts
│
├── public/
│   └── examples/
│
├── .env.local
├── .env.example
├── README.md
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

# 21. Environment Variables

```env
GEMINI_API_KEY=
GROQ_API_KEY=

GEMINI_MODEL=gemini-3.8-flash
GROQ_MODEL=qwen/qwen3.8-27b
```

Do **not** expose these through `NEXT_PUBLIC_*`.

The browser should never receive the provider API keys.

---

# 22. Provider Selection Logic

Conceptually:

```ts
async function analyze(input: ScamAnalysisInput) {
  try {
    const result = await geminiProvider.analyze(input);
    return result;
  } catch (error) {
    if (isRetryableProviderError(error)) {
      return await groqProvider.analyze(input);
    }

    throw error;
  }
}
```

Then:

```ts
const aiResult = await analyze(input);

const finalResult = calculateRisk(aiResult);
```

The risk engine therefore remains completely independent of the provider.

---

# 23. Retry Strategy

Do not aggressively retry because free API quotas are limited.

Recommended:

```text
Gemini request
   │
   ├── success → done
   │
   └── temporary failure
          │
          ▼
      one short retry
          │
          ├── success → done
          │
          └── failure
                 ↓
               Qwen
```

If Gemini returns a 429, it makes little sense to repeatedly hit the same provider.

Immediately switching to Qwen is more useful.

Groq currently documents HTTP 429 behavior and exposes rate-limit information through response headers.

---

# 24. API Quota Protection

Because this is a public web application, somebody could theoretically spam `/api/analyze`.

For the hackathon build, implement a simple demo-grade protection layer:

```text
Maximum input length
+
Minimum delay between requests
+
Basic per-IP throttle
+
No automatic infinite retries
```

For example:

```text
1 analysis / 2 seconds
10 analyses / hour / IP
```

An in-memory limiter is sufficient for the hackathon prototype.

You do not need Redis just for this.

---

# 25. Privacy Design

Do not persist message content.

Flow:

```text
Message
   ↓
AI provider
   ↓
Analysis
   ↓
Browser
   ↓
Gone
```

Do not put the original message into:

```text
console.log()
database
analytics
server logs
```

Especially because SMS/WhatsApp content may contain personal information.

---

# 26. Demo Data

Create a small collection of carefully selected test messages.

### High-risk verification refund

```text
Your refund is pending. For verification, send ₹1
to the UPI ID below within 10 minutes or your refund
will be cancelled.
```

Expected:

```text
HIGH
```

### Fake electricity authority

```text
Electricity Department: Your connection will be
disconnected today. Pay ₹50 immediately using this
UPI ID to prevent disconnection.
```

Expected:

```text
HIGH
```

### Fake bank authority

```text
This is the bank verification department.
Your account will be blocked today unless you
complete UPI verification by paying ₹10.
```

Expected:

```text
HIGH
```

### Benign message

```text
Your electricity bill of ₹850 is due on 15 September.
Please use the official electricity portal to make payment.
```

Expected:

```text
LOW
```

### Ambiguous message

```text
Your refund has been initiated. Please check your
official bank application for the status.
```

Expected:

```text
LOW
```

Having benign and ambiguous examples is important because judges may deliberately test false positives.

---

# 27. Bonus Feature Architecture

Do not build these initially.

Once the mandatory flow works, they can plug into the same pipeline.

## Screenshot OCR

```text
Screenshot
    ↓
Image input
    ↓
Gemini / Qwen multimodal analysis
    ↓
Extract text + analyze
    ↓
Risk Engine
    ↓
Safety Card
```

Both the current Gemini 3.8 Flash and Groq's Qwen 3.8 27B support image input, so the architecture can be extended without introducing a separate OCR service.

The organizers explicitly list OCR from uploaded mobile screenshots as a bonus feature.

## Raw UPI Intent

Add:

```text
upi://pay?pa=...
```

parser:

```text
Raw UPI URI
     ↓
URL parser
     ↓
pa
pn
am
cu
tn
     ↓
Structured payment context
     ↓
AI analysis
```

The organizers list raw UPI intent parsing as another bonus.

---

# 28. What We Are Deliberately Not Using

```text
❌ Hugging Face zero-shot
❌ RAG
❌ pgvector
❌ PostgreSQL
❌ Firebase
❌ Redis
❌ FastAPI
❌ Streamlit
❌ WhatsApp API
❌ SMS API
❌ Banking API
❌ UPI transaction integration
❌ Authentication
❌ Fine-tuning
```

None of these are necessary to demonstrate the core solution.

The competition's MVP is explicitly an end-to-end application that processes message text, identifies deceptive triggers, and outputs bilingual safety cards.

---

# 29. Final Runtime Architecture

The complete production path is therefore:

```text
                     USER
                       │
                       ▼
              ┌─────────────────┐
              │ Next.js Client  │
              │                 │
              │ Message Input   │
              │ Source Selector │
              └────────┬────────┘
                       │
                       ▼
              POST /api/analyze
                       │
                       ▼
              ┌─────────────────┐
              │ Input Validator │
              └────────┬────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Gemini Provider  │
              │                  │
              │ Gemini 3.8 Flash │
              └────────┬─────────┘
                       │
                success│failure
                       │
              ┌────────┴─────────┐
              │                  │
              ▼                  ▼
           Continue       Qwen 3.8 27B
                              via Groq
              │                  │
              └────────┬─────────┘
                       ▼
               Zod Validation
                       │
                       ▼
                 Risk Engine
                       │
                       ▼
              Final Analysis DTO
                       │
                       ▼
              ┌──────────────────┐
              │   Result UI      │
              │                  │
              │ Threat Meter     │
              │ Risk Score       │
              │ Triggers         │
              │ Evidence         │
              │ English Warning  │
              │ Hindi Warning    │
              │ Recommended Act. │
              └──────────────────┘
```

# 30. Four-Hour Implementation Order

## Hour 1 — Foundation

```text
Next.js project
        ↓
UI skeleton
        ↓
Message input
        ↓
API route
        ↓
Gemini connection
```

At the end of hour 1:

```text
Paste message → Gemini → display raw result
```

## Hour 2 — Actual product

Implement:

```text
Zod schema
+
structured Gemini output
+
trigger extraction
+
risk engine
+
Threat Meter
```

At the end of hour 2:

```text
Paste message
→ analyze
→ HIGH 87/100
→ triggers
→ explanation
```

## Hour 3 — Polish + fallback

Implement:

```text
Hindi safety card
Qwen fallback
Error handling
Loading state
Demo examples
Responsive UI
```

## Hour 4 — Competition layer

Implement:

```text
README
Git commits
Deployment
Test messages
Backup screen recording
Final UI polish
```

The organizers estimate approximately two hours for implementation and two hours for polishing, and require a working live demo.

# 31. What the Judge Should See in 90 Seconds

The ideal demo flow is:

```text
1. Open UPI-Shield
        ↓
2. Paste "verification refund" scam
        ↓
3. Click Analyze
        ↓
4. HIGH RISK / 87
        ↓
5. Show:
   - urgency
   - payment request
   - coercion
        ↓
6. Show English safety warning
        ↓
7. Show Hindi safety warning
        ↓
8. Paste benign message
        ↓
9. Show LOW RISK
```

That directly matches the organizer's stated example of using a **verification-refund scam** and demonstrating a **High Risk** result with a Hindi translation.

# 32. Final Architecture Decision

```text
FRONTEND
Next.js + TypeScript + Tailwind + shadcn

BACKEND
Next.js Route Handler

PRIMARY AI
Gemini 3.8 Flash

FALLBACK AI
Qwen 3.8 27B via Groq

OUTPUT CONTROL
Zod + JSON Schema

RISK
Custom deterministic scoring engine

DATABASE
None

AUTH
None

PACKAGE MANAGER & RUNTIME
Bun

DEPLOYMENT
Vercel

SOURCE CONTROL
GitHub
```

The important architectural separation is:

```text
Gemini / Qwen
      ↓
Semantic understanding

Your code
      ↓
Risk policy + scoring

Next.js
      ↓
User experience
```

That gives you a system that is **simple enough to finish in four hours but technically explainable enough to defend in front of judges**.

---

# 33. Bun Development & Operational Architecture

The project standardizes on **Bun** (`bun.sh` v1.3+) as the official runtime, package manager, and native test runner across all development and deployment environments.

### 33.1 Bun CLI Commands

| Command | Description |
| :--- | :--- |
| `bun install` | Deterministic dependency installation adhering strictly to `bun.lock` |
| `bun dev` | Spawns Next.js 16 development server with Turbopack |
| `bun test` | Executes native unit test suite (`tests/*.test.ts`) in sub-200ms |
| `bun run build` | Compiles production-optimized standalone build |
| `bun run lint` | ESLint static security & stylistic validation |
| `bun run typecheck` | Strict TypeScript compilation check (`tsc --noEmit`) |

### 33.2 Why Bun for UPI-Shield?

1. **Lightning Fast Test Execution**: Bun’s native runner executes the complete deterministic risk engine policy tests and raw UPI intent parser test matrix in ~150ms with zero extra test-framework dependencies.
2. **Deterministic Lockfile (`bun.lock`)**: Guarantees identical dependency trees across environments, eliminating version drift.
3. **TypeScript First-Class Support**: Native execution of TypeScript scripts and testing without requiring `ts-node` or `tsx` overhead.
4. **Instant Startup**: Near-zero cold start overhead optimizes local iteration speed.

