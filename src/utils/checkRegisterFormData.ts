import toast from "react-hot-toast";

export const checkRegisterFormData = (data: {
  [k: string]: FormDataEntryValue;
}) => {
  const { name, lastname, email, password } = data;

  if (!name || !lastname || !email || !password) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (typeof name === "string" && name.trim().length < 2) {
    toast.error("Name must be at least 2 characters long");
    return false;
  }

  if (typeof lastname === "string" && lastname.trim().length < 2) {
    toast.error("Last name must be at least 2 characters long");
    return false;
  }

  if (typeof email === "string" && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  if (typeof password === "string" && password.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return false;
  }

  return true;
};
