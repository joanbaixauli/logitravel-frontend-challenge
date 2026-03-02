import styles from "./Card.module.css";

export const Card = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.card}>
      {children}
    </div>
  );
};