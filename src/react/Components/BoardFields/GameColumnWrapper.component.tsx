import { ColumnPile } from "../Piles/Piles.items";
import React from "react";
import { RootReducerState } from "../../../global";
import { Row } from "antd";
import { useSelector } from "react-redux";

/**
 * Component that unites all the column piles
 */
function GameColumnWrapper() {
  // get piles from redux
  const { columns } = useSelector(({ Columns }: RootReducerState) => ({
    columns: Columns.columns || {
      column1Pile: [],
      column2Pile: [],
      column3Pile: [],
      column4Pile: [],
      column5Pile: [],
      column6Pile: [],
      column7Pile: []
    }
  }));

  const {
    column1Pile,
    column2Pile,
    column3Pile,
    column4Pile,
    column5Pile,
    column6Pile,
    column7Pile
  } = columns;

  return (
    <Row gutter={6} className="gameColumnsRow" align="middle">
      <ColumnPile columnId="column1Pile" columnCards={column1Pile} offset={2} />
      <ColumnPile columnId="column2Pile" columnCards={column2Pile} />
      <ColumnPile columnId="column3Pile" columnCards={column3Pile} />
      <ColumnPile columnId="column4Pile" columnCards={column4Pile} />
      <ColumnPile columnId="column5Pile" columnCards={column5Pile} />
      <ColumnPile columnId="column6Pile" columnCards={column6Pile} />
      <ColumnPile columnId="column7Pile" columnCards={column7Pile} />
    </Row>
  );
}

export default GameColumnWrapper;
