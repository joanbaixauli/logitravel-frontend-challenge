import type { ListItem } from '../../types/list';
import styles from './Item.module.css';

export type ItemProps = {
  item: ListItem;
  selected: boolean;
  onClickItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
};

export const Item = ({ item, selected, onClickItem, onDeleteItem }: ItemProps) => {
  const handleSelectItem = () => {
    onClickItem(item.id);
  };

  const handleDeleteItem = () => {
    onDeleteItem(item.id);
  };

  return (
    <li
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      onClick={handleSelectItem}
      onDoubleClick={handleDeleteItem}
      aria-selected={selected}
    >
      <span>{item.text}</span>
    </li>
  );
};
