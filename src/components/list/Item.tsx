import { ListItem } from "../../types/list";
import styles from "./Item.module.css";

export const Item = ({ item, selected, onClickItem, onDeleteItem }: { item: ListItem, selected: boolean, onClickItem: (id: string) => void, onDeleteItem: (id: string) => void }) => {
  const handleSelectItem = () => {
    onClickItem(item.id);
  };

  const handleDeleteItem = () => {
    onDeleteItem(item.id);
  };

  return (
    <li className={`${styles.item} ${selected ? styles.selected : ""}`} onClick={handleSelectItem} onDoubleClick={handleDeleteItem}>
      <span>{item.text}</span>
    </li>
  );
};