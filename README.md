A Next.js 14 application that allows users to search, filter, and view details of Pokémon using the PokéAPI. Built with React Query, Zustand, and Ant Design for an optimized user experience.



📌 Features
✅ Search & Filter Pokémon by name or type
✅ Paginated Pokémon List for efficient browsing
✅ Detailed Pokémon Drawer with stats, descriptions, and images
✅ Optimized Data Fetching using React Query
✅ State Management with Zustand
✅ Responsive UI with Ant Design

🚀 Tech Stack
Next.js 15 (App Router)
React Query (Efficient data fetching & caching)
Zustand (Global state management)
Ant Design (UI components)
PokéAPI (Fetching Pokémon data)

📦 Installation & Setup
🔹 Prerequisites
Node.js v18+
Package Manager: npm or yarn

🔹 Clone the Repository
sh
Copy
Edit
git clone https://github.com/yourusername/pokemon-explorer.git
cd pokemon-explorer

🔹 Install Dependencies
sh
Copy
Edit
npm install
# or
yarn install

🔹 Run the Development Server
sh
Copy
Edit
npm run dev

# or
yarn dev
Then open http://localhost:3000 in your browser.

📁 Project Structure
bash
Copy
Edit
📦 pokemon-explorer
├── 📂 app
│   ├── 📂 components      # Reusable UI components
│   ├── 📂 services        # API calls (fetchPokemon.js)
│   ├── 📂 store           # Zustand state management
│   ├── 📜 page.tsx        # Main page (Home)
├── 📜 package.json
├── 📜 README.md
└── 📜 .gitignore

🔹 API Endpoints Used
This project uses the PokéAPI to fetch Pokémon data:

GET https://pokeapi.co/api/v2/pokemon?limit=10&offset=0 - Paginated Pokémon list
GET https://pokeapi.co/api/v2/pokemon/{id} - Fetch Pokémon details
GET https://pokeapi.co/api/v2/types/{types} - fetch Pokemon types