import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <Dashboard username={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

export default App;