// 清空聊天记录
import './style.less';
import { useModel } from 'umi';
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import PubSub from 'pubsub-js';
const ClearChat = (props: { cidProps: string; borderType?: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { cidProps, borderType } = props;
  const { sdk, globalConverList, updateGlobalConverList } = useModel('global');
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    await clearChat();
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // 清空
  const clearChat = async () => {
    let params = {
      cid: cidProps,
    };
    PubSub.publish('clearMsg', cidProps);
    const res = await sdk.querySingleConversation(params);
    let { lastMsgId } = res;
    clear(lastMsgId);
  };

  const clear = async (lastMsgId: string) => {
    let params = { type: 'delete', cursorMsgId: lastMsgId };
    await sdk.changeMessagesStatus(params);
    updateGlobalConverList([...globalConverList]);
  };
  return (
    <div
      className={`clear-body ${borderType == 'bottom' ? 'border-bottom' : ''}`}
    >
      <span className={`body-clear`} onClick={showModal}>
        清空聊天记录
      </span>
      <Modal
        title="清空聊天记录"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <span>确认清空此会话聊天记录？</span>
      </Modal>
    </div>
  );
};

export default ClearChat;
