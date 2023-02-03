import { gameAction, useAppDispatch } from "../../store";
import styles from "./Keyboard.module.css";
const { key, keyboard, row1, row2, row3, spacer } = styles;

export function Keyboard() {
  return (
    <div className={keyboard}>
      <div className={row1}>
        <Key char="Q" />
        <Key char="W" />
        <Key char="E" />
        <Key char="R" />
        <Key char="T" />
        <Key char="Y" />
        <Key char="U" />
        <Key char="I" />
        <Key char="O" />
        <Key char="P" />
      </div>
      <div className={row2}>
        <div className={spacer} />
        <Key char="A" />
        <Key char="S" />
        <Key char="D" />
        <Key char="F" />
        <Key char="G" />
        <Key char="H" />
        <Key char="J" />
        <Key char="K" />
        <Key char="L" />
        <div className={spacer} />
      </div>
      <div className={row3}>
        <Key char="backspace" />
        <Key char="Z" />
        <Key char="X" />
        <Key char="C" />
        <Key char="V" />
        <Key char="B" />
        <Key char="N" />
        <Key char="M" />
        <Key char="enter" />
      </div>
    </div>
  );
}

type KeyProps = {
  char: string;
};
function Key(props: KeyProps) {
  const dispatch = useAppDispatch();
  const char =
    props.char === "backspace"
      ? "⌫"
      : props.char === "enter"
      ? "⏎"
      : props.char;

  const handleClick =
    props.char === "backspace"
      ? () => dispatch(gameAction.inputBackspace())
      : props.char === "enter"
      ? () => dispatch(gameAction.inputEnter({ timestamp: Date.now() }))
      : () => dispatch(gameAction.inputLetter({ letter: props.char }));

  return (
    <button className={key} onClick={handleClick}>
      {char}
    </button>
  );
}
