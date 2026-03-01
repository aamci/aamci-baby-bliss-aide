import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => (
  <div className="min-h-screen bg-background max-w-lg mx-auto relative">
    <main className="safe-bottom">
      <Outlet />
    </main>
    <BottomNav />
  </div>
);

export default AppLayout;
