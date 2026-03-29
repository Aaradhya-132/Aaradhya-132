import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, Plus, Compass, MessageCircle, LayoutDashboard, Bell, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import apiClient from "../../api/client";
import { io } from "socket.io-client";
import NotificationDropdown from "../NotificationDropdown";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  // Initial user sync
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/notifications");
      setNotifications(data);
    } catch (error) {
      console.error("Alert retrieval failed:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAlerts();

      const socketUrl = import.meta.env.PROD ? window.location.origin : "http://localhost:5000";
      const newSocket = io(socketUrl, { withCredentials: true });
      setSocket(newSocket);

      newSocket.on("notification_new", (alert) => {
        setNotifications((prev) => [alert, ...prev]);
        toast({
          title: "New Update",
          description: alert.alertContent,
        });
      });

      return () => newSocket.disconnect();
    }
  }, [user, fetchAlerts, toast]);

  const handleAlertRead = async (alertId) => {
    try {
      await apiClient.put(`/notifications/${alertId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === alertId ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark alert as viewed:", error);
    }
  };

  const clearAllAlerts = async () => {
    try {
      await apiClient.put("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  const navLinks = [
    { name: "Explore", path: "/explore", icon: Compass },
    { name: "Chat", path: "/chat", icon: MessageCircle, color: "text-blue-600" },
    { name: "My Trips", path: "/my-trips", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-[60] w-full bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/60 border-b border-zinc-100 transition-all">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-2.5 transition-transform active:scale-95">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-1.5 rounded-xl shadow-lg shadow-sky-100">
            <img src="/logo.png" alt="explorer.ai" className="w-7 h-7 object-contain brightness-0 invert" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-extrabold text-xl tracking-tight text-zinc-900 leading-none lowercase">
              explorer<span className="text-sky-600">.ai</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
              Refined Exploration
            </p>
          </div>
        </Link>

        {/* Global Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-2
                ${location.pathname === link.path 
                  ? "bg-zinc-100 text-zinc-900" 
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"}`}
            >
              <link.icon className={`w-4 h-4 ${link.color || ""}`} />
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Center */}
        <div className="flex items-center gap-3">
          <Link to="/create-trip" className="hidden md:block">
            <Button size="sm" className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold gap-2 rounded-full px-5">
              <Plus className="w-4 h-4" />
              Plan Journey
            </Button>
          </Link>

          {user && (
            <div className="flex items-center h-8 border-l border-zinc-200 ml-2 pl-4 gap-4">
              {/* Conditional Panel Buttons */}
              {user.role === "admin" && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50 h-8 rounded-full">
                    Admin
                  </Button>
                </Link>
              )}
              {user.role === "organiser" && (
                <Link to="/organiser">
                  <Button variant="outline" size="sm" className="border-sky-200 text-sky-600 hover:bg-sky-50 h-8 rounded-full">
                    Console
                  </Button>
                </Link>
              )}

              {/* Alerts */}
              <NotificationDropdown
                notifications={notifications}
                onMarkRead={handleAlertRead}
                onMarkAllRead={clearAllAlerts}
              />

              {/* Account Dropdown Mock/Button */}
              <div className="flex items-center gap-2">
                <Link to="/profile" className="flex items-center gap-2 max-w-[120px] group transition-opacity hover:opacity-80">
                   <div className="w-8 h-8 rounded-full bg-linear-to-tr from-sky-400 to-indigo-500 overflow-hidden border-2 border-white shadow-sm">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">{user.username?.[0] || user.email?.[0]}</div>}
                   </div>
                </Link>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-full"
                    onClick={() => { logout(); navigate("/"); }}
                    title="Terminate Session"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {!user && (
             <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-600 font-bold px-4">Enter</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 rounded-full shadow-lg shadow-sky-100 transition-all">Join</Button>
                </Link>
             </div>
          )}

          {/* Mobile Navigator Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-zinc-600 rounded-full border border-zinc-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-white border-b border-zinc-100 animate-in slide-in-from-top-2 duration-200">
           <div className="p-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link 
                    key={link.path} 
                    to={link.path} 
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl hover:bg-zinc-50 font-bold text-zinc-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                   <link.icon className="w-5 h-5" />
                   {link.name}
                </Link>
              ))}
              <Link 
                to="/create-trip" 
                className="mt-2 bg-zinc-900 text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="w-5 h-5" />
                Plan Journey
              </Link>
           </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
