import React, { useEffect, useState } from "react";
import { Context } from "../types";
import styled from "styled-components";
import { observer } from "mobx-react";
import { reaction } from "mobx";
import { defineExitQuery, defineQuery, exists, Has, HasValue } from "@latticexyz/mobx-ecs";
import { Modal } from "./Modal";

export const App: React.FC<{ context: Context }> = observer(({ context }) => {
  const [modalText, setModalText] = useState("");

  useEffect(() => {
    const {
      world,
      components: { OwnedBy, Heart },
    } = context;
    const lostEntityQuery = defineExitQuery(world, [HasValue(OwnedBy, { value: context.signer.address })]);
    const ownedByQuery = defineQuery([HasValue(OwnedBy, { value: context.signer.address })]);
    return reaction(
      () => lostEntityQuery.get(),
      (lostEntities) => {
        if (lostEntities.size == 0) return;
        // If the player doesn't own a heart anymore, the game is lost
        if (
          ownedByQuery.get().size > 0 &&
          !exists([Has(Heart), HasValue(OwnedBy, { value: context.signer.address })])
        ) {
          setModalText("Game over");
        } else {
          // Flash a quick modal if the player lost an entity
          setModalText("Entity lost");
          setTimeout(() => setModalText(""), 300);
        }
      }
    );
  }, []);

  return (
    <Container>
      <Inner>{modalText && <Modal text={modalText} fontSize={"80px"} bgColor={"rgb(255,0,0,0.2)"} />}</Inner>
    </Container>
  );
});

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
`;

const Inner = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`;
