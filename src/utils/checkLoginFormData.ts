import toast from "react-hot-toast";

export const checkLoginFormData = (data: {
  [k: string]: FormDataEntryValue;
}) => {
  const { email, password } = data;

  if (!email || !password) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (typeof email === "string" && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  return true;
};
