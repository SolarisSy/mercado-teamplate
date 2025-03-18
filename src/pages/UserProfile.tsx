import { useEffect, useState } from "react";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import { checkUserProfileFormData } from "../utils/checkUserProfileFormData";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";
import { logoutUser } from "../firebase/auth";
import { useAuth } from "../context/AuthContext";

interface User {
  id: string;
  name?: string;
  lastname?: string;
  email?: string;
  password?: string;
  photoURL?: string;
  provider?: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { currentUser } = useAuth();

  const logout = async () => {
    try {
      // Firebase logout
      if (user?.provider === "google") {
        await logoutUser();
      }
      
      // Local logout
      toast.success("Logged out successfully");
      localStorage.removeItem("user");
      store.dispatch(setLoginStatus(false));
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const fetchUser = async (userId: string) => {
    try {
      // Verificar se o usuário é um usuário do Firebase
      if (currentUser && (user?.provider === "google" || user?.provider === "firebase")) {
        // Para usuários do Firebase, podemos usar as informações do próprio Firebase
        setUser({
          id: currentUser.uid,
          name: currentUser.displayName?.split(' ')[0] || '',
          lastname: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
          email: currentUser.email || '',
          photoURL: currentUser.photoURL || '',
          provider: user?.provider || "firebase"
        });
        return;
      }
      
      // Para usuários normais, buscar da API
      const response = await customFetch.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
      navigate("/login");
    }
  };

  const updateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Não permitir atualização para usuários do Google
    if (user?.provider === "google") {
      toast.error("Google accounts cannot be updated through this form");
      return;
    }
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    // Check if form data is valid
    if (!checkUserProfileFormData(data)) return;
    
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.id) {
      try {
        await customFetch.put(`/users/${storedUser.id}`, data);
        toast.success("User updated successfully");
        // Atualiza os dados do usuário no localStorage
        localStorage.setItem("user", JSON.stringify({...storedUser, ...data}));
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Failed to update user data");
      }
    } else {
      toast.error("Please login to update your profile");
      navigate("/login");
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser?.id) {
      toast.error("Please login to view this page");
      navigate("/login");
    } else {
      fetchUser(storedUser.id);
    }
  }, [navigate, currentUser]);

  if (!user) {
    return <div className="max-w-screen-lg mx-auto mt-24 px-5">Loading...</div>;
  }

  // Renderização condicional baseada no tipo de usuário
  const isGoogleUser = user.provider === "google";

  return (
    <div className="max-w-screen-lg mx-auto mt-24 px-5">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      
      {isGoogleUser && (
        <div className="mb-6 flex flex-col items-center">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-20 h-20 rounded-full mb-4"
            />
          )}
          <p className="text-lg mb-2">Logged in with Google</p>
          <p className="text-gray-600">{user.email}</p>
        </div>
      )}
      
      {!isGoogleUser && (
        <form className="flex flex-col gap-6" onSubmit={updateUser}>
          <div className="flex flex-col gap-1">
            <label htmlFor="name">First Name</label>
            <input
              type="text"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter first name"
              id="name"
              name="name"
              defaultValue={user.name}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter last name"
              id="lastname"
              name="lastname"
              defaultValue={user.lastname}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter email address"
              id="email"
              name="email"
              defaultValue={user.email}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter password"
              id="password"
              name="password"
              defaultValue={user.password}
            />
          </div>
          <Button type="submit" text="Update Profile" mode="brown" />
        </form>
      )}
      
      <div className="mt-6 flex flex-col gap-4">
        <Link
          to="/order-history"
          className="bg-white text-black text-center text-xl border border-gray-400 font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          Order History
        </Link>
        <Button onClick={logout} text="Logout" mode="white" />
      </div>
    </div>
  );
};

export default UserProfile;
