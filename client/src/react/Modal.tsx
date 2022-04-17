import React from "react";
import styled from "styled-components";

export const Modal: React.FC<{ text: string; bgColor: string; fontSize: string }> = ({ text, bgColor, fontSize }) => {
  return (
    <Container bgColor={bgColor} fontSize={fontSize}>
      {text}
    </Container>
  );
};

const Container = styled.div<{ bgColor: string; fontSize: string }>`
  height: 100%;
  width: 100%;
  background-color: ${(p) => p.bgColor};
  color: #fff;
  display: grid;
  justify-items: center;
  align-items: center;
  font-size: ${(p) => p.fontSize};
`;
