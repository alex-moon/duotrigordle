import cn from "classnames";
import React, { useEffect, useMemo, useRef } from "react";
import {
  getGhostLetters,
  getSequenceVisibleBoard,
  getWarnHint,
  NUM_BOARDS,
  NUM_GUESSES,
  uiAction,
  useAppDispatch,
  useAppSelector,
  WORDS_VALID,
} from "../../store";
import { range } from "../../util";
import styles from "./Boards.module.css";

export function Boards() {
  const wideMode = useAppSelector((s) => s.settings.wideMode);
  const colorBlind = useAppSelector((s) => s.settings.colorBlindMode);
  const disableAnimations = useAppSelector((s) => s.settings.disableAnimations);

  return (
    <div
      className={cn(
        styles.boards,
        disableAnimations && styles.disableAnimations,
        wideMode && styles.wide,
        colorBlind && styles.colorBlind
      )}
    >
      {range(32).map((i) => (
        <Board key={i} idx={i} />
      ))}
    </div>
  );
}

type BoardProps = {
  idx: number;
};
function Board(props: BoardProps) {
  const dispatch = useAppDispatch();
  const targets = useAppSelector((s) => s.game.targets);
  const guesses = useAppSelector((s) => s.game.guesses);
  const gameOver = useAppSelector((s) => s.game.gameOver);
  const isHighlighted = useAppSelector(
    (s) => s.ui.highlightedBoard === props.idx
  );
  const guessColors = useAppSelector((s) => s.game.colors[props.idx]);
  const deductions = useAppSelector((s) => s.game.deductions[props.idx]);
  const deduction = deductions.length > 0 ? deductions[deductions.length - 1] : '     ';
  const autosolves = useAppSelector((s) => s.game.autosolves);
  const autosolvedAt = autosolves[props.idx];
  const hideBoard = useAppSelector((s) => s.settings.hideCompletedBoards);
  const hideEmptyRows = useAppSelector((s) => s.settings.hideEmptyRows);
  const challenge = useAppSelector((s) => s.game.challenge);
  const disableAnimations = useAppSelector((s) => s.settings.disableAnimations);

  const target = targets[props.idx];
  const isConcealed = useMemo(() => {
    if (challenge === "sequence") {
      return props.idx > getSequenceVisibleBoard(targets, guesses, autosolves);
    } else {
      return false;
    }
  }, [challenge, props.idx, targets, guesses, autosolves]);
  const solvedAt = Math.max(guesses.indexOf(target), autosolvedAt);
  const complete = solvedAt !== -1;
  const coloredCount = complete ? solvedAt + 1 : guesses.length;
  const showInput = !complete && !gameOver && !isConcealed;
  const maxGuesses = challenge === "perfect" ? NUM_BOARDS : NUM_GUESSES;
  const emptyCount = hideEmptyRows
    ? 0
    : maxGuesses - coloredCount - (showInput ? 1 : 0);

  const isDimmed = !gameOver && complete && !hideBoard;
  const isHidden = !gameOver && complete && hideBoard;

  const scrollRef = useRef<HTMLDivElement>(null);
  const sideEffect = useAppSelector((s) => s.ui.sideEffects[0]);
  useEffect(() => {
    if (
      sideEffect &&
      sideEffect.type === "scroll-board-into-view" &&
      sideEffect.board === props.idx
    ) {
      scrollRef.current?.scrollIntoView({
        behavior: disableAnimations ? "auto" : "smooth",
        block: "nearest",
      });
      dispatch(uiAction.resolveSideEffect(sideEffect.id));
    }
  }, [disableAnimations, dispatch, props.idx, sideEffect]);

  const words = guesses.map((guess, i) => {
    return autosolvedAt === i ? target : guess;
  });
  const colors = guessColors.map((color, i) => {
    return autosolvedAt === i ? 'PPPPP' : color;
  });

  return (
    <div
      className={cn(
        styles.board,
        isHighlighted && styles.highlighted,
        isDimmed && styles.dimmed,
        isHidden && styles.hidden
      )}
      onClick={() => dispatch(uiAction.highlightClick(props.idx))}
    >
      <div ref={scrollRef} className={styles.scrollIntoView} />
      <ColoredRows
        words={words}
        colors={colors}
        count={coloredCount}
        concealed={isConcealed}
      />
      {showInput ? <InputRow guesses={guesses} colors={guessColors} deduction={deduction} /> : null}
      <EmptyRows count={emptyCount} />
    </div>
  );
}

type ColoredRowsProps = {
  words: string[];
  colors: string[];
  count: number;
  concealed: boolean;
};
const ColoredRows = React.memo(function ColoredRows(props: ColoredRowsProps) {
  if (props.concealed) {
    return (
      <>
        {range(props.count * 5).map((i) => (
          <Cell key={i} char="?" color={"B"} />
        ))}
      </>
    );
  }
  return (
    <>
      {range(props.count * 5).map((i) => {
        const row = Math.floor(i / 5);
        const idx = i % 5;
        return (
          <Cell
            key={i}
            char={props.words[row][idx]}
            color={props.colors[row][idx] as "B"}
          />
        );
      })}
    </>
  );
});

type EmptyRowsProps = {
  count: number;
};
const EmptyRows = React.memo(function EmptyRows(props: EmptyRowsProps) {
  return (
    <>
      {range(props.count * 5).map((i) => (
        <Cell key={i} />
      ))}
    </>
  );
});

type InputRowProps = {
  guesses: string[];
  colors: string[];
  deduction: string;
};
function InputRow(props: InputRowProps) {
  const { guesses, colors, deduction } = props;
  const showHints = useAppSelector((s) => s.settings.showHints);
  const input = useAppSelector((s) => s.game.input);
  const sticky = useAppSelector((s) => s.settings.stickyInput);

  const ghostLetters = useMemo(
    () =>
      showHints
          ? getGhostLetters(guesses, colors, deduction)
          : range(5).map(() => ""),
    [showHints, guesses, colors, deduction]
  );

  const isError = input.length === 5 && !WORDS_VALID.has(input);
  const isWarn = useMemo(
    () => (showHints ? getWarnHint(input, guesses, colors) : false),
    [showHints, colors, guesses, input]
  );

  return (
    <>
      {range(5).map((i) => {
        let char: string;
        let textColor: "red" | "yellow" | "ghost" | "pink" | undefined;
        if (!showHints) {
          char = input[i];
          textColor = isError ? "red" : undefined;
        } else {
          char = input[i] ?? ghostLetters[i];
          if (input[i]) {
            textColor = isError ? "red" : isWarn ? "yellow" : undefined;
          } else {
            textColor = deduction[i] !== " " ? "pink" : ghostLetters[i] ? "ghost" : undefined;
          }
        }
        return (
          <Cell key={i} char={char} textColor={textColor} sticky={sticky} />
        );
      })}
    </>
  );
}

type CellProps = {
  char?: string;
  color?: "B" | "Y" | "G" | "P";
  textColor?: "red" | "yellow" | "ghost" | "pink";
  sticky?: boolean;
};
const Cell = React.memo(function Cell(props: CellProps) {
  return (
    <div
      className={cn(
        styles.cell,
        props.color === "B" && styles.black,
        props.color === "Y" && styles.yellow,
        props.color === "G" && styles.green,
        props.color === "P" && styles.pink,
        props.textColor === "red" && styles.textRed,
        props.textColor === "yellow" && styles.textYellow,
        props.textColor === "ghost" && styles.textGhost,
        props.textColor === "pink" && styles.textPink,
        props.sticky && styles.sticky
      )}
    >
      <span className={styles.letter}>{props.char}</span>
    </div>
  );
});
