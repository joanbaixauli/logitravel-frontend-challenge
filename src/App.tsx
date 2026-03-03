import { useState } from 'react';

import { RotateCcw } from 'lucide-react';

import './App.css';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { AddItemModal } from './components/AddItemModal';
import { ItemList } from './components/list/ItemList';
import { useList } from './hooks/useList';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { items, selectedIds, canUndo, setSelectedIds, addItem, removeItem, removeItems, undo } = useList();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUndo = () => {
    undo();
  };

  const handleDeleteItem = (id: string) => {
    removeItem(id);
  };

  const handleDeleteItems = () => {
    removeItems(selectedIds);
  };

  const handleClickItem = (itemId: string) => {
    setSelectedIds(selectedIds.includes(itemId) ? selectedIds.filter((id) => id !== itemId) : [...selectedIds, itemId]);
  };

  return (
    <div className="App">
      <div className="cardContainer">
        <Card>
          <div className="cardContent">
            <div className="title">
              <h1>This is a technical proof</h1>
            </div>
            <div className="description">
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Dignissimos corporis vero asperiores velit,
                molestiae est quisquam ex eaque vitae sed. Tempore et incidunt magni totam recusandae nobis mollitia!
                Adipisci, optio.
              </p>
            </div>
          </div>
          <ItemList
            items={items}
            selectedIds={selectedIds}
            onClickItem={handleClickItem}
            onDeleteItem={handleDeleteItem}
          />
          {/* Botones de acción */}
          <div className="cardActions">
            <div className="leftButtons">
              <Button onClick={handleUndo} variant="secondary" disabled={!canUndo} aria-label="Undo">
                <RotateCcw size={18} />
              </Button>
              <Button onClick={handleDeleteItems} variant="secondary" disabled={selectedIds.length === 0}>
                DELETE
              </Button>
            </div>
            <div className="rightButtons">
              <Button onClick={handleOpenModal}>ADD</Button>
            </div>
          </div>
        </Card>
      </div>
      <AddItemModal isOpen={isModalOpen} onClose={handleCloseModal} addItem={addItem} />
    </div>
  );
}

export default App;
