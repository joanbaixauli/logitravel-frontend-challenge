import { Button } from './ui/Button';
import { generateId } from '../utils/generateId';
import { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Card';
import type { ListItem } from '../types/list';
import styles from './AddItemModal.module.css';

export const AddItemModal = ({
  isOpen,
  onClose,
  addItem,
}: {
  isOpen: boolean;
  onClose: () => void;
  addItem: (item: ListItem) => void;
}) => {
  const [inputValue, setInputValue] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal?.();
    } else {
      dialog.close?.();
    }
  }, [isOpen]);

  const handleDialogClose = () => {
    onClose();
  };

  const handleAddItem = () => {
    if (inputValue.trim() === '') return;

    addItem({
      id: generateId(),
      text: inputValue,
    });
    setInputValue('');
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={handleDialogClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-item-dialog-label"
    >
      <div className={styles.modalOverlay}>
        <Card>
          <div className={styles.modalTitle}>
            <label id="add-item-dialog-label" htmlFor="add-item-input">
              Add Item to list
            </label>
          </div>
          <input
            id="add-item-input"
            type="text"
            placeholder="Type the text here..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={styles.modalInput}
          />
          <div className={styles.modalButtons}>
            <Button onClick={handleAddItem}>ADD</Button>
            <Button onClick={onClose} variant="secondary">
              CANCEL
            </Button>
          </div>
        </Card>
      </div>
    </dialog>
  );
};
