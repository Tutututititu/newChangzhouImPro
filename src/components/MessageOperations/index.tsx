import React from 'antd';
import { useModel } from 'umi';
import { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import { Popover, List, message as Message } from 'antd';
import {
  MoreOutlined,
  MessageOutlined,
  SmileOutlined,
} from '@ant-design/icons';
import copy from 'copy-text-to-clipboard';
import classNames from 'classnames';
import moment from 'moment';

import TagModal from '@/components/TagModal';
import TransferMessageModal from '@/components/TransferMessageModal';
import { ContentType, ConversationType } from '@/constants';
import { defaultEnableOperate, MessageTypeCanOperate } from './config';

import { MessaageInChatBox } from '@/typings/chat';
import { EmojiList } from '@/typings/global';

import './style.less';

interface Props {
  className: string;
  onReply: (messageData: any) => void;
  onLater: () => void;
  onRecall: (messageData: any) => void;
  onDelete: (messageData: any) => void;
  onAddEmojiReply: (messageData: any) => void;
  onMultiSelect: () => void;
  messageData: MessaageInChatBox;
  converInfo: any;
}

const resolveStrongReminderContent = (msgType, content) => {
  switch (msgType) {
    case ContentType.Text:
      return content.text;
    case ContentType.Image:
      return content.pic;
    case ContentType.Face:
      return content.emoji;
    case ContentType.Voice:
      return content.url;
    case ContentType.File:
      return content.url;
    default:
      return msgType;
  }
};

export default function (props: Props) {
  const {
    mySdkStore,
    sdk,
    userInfo: { userId: myUserId, userName: myUserName },
    globalConverList,
    updateGlobalConverList,
  } = useModel('global');
  const {
    mockConfig: { userId },
  } = mySdkStore;
  const {
    className,
    onReply,
    onLater,
    onRecall,
    onDelete,
    onAddEmojiReply,
    onMultiSelect: handleMultiSelect,
    messageData,
    converInfo,
  } = props;

  const { cid, msgId, localMsgId, msgContent, msgType } = messageData;
  const { sessionName, subUserId } = converInfo;
  const [transferMessageModalVisible, setTransferMessageModalVisible] =
    useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const isSendBySelf = userId === messageData.from?.userId;
  const messageTypeCanOperateConfig = {
    ...defaultEnableOperate,
    ...MessageTypeCanOperate[msgType],
  };
  const [emojiList, setEmojiList] = useState(mySdkStore.emojiList || []);

  useEffect(() => {
    if (!emojiList?.length) {
      sdk.getEmojiById('all').then((data: EmojiList) => setEmojiList(data));
    }
  }, []);

  const handleTransfer = () => {
    setTransferMessageModalVisible(true);
  };

  const handleDing = async () => {
    await sdk.setCurrentCid(cid);
    const msgBody = {
      msgType: ContentType.StrongReminder,
      msgContent: {
        type: 0,
        receiversList: [subUserId],
        sourceCid: cid,
        sourceCname: sessionName,
        sourceMsgId: msgId,
        sourceContentType: msgType,
        sourceMessageContent: msgContent,
        content: resolveStrongReminderContent(msgType, msgContent),
        attachmentList: [],
        isTimed: false,
        scheduleSendTime: '',
        isSeparateSend: true,
        notifyInterval: 0,
        sendBySourceSession: true,
        sendNewMsgToSession: true,
        isSendBySingleSession: false,
      },
    };
    // const msgParams = sdk.messageBuilder(msgBody);
    // const sendSesData = await sdk.sendMessage(msgParams);
    try {
      const sendSesData = await sdk.sendStrongReminderMessage({
        content: msgBody.msgContent,
      });
      console.log('ding Resdata', sendSesData);
      // onSendMessageOk({ ...sendSesData, cid, from: { userId }, msgType: sendSesData.msgType?.toLowerCase()});
    } catch (e: any) {
      Message.success(e.errorMessage || e.message);
    }
  };

  const handleTransferOk = async (selectedItem: { cid: string }[]) => {
    await sdk.transferMessages({
      msgIds: [{ msgId }],
      originalCid: cid,
      toCids: selectedItem,
    });
    Message.success('转发成功');
    setTransferMessageModalVisible(false);
  };

  const handleReply = () => {
    onReply({ ...messageData, visible: true });
  };

  const handleCopy = () => {
    copy(msgContent.text);
    Message.success('文本复制成功');
  };

  const handleCollect = () => {
    setTagModalVisible(true);
  };

  const handleCollectionOk = async (tagCodes: string[]) => {
    try {
      sdk.collectMessage({ cid, messageId: msgId, tagCodes });
      Message.success('收藏成功');
      setTagModalVisible(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleLater = async () => {
    console.log(msgId, localMsgId, '----');

    await sdk.changeMessagesStatus({
      type: 'later',
      msgIds: [{ msgId, localMsgId }],
      cid,
    });
    Message.success('已加入稍后处理列表');
    PubSub.publish('shaohouchuli');
    onLater(messageData);
  };

  const handleRecall = async () => {
    await sdk.changeMessagesStatus({
      type: 'recall',
      msgIds: [{ msgId, localMsgId }],
      cid,
    });
    onRecall(messageData);
    PubSub.publish('chehui', messageData);
  };

  const handleDelete = async () => {
    await sdk.changeMessagesStatus({
      type: 'delete',
      msgIds: [{ msgId, localMsgId }],
      cid,
    });
    onDelete(messageData);
  };

  const handleSendEmoji = async (emojiData) => {
    await sdk.setCurrentCid(cid);
    const { globalUniqueId: iconId, url: emoji } = emojiData;
    await sdk.addFaceReplyToMsg({ iconId, emoji, messageId: msgId });
    const instantReplyFaceInfo = {
      faceContent: { iconId, iconUrl: emoji },
      from: { name: myUserName, userId: myUserId },
    };
    onAddEmojiReply({
      ...messageData,
      instantReplyFaceInfo: instantReplyFaceInfo,
    });
  };

  const emijiContent = (
    <div className="emojiListSection">
      {mySdkStore.emojiList.map((emoji) => (
        <span key={emoji.url}>
          <img
            src={emoji.url}
            onClick={() => handleSendEmoji(emoji)}
            alt="emoji"
            style={{ width: '28px', height: '28px', margin: '8px 8px' }}
          />
        </span>
      ))}
    </div>
  );

  const operationContent = (
    <List className="messageOperationsList">
      {/* {messageTypeCanOperateConfig.canStrongReminder &&
        isSendBySelf &&
        converInfo.type === ConversationType.Single &&
        !mySdkStore.isHideSomeFunctions && (
          <List.Item key="reminder" onClick={handleDing}>
            提醒
          </List.Item>
        )} */}
      {messageTypeCanOperateConfig.canCopy &&
        messageData.msgType === ContentType.Text && (
          <List.Item key="copy" onClick={handleCopy}>
            复制
          </List.Item>
        )}
      {messageTypeCanOperateConfig.canTransfer && (
        <List.Item key="transfer" onClick={handleTransfer}>
          转发
        </List.Item>
      )}
      <List.Item key="reply" onClick={handleReply}>
        回复
      </List.Item>
      {messageTypeCanOperateConfig.canCollect &&
        !mySdkStore.isHideSomeFunctions && (
          <List.Item key="collect" onClick={handleCollect}>
            收藏
          </List.Item>
        )}
      {messageTypeCanOperateConfig.canLater && !isSendBySelf && (
        <List.Item key="later" onClick={handleLater}>
          稍后处理
        </List.Item>
      )}
      {/* <List.Item key="stayTop" onClick={}>置顶</List.Item> */}
      {/* <List.Item key="" onClick={}>私发</List.Item> */}
      <List.Item
        style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          margin: '0 12px',
          padding: 0,
        }}
      />
      {messageTypeCanOperateConfig.canRecall &&
        myUserId === messageData.from?.userId &&
        new Date().getTime() < Number(messageData.timestamp) + 1800000 && (
          <List.Item key="recall" onClick={handleRecall}>
            撤回
          </List.Item>
        )}
      {messageTypeCanOperateConfig.canMultiSelect && (
        <List.Item key="select" onClick={handleMultiSelect}>
          多选
        </List.Item>
      )}
      {messageTypeCanOperateConfig.canDelete && (
        <List.Item key="delete" onClick={handleDelete}>
          删除
        </List.Item>
      )}
    </List>
  );

  return (
    <>
      <div
        className={classNames({
          singleMessageIconBar: true,
          [className]: true,
        })}
      >
        <Popover
          content={emijiContent}
          trigger="click"
          title={null}
          overlayClassName="emojiPopover"
          placement="rightBottom"
        >
          <SmileOutlined className="iconItem" />
        </Popover>
        <MessageOutlined className="iconItem" onClick={handleReply} />
        <Popover
          content={operationContent}
          trigger="click"
          title={null}
          overlayClassName="messageOperationsPopover"
          placement="rightBottom"
        >
          <MoreOutlined className="iconItem" />
        </Popover>
      </div>
      {tagModalVisible && (
        <TagModal
          onClose={() => setTagModalVisible(false)}
          onOk={handleCollectionOk}
        />
      )}
      {transferMessageModalVisible && (
        <TransferMessageModal
          onOk={handleTransferOk}
          onClose={() => setTransferMessageModalVisible(false)}
        />
      )}
    </>
  );
}
