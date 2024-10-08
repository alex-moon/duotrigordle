import cn from "classnames";
import { useEffect, useState } from "react";
import {
    Challenge,
    gameAction, getAllAutosolves, getAllDeductions, getAllGuessColors,
    getCompletedBoardsCount,
    getDailyId,
    getIsGameOver,
    getTargetWords,
    NUM_BOARDS,
    storageAction,
    uiAction,
    useAppDispatch,
    useAppSelector,
} from "../../store";
import { range } from "../../util";
import { LinkButton } from "../common/LinkButton/LinkButton";
import { TabButtons } from "../common/TabButtons/TabButtons";
import styles from "./Welcome.module.css";

export function Welcome() {
  const [tabIdx, setTabIdx] = useState(0);

  return (
    <div className={cn(styles.welcome, tabIdx === 1 && styles.practice)}>
      <TabButtons
        tabs={["Daily", "Practice"]}
        idx={tabIdx}
        onTabChange={setTabIdx}
      />
      <div className={styles.tabContainer}>
        {tabIdx === 0 ? <DailyTab /> : <PracticeTab />}
      </div>
    </div>
  );
}

function DailyTab() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(storageAction.pruneSaves({ timestamp: Date.now() }));
  }, [dispatch]);

  return (
    <>
      <DailyLink
        title="Daily Duotrigordle"
        description="Solve 32 wordles at the same time"
        challenge="normal"
      />
      <DailyLink
        title="Daily Sequence"
        description="The next board is revealed only after solving the current board"
        challenge="sequence"
      />
      <DailyLink
        title="Daily Jumble"
        description="Tired of using the same starting words? The first 3 words are randomly chosen for you"
        challenge="jumble"
      />
    </>
  );
}

type DailyLinkProps = {
  title: string;
  description: string;
  challenge: "normal" | "sequence" | "jumble";
};
function DailyLink(props: DailyLinkProps) {
  const dispatch = useAppDispatch();
  const gameSave = useAppSelector((s) => s.storage.daily)[props.challenge];

  const handleClick = () => {
    const timestamp = Date.now();
    const dailyId = getDailyId(timestamp);
    if (gameSave && gameSave.id === dailyId) {
      dispatch(gameAction.loadSave({ timestamp, challenge: props.challenge }));
    } else {
      dispatch(
        gameAction.start({
          gameMode: "daily",
          challenge: props.challenge,
          timestamp,
        })
      );
    }
    dispatch(uiAction.setView("game"));
  };

  if (!gameSave) {
    return (
      <div className={styles.gameMode}>
        <LinkButton className={styles.link} onClick={handleClick}>
          {props.title}
        </LinkButton>
        <p>{props.description}</p>
      </div>
    );
  }

  const targets = getTargetWords(gameSave.id, props.challenge);
  const guesses = gameSave.guesses;
  const colors = getAllGuessColors(targets, guesses);
  const deductions = getAllDeductions(guesses, colors);
  const autosolves = getAllAutosolves(colors, deductions);
  const boardsComplete = getCompletedBoardsCount(targets, guesses, autosolves);
  const gameOver = getIsGameOver(targets, guesses, autosolves, props.challenge);

  return (
    <div className={styles.gameMode}>
      <LinkButton className={styles.link} onClick={handleClick}>
        {gameOver ? "View Results" : "Continue"}
      </LinkButton>
      <p>
        {props.title} #{gameSave.id} ({boardsComplete}/{NUM_BOARDS})
      </p>
    </div>
  );
}

function PracticeTab() {
  const dispatch = useAppDispatch();
  const todaysId = getDailyId(Date.now());
  const [archiveId, setArchiveId] = useState(() => todaysId - 1);
  const [archiveChallenge, setArchiveChallenge] = useState<Challenge>("normal");

  const handleNewPracticeGameClick = (challenge: Challenge) => {
    dispatch(
      gameAction.start({
        gameMode: "practice",
        challenge,
        timestamp: Date.now(),
      })
    );
    dispatch(uiAction.setView("game"));
  };

  const handleNewArchiveClick = () => {
    dispatch(
      gameAction.start({
        gameMode: "historic",
        challenge: archiveChallenge,
        timestamp: Date.now(),
        id: archiveId,
      })
    );
    dispatch(uiAction.setView("game"));
  };

  return (
    <>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("normal")}
        >
          Practice Duotrigordle
        </LinkButton>
        <p>Solve 32 wordles at the same time</p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("sequence")}
        >
          Practice Sequence
        </LinkButton>
        <p>The next board is revealed only after solving the current board</p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("jumble")}
        >
          Practice Jumble
        </LinkButton>
        <p>
          Tired of using the same starting words? The first 3 words are randomly
          chosen for you
        </p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton
          className={styles.link}
          onClick={() => handleNewPracticeGameClick("perfect")}
        >
          Perfect Challenge
        </LinkButton>
        <p>
          The ultimate duotrigordle challenge! Can you complete 32 boards
          without making a single mistake?
        </p>
      </div>
      <div className={styles.gameMode}>
        <LinkButton className={styles.link} onClick={handleNewArchiveClick}>
          Archive
        </LinkButton>
        <p className={styles.archiveDescription}>
          <span>Play historic </span>
          <select
            className={styles.archiveSelect}
            value={archiveChallenge}
            onChange={(e) => setArchiveChallenge(e.target.value as "normal")}
          >
            <option value="normal">duotrigordle</option>
            <option value="sequence">sequence</option>
            <option value="jumble">jumble</option>
          </select>
          <select
            className={styles.archiveSelect}
            value={archiveId}
            onChange={(e) => setArchiveId(parseInt(e.target.value, 10))}
          >
            {range(1, todaysId).map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </p>
      </div>
    </>
  );
}
