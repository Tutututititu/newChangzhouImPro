import React from 'react';
import styled, { css } from 'styled-components';

const UNREAD_WARN_RED = '#ff4d4f';
const UNREAD_WARN_WHITE = '#fff';

const StyledUnreadWarn = styled.div`
  display: inline-block;
  margin-left: 5px;
  border-radius: 50%;
  background: ${UNREAD_WARN_RED};
  color: ${UNREAD_WARN_WHITE};
  text-align: center;
  font-size: 9px;
  vertical-align: middle;

  ${(props) =>
    props.unRead <= 99 &&
    css`
      width: 20px;
      height: 20px;
      line-height: 18px;
      border-radius: 48%;
      padding: 1px 2px;
    `}

  ${(props) =>
    props.unRead === 0 &&
    css`
      width: 8px;
      height: 8px;
      line-height: 16px;
      border-radius: 48%;
      padding: 1px 2px;
    `}

  ${(props) =>
    props.unRead >= 100 &&
    css`
      width: 24px;
      height: 16px;
      line-height: 16px;
      border-radius: 48%;
      padding: 1px 2px;
    `}
`;

const UnreadWarn = ({ unRead = 0, white = false }) => {
  const cUnRead = Number.parseInt(unRead, 10);
  if (Number.isNaN(cUnRead)) {
    return null;
  }
  const unReadText = ((num) => {
    if (num <= 99 && num > 0) {
      return num.toString();
    } else if (num === 0) {
      return '';
    } else {
      return `99+`;
    }
  })(cUnRead);

  return <StyledUnreadWarn unRead={unRead}>{unReadText}</StyledUnreadWarn>;
};

export default UnreadWarn;
