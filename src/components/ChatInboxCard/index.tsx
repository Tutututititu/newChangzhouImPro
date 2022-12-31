import React, { useEffect, useState } from 'react';
import { Dropdown } from 'antd';
import styled from 'styled-components';
import ChatAvatar from '@/components/ChatAvatar';
import UnreadWarn from '@/components/UnreadWarn';
import moment from 'moment';
import { AudioMutedOutlined, CloseOutlined } from '@ant-design/icons';
import { ConversationType } from '@/constants';
import './chatLnboxCard.less';
let noMsg = require('../../assets/noMsg.png');

const AVATAR_SIZE = '42px';
const FONT_GREY = 'rgba(0, 0, 0, 0.43)';

const ChatInboxCarContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  margin: 4px 7px;
  padding: 6px 4px;
  width: 100%;
  align-items: center;
  cursor: pointer;
  border-radius: 4px;
`;

const ChatAvatarContainer = styled.div`
  width: 60px;
  height: ${AVATAR_SIZE};
  display: flex;
  align-items: center;
  flex-shrink: 0;
  text-align: right;
`;

const CardBody = styled.div`
  margin-left: 10px;
  width: calc(100% - 72px);
  overflow: hidden;
`;
const CardBodyLine = styled.div`
  line-height: 24px;
  margin-bottom: 4px;
`;
const CardBodyLineSmall = styled.div`
  line-height: 18px;
`;

const CardBodyLineRight = styled.span`
  float: right;
  clear: right;
`;

const CardName = styled.span`
  color: black;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 110px;
  display: inline-block;
`;

const CardTime = styled.span`
  font-size: 12px;
  color: ${FONT_GREY};
  overflow: hidden;
  max-width: 50%;
  line-height: 21px;
`;

const CardMessage = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: ${FONT_GREY};
  max-width: 112px;
  display: inline-block;
`;

const SpecailConvert = styled.span`
  color: rgba(255, 81, 25, 1);
`;

const TopModeIcon = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top: 10px solid rgba(0, 128, 225, 0.5);
  border-left: 10px solid transparent;
`;

const ChatInboxCard = (props) => {
  const {
    type,
    onCardClicked,
    topMode,
    sessionName,
    shieldMode,
    lastMsgSendTime: lastMsgSendTimeProps,
    unReadCount,
    lastMsg,
    subAvatarUrl,
    logoUrl,
    withCheckBox,
    extra,
    subUserIsConcern,
    editFunc,
    dropdownMenu,
  } = props;

  let converName = sessionName;

  const isActive = props.currentCid === props.cid;

  if (type === ConversationType.Single) {
    converName = props.singleSubUser?.nickName;
  } else if (type === ConversationType.Notify) {
    converName = '工作通知';
  }
  const [lastMsgSendTimeP, setLastMsgSendTimePropsv] =
    useState(lastMsgSendTimeProps);
  useEffect(() => {
    setLastMsgSendTimePropsv(lastMsgSendTimeP);
  }, [lastMsgSendTimeProps]);
  const clearUpDate = (date) => {
    if (
      moment(date ? date : '').format('YYYY-MM-DD') ==
      moment().format('YYYY-MM-DD')
    ) {
      return moment(date ? date : '').format('HH:mm');
    } else {
      return moment(date ? date : '').format('MM-DD');
    }
  };
  return (
    <Dropdown overlay={dropdownMenu} trigger={['contextMenu']}>
      <ChatInboxCarContainer
        onClick={onCardClicked}
        style={{ background: isActive ? '#F2F4F5' : '#fff' }}
      >
        {topMode && <TopModeIcon />}
        <ChatAvatarContainer>
          {isActive ? (
            <CloseOutlined
              style={{ marginRight: 3, color: 'rgba(0,0,0,0.25)' }}
              onClick={(e) => {
                e.stopPropagation();
                editFunc({ val: 'remove', props });
              }}
            />
          ) : (
            <span></span>
          )}
          <ChatAvatar
            type={props.type}
            name={converName ? converName : props.nickName}
            avatar={
              type === 'notify'
                ? 'https://gw.alipayobjects.com/mdn/rms_765f06/afts/img/A*t0ADTppRHdMAAAAAAAAAAAAAARQnAQ'
                : subAvatarUrl || logoUrl
            }
          />
        </ChatAvatarContainer>
        <CardBody>
          <CardBodyLine>
            <CardName>{converName || props.nickName}</CardName>
            {withCheckBox ? null : (
              <CardBodyLineRight>
                {lastMsgSendTimeP ? (
                  <CardTime>{clearUpDate(lastMsgSendTimeP)}</CardTime>
                ) : null}
              </CardBodyLineRight>
            )}
          </CardBodyLine>
          {withCheckBox ? null : (
            <CardBodyLineSmall>
              <CardMessage>
                {subUserIsConcern && (
                  <SpecailConvert>[特别关注] </SpecailConvert>
                )}
                {lastMsg}
              </CardMessage>
              <CardBodyLineRight>
                {shieldMode && <img className="noMsgIcon" src={noMsg}></img>}
                {Number(unReadCount) > 0 ? (
                  <UnreadWarn unRead={shieldMode ? 0 : Number(unReadCount)} />
                ) : null}
                {extra}
              </CardBodyLineRight>
            </CardBodyLineSmall>
          )}
        </CardBody>
      </ChatInboxCarContainer>
    </Dropdown>
  );
};

export default ChatInboxCard;
