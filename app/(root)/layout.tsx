import { ReactNode } from "react";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { NavBar } from "@/components/NavBarNew";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();

  return (
    <div className="root-layout">
      {isUserAuthenticated && <NavBar />}
      <main className={isUserAuthenticated ? "px-4 sm:px-6 lg:px-8 py-8" : ""}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
