import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (prev: boolean) => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { loginStatus } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const logout = () => {
    toast.error("Logged out successfully");
    localStorage.removeItem("user");
    store.dispatch(setLoginStatus(false));
    navigate("/login");
  };

  useEffect(() => {
    if (isSidebarOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  return (
    <>
      {(isSidebarOpen || isAnimating) && (
        <div
          className={
            isSidebarOpen
              ? "fixed top-0 left-0 w-64 z-50 h-full transition-transform duration-300 ease-in-out bg-white shadow-lg transform border-r border-primary translate-x-0"
              : "fixed top-0 left-0 w-64 z-50 h-full transition-transform duration-300 ease-in-out bg-white shadow-lg transform border-r border-primary -translate-x-full"
          }
        >
          <div className="flex justify-end mr-1 mt-1">
            <HiXMark
              className="text-3xl cursor-pointer text-primary"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
          <div className="flex justify-center mt-2">
            <Link
              to="/"
              className="flex items-center justify-center"
            >
              <img 
                src="/img/marca_apoio_entrega@2x.png" 
                alt="Apoio Entrega" 
                className="h-12"
              />
            </Link>
          </div>
          <div className="flex flex-col items-center gap-1 mt-7">
            <Link
              to="/"
              className="py-2 border-y border-primary w-full block flex justify-center hover:bg-primary hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="py-2 border-y border-primary w-full block flex justify-center hover:bg-primary hover:text-white transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/search"
              className="py-2 border-y border-primary w-full block flex justify-center hover:bg-primary hover:text-white transition-colors"
            >
              Search
            </Link>
            {loginStatus ? (
              <>
                <button
                  onClick={logout}
                  className="py-2 border-y border-primary w-full block flex justify-center hover:bg-secondary hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-2 border-y border-primary w-full block flex justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="py-2 border-y border-primary w-full block flex justify-center hover:bg-primary hover:text-white transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
            <Link
              to="/cart"
              className="py-2 border-y border-primary w-full block flex justify-center hover:bg-primary hover:text-white transition-colors"
            >
              Cart
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
export default SidebarMenu;
