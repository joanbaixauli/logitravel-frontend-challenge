import { ListItem } from "../../types/list";
import { Item } from "./Item";
import styles from "./ItemList.module.css";

export const ItemList = ({ items, selectedIds, onClickItem, onDeleteItem }: { items: ListItem[], selectedIds: string[], onClickItem: (id: string) => void, onDeleteItem: (id: string) => void }) => {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <Item key={item.id} item={item} selected={selectedIds.includes(item.id)} onClickItem={onClickItem} onDeleteItem={onDeleteItem} />
      ))}
    </ul>
  );
};