# 🚀 SpaceYa: Your Space, Handled

SpaceYa is a modern, high-performance property management suite designed to streamline the relationship between property owners, agents, and tenants. Built with a focus on ease of use, transparency, and data-driven insights.

## ✨ Features

### 🏢 Property Management
- **List & Track**: Manage a diverse portfolio of properties from single rooms to fully detached duplexes.
- **Dynamic Status**: Track property occupancy (Vacant, Occupied, Under Maintenance).
- **Rich Media**: Support for property images and detailed descriptions.

### 📋 Tenant Screening & Applications
- **Streamlined Workflow**: Intuitive application process for prospective tenants.
- **AI-Driven Assessment**: Built-in risk scoring and recommendations to help agents make informed decisions.
- **Digital Verification**: Secure handling of IDs and passport photos.

### 🛠 Maintenance & Support
- **Ticket Lifecycle**: Tenants can report issues with priority levels (Low to Emergency).
- **Agent Workflow**: Agents can track, update, and resolve tickets efficiently.
- **Visual Proof**: Attach images to maintenance requests for faster assessment.

### 💳 Payments & Finance
- **Rent Tracking**: Monitor payment status (Paid, Pending, Late).
- **Financial Reporting**: Generate visual reports of revenue and expenses.
- **Digital Receipts**: Integration with PDF generation for payment records.

### 🔔 Real-time Intelligence
- **Smart Notifications**: Instant alerts for new applications, maintenance updates, and payment deadlines.
- **Role-Based Dashboards**: Personalized experiences for Admins, Agents, and Tenants.

---

## 🛠 Tech Stack

- **Frontend**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Modern CSS with Glassmorphism and Dark Mode support
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Document Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/spaceya.git
   cd spaceya
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173` to see the app in action.

---

## 📂 Project Structure

```text
├── src/
│   ├── pages/          # Individual screen components
│   ├── services/       # API and utility services (Toasts, etc.)
│   ├── types.ts        # Global TypeScript definitions
│   ├── store.ts        # State management logic
│   ├── App.tsx         # Main entry point and routing
│   └── index.css       # Global styles and design tokens
├── public/             # Static assets
└── vite.config.ts      # Vite configuration
```

---

## 🗺 Roadmap
- [ ] **Digital Agreements**: Full signing and storage of lease agreements.
- [ ] **Advanced Analytics**: Deeper insights into property performance.
- [ ] **Mobile App**: Dedicated mobile experience for tenants and agents.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

<p align="center">
  Made with ❤️ by the SpaceYa Team
</p>
