import { render, screen } from "@testing-library/react";
import { ItemList } from "./ItemList";
import type { ListItem } from "../../types/list";

// Mock CSS module
jest.mock("./ItemList.module.css", () => ({
  list: "list",
}));

// Mock del componente Item para inspeccionar props
const mockItemComponent = jest.fn();

jest.mock("./Item", () => ({
  Item: (props: any) => {
    mockItemComponent(props);
    return <li data-testid={`item-${props.item.id}`}>{props.item.text}</li>;
  },
}));

const items: ListItem[] = [
  { id: "a", text: "Item A" },
  { id: "b", text: "Item B" },
  { id: "c", text: "Item C" },
];

describe("ItemList", () => {
  beforeEach(() => {
    mockItemComponent.mockClear();
  });

  it("renderiza todos los items", () => {
    render(
      <ItemList
        items={items}
        selectedIds={[]}
        onClickItem={jest.fn()}
        onDeleteItem={jest.fn()}
      />
    );

    expect(screen.getByTestId("item-a")).toBeInTheDocument();
    expect(screen.getByTestId("item-b")).toBeInTheDocument();
    expect(screen.getByTestId("item-c")).toBeInTheDocument();
  });

  it("marca selected correctamente según selectedIds", () => {
    render(
      <ItemList
        items={items}
        selectedIds={["b"]}
        onClickItem={jest.fn()}
        onDeleteItem={jest.fn()}
      />
    );

    // El mock guarda todas las llamadas a <Item />
    const propsB = mockItemComponent.mock.calls.find(
      ([props]) => props.item.id === "b"
    )[0];

    const propsA = mockItemComponent.mock.calls.find(
      ([props]) => props.item.id === "a"
    )[0];

    expect(propsB.selected).toBe(true);
    expect(propsA.selected).toBe(false);
  });

  it("pasa correctamente los callbacks", () => {
    const onClickItem = jest.fn();
    const onDeleteItem = jest.fn();

    render(
      <ItemList
        items={items}
        selectedIds={[]}
        onClickItem={onClickItem}
        onDeleteItem={onDeleteItem}
      />
    );

    const firstCallProps = mockItemComponent.mock.calls[0][0];

    expect(firstCallProps.onClickItem).toBe(onClickItem);
    expect(firstCallProps.onDeleteItem).toBe(onDeleteItem);
  });
});