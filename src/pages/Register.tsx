import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components";
import { checkRegisterFormData } from "../utils/checkRegisterFormData";
import customFetch from "../axios/custom";
import toast from "react-hot-toast";
import { registerWithEmailAndPassword, signInWithGoogle } from "../firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";

const Register = () => {
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Get form data
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    // Check if form data is valid
    if (!checkRegisterFormData(data)) return;

    try {
      // Register with Firebase Authentication
      await registerWithEmailAndPassword(
        data.email as string,
        data.password as string,
        data.name as string,
        data.lastname as string
      );
      
      toast.success("User registered successfully! Please login.");
      navigate("/login");
    } catch (error) {
      // Errors are already handled and displayed in the registerWithEmailAndPassword function
      console.error("Registration error:", error);
    }
  };

  // Função para lidar com o login com o Google
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      
      if (result && result.user) {
        const { uid, email, displayName, photoURL } = result.user;
        
        // Salvar dados no localStorage e atualizar estado
        localStorage.setItem("user", JSON.stringify({
          id: uid,
          email: email,
          name: displayName || email?.split('@')[0],
          photoURL: photoURL,
          provider: "google"
        }));
        
        store.dispatch(setLoginStatus(true));
        toast.success("Login with Google successful!");
        navigate("/user-profile");
      }
    } catch (error) {
      console.error("Error logging in with Google:", error);
      // A mensagem de erro já é exibida na função signInWithGoogle
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto pt-24 flex items-center justify-center">
      <form
        onSubmit={handleRegister}
        className="max-w-5xl mx-auto flex flex-col gap-5 max-sm:gap-3 items-center justify-center max-sm:px-5"
      >
        <h2 className="text-5xl text-center mb-5 font-thin max-md:text-4xl max-sm:text-3xl max-[450px]:text-xl max-[450px]:font-normal">
          Register here:
        </h2>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-1">
            <label htmlFor="name">First Name</label>
            <input
              type="text"
              id="name"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter first name"
              name="name"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="lastname">Last Name</label>
            <input
              type="text"
              id="lastname"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter last name"
              name="lastname"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter email address"
              name="email"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="bg-white border border-black text-xl py-2 px-3 w-full outline-none max-[450px]:text-base"
              placeholder="Enter password"
              name="password"
            />
          </div>
        </div>
        <Button type="submit" text="Register" mode="brown" />
        
        {/* Divisor ou */}
        <div className="flex items-center w-full my-2">
          <div className="flex-grow h-px bg-gray-300"></div>
          <span className="px-4 text-gray-500">or</span>
          <div className="flex-grow h-px bg-gray-300"></div>
        </div>
        
        {/* Botão de login com Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition"
        >
          <FcGoogle size={24} />
          <span>Sign up with Google</span>
        </button>
        
        <Link
          to="/login"
          className="text-xl max-md:text-lg max-[450px]:text-sm mt-3"
        >
          Already have an account?{" "}
          <span className="text-secondaryBrown">Login now</span>.
        </Link>
      </form>
    </div>
  );
};

export default Register;
