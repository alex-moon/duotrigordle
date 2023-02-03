import { ReactNode } from "react";
import styles from "./Button.module.css";
const { button } = styles;
import cn from "classnames";

type ButtonProps = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
};
export function Button({ className, onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className={cn(button, className)}>
      {children}
    </button>
  );
}
