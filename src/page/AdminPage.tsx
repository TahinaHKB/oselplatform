import { useState } from "react";
import { Clock, LayoutDashboard, Users, Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NavBar from "@/component/NavBar";
import ManageRequest from "@/component/ManageRequest";
import { NavLink } from "react-router-dom";
import ManageUser from "@/component/ManageUser";

interface AdminProps {
  menu: string;
}

const AdminPage: React.FC<AdminProps> = ({ menu }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeClass =
    "flex items-center gap-3 p-3 rounded-lg bg-[#EFF6FF] text-[#2563EB] font-medium";
  const inactiveClass =
    "flex items-center gap-3 p-3 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors";

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-[#F8F9FA] mt-[50px] flex font-sans text-[#1A1A1A]">
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* overlay */}
              <motion.div
                className="fixed inset-0 bg-black/40 z-40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />

              {/* sidebar */}
              <motion.aside
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 w-64 h-full bg-white z-50 border-r border-[#E5E7EB] flex flex-col md:hidden"
              >
                <div className="p-6 border-b flex justify-between items-center">
                  <span className="font-bold text-[#2563EB]">AdminPanel</span>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X size={22} />
                  </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                  <NavLink
                    to="/admin/request"
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <Clock size={20} /> Requests
                  </NavLink>
                  <NavLink
                    to="/admin/user"
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <Users size={20} /> Users
                  </NavLink>
                  <NavLink
                    to="/admin/setting"
                    className={({ isActive }) =>
                      isActive ? activeClass : inactiveClass
                    }
                  >
                    <Settings size={20} /> Settings
                  </NavLink>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r border-[#E5E7EB] flex-col">
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xl">
              <LayoutDashboard size={24} />
              <span>AdminPanel</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavLink
              to="/admin/request"
              className={({ isActive }) =>
                isActive ? activeClass : inactiveClass
              }
            >
              <Clock size={20} />
              <span>Requests</span>
            </NavLink>
            <NavLink
              to="/admin/user"
              className={({ isActive }) =>
                isActive ? activeClass : inactiveClass
              }
            >
              <Users size={20} />
              <span>Users</span>
            </NavLink>
            <NavLink
              to="/admin/setting"
              className={({ isActive }) =>
                isActive ? activeClass : inactiveClass
              }
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        {menu == "request" && <ManageRequest setSidebarOpen={setSidebarOpen} />}
        {menu == "user" && <ManageUser />}
      </div>
    </>
  );
};

export default AdminPage;
