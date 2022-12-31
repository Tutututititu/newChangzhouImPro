import React, { useState } from 'react';
import { Space, message as Message } from 'antd';
import { useModel } from 'umi';
import {
  ProfileOutlined,
  DeleteOutlined,
  FileAddOutlined,
  SendOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import TagModal from '@/components/TagModal';
import TransferMessageModal from '@/components/TransferMessageModal';

import { ConversationList } from '@/typings/chat';

import './style.less';

interface Props {
  cid: string;
  cname: string;
  selectedMessages: string[];
  onDeleteOk: (selectedMessages: string[]) => void;
  onClose: () => void;
}

export default function (props: Props) {
  const { sdk } = useModel('global');
  const { cid, cname, selectedMessages, onDeleteOk, onClose } = props;
  const [selectedMessage, setSelectedMessage] = useState<string[]>([]);
  const [mergeToOne, setMergeToOne] = useState(false);
  const [transferMessageModalVisible, setTransferMessageModalVisible] =
    useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);

  const listFilterFunc = (list: ConversationList) => {
    return list.filter((item) => item.cid !== cid);
  };

  const handleTransferMessage = (mergeToOne: boolean) => {
    // const ms = getSelectedMessages();
    if (!selectedMessages.length) {
      return;
    }
    setSelectedMessage(selectedMessages);
    setMergeToOne(mergeToOne);
    setTransferMessageModalVisible(true);
  };

  const handleTransferOk = async (selectedItem: { cid: string }[]) => {
    const msgIds = selectedMessage.map((msgId) => ({ msgId }));
    try {
      const res = await sdk.transferMessages({
        msgIds,
        originalCid: props.cid,
        toCids: selectedItem,
        mergeToOne,
      });
      if (res?.errorMessage) {
        Message.error(res.errorMessage);
        return;
      }
      Message.success('转发成功');
      setTransferMessageModalVisible(false);
      onClose();
    } catch (e: any) {
      Message.error(e.errorMessage);
    }
  };

  const handleCollection = () => {
    // const ms = getSelectedMessages();
    setSelectedMessage(selectedMessages);
    setTagModalVisible(true);
  };

  const handleCollectionOk = async (tagCodes: string[]) => {
    try {
      await sdk.batchCollectMessage({
        cid,
        cname,
        messageIds: selectedMessage,
        tagCodes,
      });
      Message.success('收藏成功');
      setTagModalVisible(true);
      onClose();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async () => {
    // const ms = getSelectedMessages();
    const msgIds = selectedMessages.map((msgId) => ({ msgId }));
    sdk.changeMessagesStatus({ type: 'delete', msgIds, cid }).then(() => {
      onDeleteOk(selectedMessages);
      onClose();
    });
  };

  return (
    <>
      <Space className="selectorOperationsBarComponnet" size={56}>
        <div
          className={`iconBtn ${selectedMessages.length ? '' : 'disabled'}`}
          onClick={() => handleTransferMessage(false)}
        >
          <div className="iconWrap">
            <SendOutlined />
          </div>
          逐一转发
        </div>
        <div
          className={`iconBtn ${selectedMessages.length ? '' : 'disabled'}`}
          onClick={() => handleTransferMessage(true)}
        >
          <div className="iconWrap">
            <ProfileOutlined />
          </div>
          合并转发
        </div>
        <div
          className={`iconBtn ${selectedMessages.length ? '' : 'disabled'}`}
          onClick={() => handleCollection()}
        >
          <div className="iconWrap">
            <FileAddOutlined />
          </div>
          收藏
        </div>
        <div
          className={`iconBtn ${selectedMessages.length ? '' : 'disabled'}`}
          onClick={handleDelete}
        >
          <div className="iconWrap">
            <DeleteOutlined />
          </div>
          删除
        </div>
        <div>
          <CloseOutlined
            style={{ fontSize: 24, marginBottom: 32 }}
            onClick={onClose}
          />
        </div>
      </Space>
      {tagModalVisible && (
        <TagModal
          onClose={() => setTagModalVisible(false)}
          onOk={handleCollectionOk}
        />
      )}
      {transferMessageModalVisible && (
        <TransferMessageModal
          listFilterFunc={listFilterFunc}
          onOk={handleTransferOk}
          onClose={() => setTransferMessageModalVisible(false)}
        />
      )}
    </>
  );
}
