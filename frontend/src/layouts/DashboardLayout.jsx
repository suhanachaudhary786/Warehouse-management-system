

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaBars, FaTimes } from "react-icons/fa";

function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobile && sidebarOpen) {
                const sidebar = document.getElementById('main-sidebar');
                const menuBtn = document.getElementById('menu-btn');
                if (sidebar && !sidebar.contains(e.target) &&
                    menuBtn && !menuBtn.contains(e.target)) {
                    setSidebarOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, sidebarOpen]);

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white">
            {/* Mobile Header with Menu Button */}
            {isMobile && (
                <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-md z-50 px-4 py-3 flex items-center justify-between">
                    <button
                        id="menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                        {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                    <h1 className="text-lg font-bold text-amber-500">WMS</h1>
                    <div className="w-8"></div> {/* Spacer for alignment */}
                </div>
            )}

            {/* Overlay for mobile */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div id="main-sidebar">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main Content Area */}
            <div className={`
                transition-all duration-300 min-h-screen
                ${!isMobile ? 'lg:ml-72' : ''}
            `}>
                {/* Mobile spacer for fixed header */}
                {isMobile && <div className="h-14"></div>}

                {/* Only show Navbar on desktop */}
                {!isMobile && <Navbar />}

                <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-140px)]">
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default DashboardLayout;