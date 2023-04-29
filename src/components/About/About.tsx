import {useEffect, useState} from "react";
import {START_DATE, useAppSelector,} from "../../store";
import {Modal} from "../common/Modal/Modal";
import styles from "./About.module.css";

export function About() {
  const shown = useAppSelector((s) => s.ui.modal === "about");

  return (
    <Modal shown={shown}>
      <InfoContent />
    </Modal>
  );
}

function InfoContent() {
  const [timeRemaining, setHoursRemaining] = useState(getHoursRemaining);

  useEffect(() => {
    const handle = setInterval(
      () => setHoursRemaining(getHoursRemaining),
      1000
    );
    return () => clearInterval(handle);
  }, []);

  return (
    <div className={styles.overflow}>
      <p><b>This is not the original Duotrigordle.</b></p>
      <p>
          The original Duotrigordle can be found at{" "}
          <a target="_blank" href="https://duotrigordle.com" rel="noreferrer">duotrigordle.com</a>.
      </p>
      <hr className={styles.seperator} />
      <p>
          Welcome to <b>Autosolving Duotrigordle</b>. This is a fork of the
          original Duotrigordle, with two additional features:
          <ul>
              <li>
                  <b>Deductions:</b>{" "}
                  any yellow letters whose placement can be deduced are
                  highlighted in pink.
              </li>
              <li>
                  <b>Autosolving:</b>{" "}
                  any words that can be solved given guesses and deductions
                  are. These are also highlighted in pink.
              </li>
          </ul>
      </p>
      <hr className={styles.seperator} />
      <p>
        A new Daily Autosolving Duotrigordle will be available in{" "}
        {timeRemaining.hr}h&nbsp;{timeRemaining.min}m&nbsp;{timeRemaining.sec}s.
      </p>
      {/*<hr className={styles.seperator} />*/}
      {/*<div className={styles.footer}>*/}
      {/*  <a*/}
      {/*    target="_blank"*/}
      {/*    href="https://duotrigordle.com/privacy.html"*/}
      {/*    rel="noreferrer"*/}
      {/*  >*/}
      {/*    Privacy Policy*/}
      {/*  </a>*/}
      {/*</div>*/}
    </div>
  );
}

function getHoursRemaining() {
  const diff = Date.now() - START_DATE;
  const hr = Math.floor(24 - ((diff / 1000 / 60 / 60) % 24));
  const min = Math.floor(60 - ((diff / 1000 / 60) % 60));
  const sec = Math.floor(60 - ((diff / 1000) % 60));
  return { hr, min, sec };
}
