import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  mode: string;
  text: string;
}

const Button = ({ mode, text, ...props }: ButtonProps) => {
  return (
    <>
      {mode === "white" && (
        <button
          {...props}
          className="bg-white text-primary text-center text-xl border border-gray-400 font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          {text}
        </button>
      )}

      {mode === "primary" && (
        <button
          {...props}
          className="text-white bg-primary text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          {text}
        </button>
      )}

      {mode === "secondary" && (
        <button
          {...props}
          className="text-white bg-secondary text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          {text}
        </button>
      )}

      {mode === "transparent" && (
        <button
          {...props}
          className="text-primary border-primary border-2 text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          {text}
        </button>
      )}

      {mode !== "white" && mode !== "primary" && mode !== "secondary" && mode !== "transparent" && (
        <p>No valid mode selected</p>
      )}
    </>
  );
};
export default Button;
