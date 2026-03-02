import { render, screen, fireEvent, within } from "@testing-library/react";
import { Item } from "./Item";
import type { ListItem } from "../../types/list";

// Mock CSS module (evita problemas en Jest)
jest.mock("./Item.module.css", () => ({
  item: "item",
  selected: "selected",
}));

const mockItem: ListItem = {
  id: "1",
  text: "Test item",
};

describe("Item", () => {
  it("renderiza el texto correctamente", () => {
    render(
      <Item
        item={mockItem}
        selected={false}
        onClickItem={jest.fn()}
        onDeleteItem={jest.fn()}
      />
    );

    expect(screen.getByText("Test item")).toBeInTheDocument();
  });

  it("aplica clase selected cuando selected=true", () => {
    render(
      <Item
        item={mockItem}
        selected={true}
        onClickItem={jest.fn()}
        onDeleteItem={jest.fn()}
      />
    );

    const listItems = screen.getAllByRole("listitem");
    const li = listItems.find(item => 
      within(item).queryByText("Test item") !== null
    )!;
    expect(li).toHaveClass("selected");
  });

  it("no aplica clase selected cuando selected=false", () => {
    render(
      <Item
        item={mockItem}
        selected={false}
        onClickItem={jest.fn()}
        onDeleteItem={jest.fn()}
      />
    );

    const listItems = screen.getAllByRole("listitem");
    const li = listItems.find(item => 
      within(item).queryByText("Test item") !== null
    )!;
    expect(li).not.toHaveClass("selected");
  });

  it("click llama onClickItem con el id correcto", () => {
    const onClickItem = jest.fn();

    render(
      <Item
        item={mockItem}
        selected={false}
        onClickItem={onClickItem}
        onDeleteItem={jest.fn()}
      />
    );

    fireEvent.click(screen.getByText("Test item"));
    expect(onClickItem).toHaveBeenCalledWith("1");
  });

  it("double click llama onDeleteItem con el id correcto", () => {
    const onDeleteItem = jest.fn();

    render(
      <Item
        item={mockItem}
        selected={false}
        onClickItem={jest.fn()}
        onDeleteItem={onDeleteItem}
      />
    );

    fireEvent.doubleClick(screen.getByText("Test item"));
    expect(onDeleteItem).toHaveBeenCalledWith("1");
  });
});