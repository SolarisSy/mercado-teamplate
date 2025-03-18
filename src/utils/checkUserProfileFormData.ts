import toast from "react-hot-toast";

export const checkUserProfileFormData = (data: {
  [k: string]: FormDataEntryValue;
}) => {
  const { name, lastname, email, password } = data;

  // Se todos os campos estiverem vazios, não há nada para atualizar
  if (!name && !lastname && !email && !password) {
    toast.error("Please fill in at least one field to update");
    return false;
  }

  // Validar campos preenchidos
  if (name && typeof name === "string" && name.trim().length < 2) {
    toast.error("Name must be at least 2 characters long");
    return false;
  }

  if (lastname && typeof lastname === "string" && lastname.trim().length < 2) {
    toast.error("Last name must be at least 2 characters long");
    return false;
  }

  if (email && typeof email === "string" && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  if (password && typeof password === "string" && password.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return false;
  }

  return true;
};
