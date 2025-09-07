# Starknet-Indemnify-Web

The **Starknet-Indemnify-Web** is the Next.js frontend for the Starknet-Indemnify DeFi insurance platform, providing users with a seamless interface to manage policies, file claims, and interact with Starknet-powered insurance pools.

---

## ✨ Features  
- **Policy Management**:  
  - 📝 On-chain policy purchase  
  - 📊 Coverage dashboard  
  - 🔄 Claim filing workflow  
- **Wallet Integration**:  
  - 🔐 ArgentX/Braavos connectivity  
  - ⚡ Instant StarkNet L2 transactions  
- **Risk Visualization**:  
  - 📈 Pool performance analytics  
  - 🚨 Risk assessment tools  
- **Responsive Design**:  
  - 📱 Mobile-optimized flows  
  - 🖥️ Desktop trading interface  

---

## Other Repositories `starknet-indemnify-web` depends on:
- https://github.com/CRYPTOInsured-Foundation/starknet-indemnify-user-service.git
- https://github.com/CRYPTOInsured-Foundation/starknet-indemnify-on-chain.git
- https://github.com/CRYPTOInsured-Foundation/starknet-indemnify-risk-analytics.git
- https://github.com/CRYPTOInsured-Foundation/starknet-indemnify-policy-service.git
- https://github.com/CRYPTOInsured-Foundation/starknet-indemnify-payment-service.git
You can visit these repos to pick issues you can implement feature on. 
---

## 🛠️ Tech Stack  
| Component           | Technology                                                                 |
|---------------------|---------------------------------------------------------------------------|
| Framework           | [Next.js 15](https://nextjs.org/) (App Router)                           |
| State Management    | [Zustand](https://zustand-demo.pmnd.rs/)                                 |
| Styling            | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Blockchain         | [Starknet.js](https://www.starknetjs.com/) + [@starknet.io/get-starknet](https://github.com/starknet-io/get-starknet) |

---

## 🚀 Quick Start  

### Prerequisites  
- Node.js v18+  
- pnpm 8+  
- Starknet wallet (ArgentX/Braavos)

## 📂 Project Structure

```text
src/
├── app/
├── components/
├── lib/
└── stores/
```


### Installation  
1. **Clone the repo**:  
   ```bash
   git clone https://github.com/CRYPTOInsured-Foundation/starknet-indemnify-web.git
   cd starknet-indemnify-web
   pnpm install
   cp .env.example .env
   pnpm run dev
   ```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**  
   ```bash
   git checkout -b feature/your-feature
3. Submit PR
- Ensure your code passes all tests
- Include relevant documentation updates
- Reference any related issues
