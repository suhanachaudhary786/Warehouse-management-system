
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function DashboardLayout({
    children,
}) {
    return (
        <div
            className="
      bg-slate-50
      dark:bg-slate-950
      min-h-screen
      text-slate-900
      dark:text-white
      "
        >
            <Sidebar />

            <div className="ml-72">
                <Navbar />

                <main
                    className="
          p-8
          min-h-[calc(100vh-140px)]
          "
                >
                    {children}
                </main>

                <Footer />
            </div>
        </div>
    );
}

export default DashboardLayout;