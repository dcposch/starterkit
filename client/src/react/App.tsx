import React from "react";
import { Context } from "../types";
import styled from "styled-components";
import { observer } from "mobx-react";

export const App: React.FC<{ context: Context }> = observer(() => {
  return (
    <Container>
      <Inner></Inner>
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
