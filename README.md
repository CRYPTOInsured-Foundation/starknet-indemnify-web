# StarkInsure Web

The **StarkInsure Web** is the Next.js frontend for the StarkInsure DeFi insurance platform, providing users with a seamless interface to manage policies, file claims, and interact with StarkNet-powered insurance pools.

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

## 🛠️ Tech Stack  
| Component           | Technology                                                                 |
|---------------------|---------------------------------------------------------------------------|
| Framework           | [Next.js 14](https://nextjs.org/) (App Router)                           |
| State Management    | [Zustand](https://zustand-demo.pmnd.rs/)                                 |
| Styling            | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Blockchain         | [StarkNet.js](https://www.starknetjs.com/) + [get-starknet](https://github.com/starknet-io/get-starknet) |

---

## 🚀 Quick Start  

### Prerequisites  
- Node.js v18+  
- pnpm 8+  
- StarkNet wallet (ArgentX/Braavos)

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
   git clone https://github.com/CRYPTOInsured-Foundation/starkinsure-web.git
   cd starkinsure-web
   pnpm install
   cp .env.example .env.local
   pnpm dev
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
