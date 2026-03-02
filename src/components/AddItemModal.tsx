import { Button } from "./ui/Button";
import { generateId } from "../utils/generateId";
import { useState } from "react";
import { Card } from "./ui/Card";
import { ListItem } from "../types/list";
import { createPortal } from "react-dom";
import styles from "./AddItemModal.module.css";

export const AddItemModal = ({ isOpen, onClose, addItem }: { isOpen: boolean, onClose: () => void, addItem: (item: ListItem) => void }) => {
  const [inputValue, setInputValue] = useState("");	

  const handleAddItem = () => {
    addItem({
      id: generateId(),
      text: inputValue,
    });
    setInputValue("");
    onClose();
  };

  const getModalRoot = () => {
    const el = document.getElementById("modal-root");
    if (!el) throw new Error("Missing #modal-root in public/index.html");
    return el;
  };

  return (isOpen && createPortal(
    <div className="backdrop" onClick={onClose} role="presentation">
      <div className={styles.modalOverlay} onClick={(e) => e.stopPropagation()}>
        <Card>
          <div className={styles.modalTitle}>
            <p>Add Item to list</p>
          </div>
          <input type="text" placeholder="Type the text here..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} className={styles.modalInput} />
          <div className={styles.modalButtons}>
            <Button onClick={handleAddItem}>ADD</Button>
            <Button onClick={onClose} variant="secondary">CANCEL</Button>
          </div>
        </Card>
      </div>
    </div>,
    getModalRoot()
  )) || null;
};