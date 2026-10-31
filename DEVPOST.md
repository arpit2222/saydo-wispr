# SayDo: Voice-First Agent Enablement Powered by Wispr Flow

> **Submission for the WeMakeDevs Wispr Hackathon**  
> **Event**: [https://www.wemakedevs.org/wispr](https://www.wemakedevs.org/wispr)  
> **Repository**: [https://github.com/arpit2222/saydo-wispr](https://github.com/arpit2222/saydo-wispr)  
> **Live Demo**: [https://saydo-demo.vercel.app](https://saydo-demo.vercel.app)

---

## 💡 Inspiration

Every enterprise wants AI agents that can act—not just chat. But turning an existing web application into an agent-ready system is an agonizing, manual slog:
1. Developers spend weeks manually writing OpenAPI specs, creating wrapper SDKs, and reverse-engineering multi-step authentication tokens.
2. Once deployed, unguarded agents hallucinate parameters, approve unauthorized ₹50 lakh budgets, or invite external admins without oversight.
3. Writing security rules requires complex regexes, custom middleware, or JSON schema DSLs that non-technical operators cannot touch.

We asked: **What if you could turn any web app into an autonomous, safety-governed AI agent simply by talking?** What if an engineer or product manager could demonstrate the workflow once in the browser while speaking natural-language explanations into **Wispr Flow**, and have the system automatically synthesize, verify, and govern typed agent tools for every AI ecosystem?

That vision is **SayDo**: *Speak your workflow. Dictate your rules. Run everywhere.*

---

## ⚡ What It Does

SayDo is an end-to-end platform that enables any web application to become agent-ready in minutes using the power of **Wispr Flow**:

1. **Teach by Doing ("Show & Tell" with Wispr)**:
   - An isolated client-side SDK mounted in a Shadow DOM intercepts same-origin network traffic while the developer performs tasks in the browser.
   - The user dictates natural-language context using **Wispr Flow** at 3x typing speed:  
     *"I am creating a Website Revamp project with a 2 lakh budget and inviting Arpit as an editor."*
   - Causal parameters (UUIDs, query strings, integers) are mapped across steps into a clean dependency graph.
2. **Compile Typed Skills with NVIDIA Nemotron**:
   - **Nebius Token Factory** runs **NVIDIA Nemotron** to synthesize typed Zod schemas, separating inputs from constants and pairing write actions with automatic read-verifiers.
3. **Voice-Authored Governance & Safety Guardrails**:
   - Administrators dictate policy guardrails in plain English via Wispr:  
     *"Budget can never exceed 10 lakh"*, *"Never invite admins through the assistant"*, *"Always ask before rejecting an application"*.
   - Nemotron compiles these spoken rules into deterministic Abstract Syntax Tree (AST) policies that execute at runtime with 100% deterministic code safety.
4. **Full-Lifecycle Doc Intelligence with Tavily**:
   - **Tavily Discover**: Reads host documentation to automatically suggest skills and rules.
   - **Tavily Grounded QA (`ask_docs`)**: Answers user policy and doc questions in chat with direct citation chips.
   - **Tavily Drift Watch**: Continuously monitors host changelogs to detect breaking API changes, flagging skills as `at_risk` before production breakage.
5. **Universal Tool Exports**:
   - Exposes skills as an **official Model Context Protocol (MCP)** server for Claude Desktop and Cursor.
   - Generates **Chrome WebMCP Origin-Trial** snippets for in-page browser agents.
   - Includes an in-app conversational assistant with hands-free voice control and live read-verification.

---

## 🎙️ How Wispr Flow Powers SayDo

Wispr Flow is not just an add-on—it is the foundational interface for the entire SayDo platform:

1. **3x Faster Tool Creation**: Instead of typing tedious parameter descriptions and documentation, developers speak fluidly into Wispr Flow during workflow capture. Wispr's rapid, accurate transcript is synchronized with HTTP waterfall requests to identify inputs vs constants.
2. **Spoken Policy Dictation**: Security policies are dictated naturally into the Wispr voice box in SayDo Studio, lowering the barrier to AI governance from complex DevOps code to natural speech.
3. **Hands-Free In-App Interaction**: Users interact with the embedded agent widget using voice commands and can confirm write actions (*"Confirm and execute"*) hands-free.
4. **Reliable Dialect Handling & Fallbacks**: Tested with Indian English (`en-IN`) and standard English (`en-US`), with seamless Web Speech API fallback for maximum compatibility.

---

## 🛠️ How We Built It

- **Voice Layer (Wispr Flow & Web Speech)**: Real-time voice dictation capturing spoken intent during workflow demonstrations, security policy authoring, and conversational queries.
- **Model Routing Architecture (Nebius Token Factory & NVIDIA Nemotron)**:
  - `nvidia/nemotron-mini-4b-instruct`: Sub-second compilation of HTTP traces + Wispr voice into typed Zod schemas, spoken policy parsing, and drift changelog analysis.
  - `nvidia/llama-3.1-nemotron-70b-instruct`: Autonomous function-calling agent loop, parameter binding, and interactive chat.
  - `nvidia/nemotron-4-340b-instruct`: Multi-intent DAG decomposition into structured execution plans and benchmark evaluation judging.
- **Web Intelligence (Tavily AI)**: `@tavily/core` powers documentation discovery, domain-scoped search grounding, and automated changelog drift detection.
- **Client SDK (`packages/sdk`)**: A 94 kB Vite IIFE bundle mounted inside a Shadow DOM root with network interceptors, client-side PII/secret scrubbing, accessible focus states, and mobile responsive layout.
- **Governance & Policy Engine (`packages/shared/policy.ts`)**: Pure, zero-dependency AST evaluator supporting confirm, block, limit, require, and role policies across numeric, string, and list operators.
- **Universal Interop (`apps/api/src/routes/mcp.ts`)**: Official `@modelcontextprotocol/sdk` Streamable HTTP server mounted at `/mcp` with server-side `X-Agent-Token` security.
- **Production Infrastructure**: Hardened multi-stage `node:20-slim` container deployed to **Nebius Serverless Endpoints** (with Railway fallback) and **Next.js 14** deployed on **Vercel**.

---

## 🧗 Challenges We Ran Into

1. **Aligning Spoken Voice with Network Telemetry**:
   When a user clicks "Submit" while narrating *"2 lakh budget"*, aligning the natural-language speech (`2 lakh`) with the JSON payload (`budget: 200000`) required smart parameter normalization. We built a prompt pipeline that maps spoken numbers, currency units, and entities directly to captured payload properties.
2. **Cross-Step Causal Data Flow**:
   When a user creates a project and then invites a member, the second request needs the generated `id` from the first. We created a deterministic **Value Tracer** algorithm that pre-computes UUID and ID graph edges across request/response payloads before passing them to the compiler.
3. **Safe In-Browser Execution Without Storing Secrets**:
   Traditional platforms store user API tokens on backend servers—a massive security risk. We designed SayDo so that agent write actions execute **directly through the user's active browser session** using their existing authenticated cookies.

---

## 🏆 Accomplishments That We're Proud Of

- **Voice-to-Agent in Under 60 Seconds**: A complete newcomer can open a web app, record a task while speaking into Wispr Flow, and have a production-ready agent tool live in under a minute.
- **100% Pass Rate on 20-Task Gold Standard Benchmark**: Evaluated across 12 single/multi-step flows, 5 adversarial policy-block cases, and 3 grounded docs Q&A tasks with zero hallucinations across all Nemotron models.
- **Zero-Trust Policy Enforcement**: Proved across 25/25 Vitest tests that spoken policies (such as *"budget $\le$ 10 lakh"*) are strictly enforced at the AST engine level—preventing prompt injection or model hallucination from bypassing platform safety.
- **Full Universal Interoperability**: Instant tool export to Claude Desktop via MCP, Chrome via WebMCP, and the native SDK.

---

## 📚 What We Learned

- **Voice is the Natural Programming Language for Agents**: Writing code to teach an agent how to use an API is redundant when you can simply perform the action and narrate your intent. Wispr Flow makes agent tool creation feel like pair programming with an intelligent observer.
- **Hierarchical Model Routing is Essential**: Pairing fast 4B models for edge voice parsing with 70B for tool calling and 340B for multi-intent planning achieves sub-second latency with frontier-class reasoning.

---

## 🔮 What's Next for SayDo

- **Direct Wispr Flow Cloud API SDK**: Native WebRTC / WebSocket streaming audio directly to Wispr's API for ultra-low latency continuous transcription.
- **Self-Healing Re-Record**: When Tavily Drift Watch flags breaking API changes, the SayDo SDK guides the developer through a 1-click voice re-demonstration to heal the schema.
- **Vernacular Voice Expansion**: Expanding our Wispr-driven voice compiler to native Hindi, Hinglish, Spanish, and German spoken policy authoring.
- **Multimodal Visual Action Grounding**: Incorporating DOM bounding boxes and UI screenshots alongside HTTP waterfall traces.

---

## 🧰 Built With

- **Wispr Flow** (Voice-first workflow demonstration, speech dictation & policy authoring)
- **NVIDIA Nemotron** (`llama-3.1-nemotron-70b-instruct`, `nemotron-4-340b-instruct`, `nemotron-mini-4b-instruct`)
- **Nebius Token Factory** (OpenAI-compatible inference on NVIDIA H100 clusters)
- **Nebius Serverless Endpoints** & Container Registry
- **Tavily AI** (Search, Extract, and Continuous Drift Watch)
- **Model Context Protocol (MCP)** (Official `@modelcontextprotocol/sdk`)
- **Chrome WebMCP** (In-page browser agent standard)
- **Next.js 14 App Router** & React 18
- **TypeScript & Zod** (End-to-end typed contracts)
- **Tailwind CSS & Lucide Icons**
- **Docker** (Multi-stage `node:20-slim` container)
- **Vercel** (Edge hosting & deployment)
- **Turborepo & pnpm** (Monorepo orchestration)
- **Vitest** (Automated test suites & evaluation harness)
