import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Drawer, Space } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import SingleMessage from '../SingleMessage';
import AvatarImage from '../AvatarImage';

import { ConversationList } from '@/typings/chat';

interface Props {
  originalCid: string;
  originalMessageIds: any[];
  title: string;
  onClose: () => void;
}

export default function (props: Props) {
  const { originalCid, originalMessageIds, title, onClose } = props;
  const { sdk } = useModel('global');
  const [list, setList] = useState<ConversationList>([]);

  const getList = async () => {
    const { list } = await sdk.queryMultiplyMessage({
      cid: originalCid,
      msgIds: originalMessageIds,
    });
    setList(list);
  };

  useEffect(() => {
    getList();
  }, []);

  return (
    <Drawer
      title={title}
      visible
      className="replyListComponent"
      closable={false}
      extra={
        <Space>
          <CloseOutlined
            style={{ fontSize: 20, color: '#000', cursor: 'pointer' }}
            onClick={onClose}
          />
        </Space>
      }
    >
      <List>
        {list.map((item) => {
          return (
            <List.Item key={item.msgId}>
              <List.Item.Meta
                avatar={
                  <AvatarImage
                    src={item.from.avatarUrl}
                    style={{ borderRadius: 8 }}
                    fit="cover"
                    width={42}
                    height={42}
                    nickName={item.from.nickName}
                    userName={item.from.userName}
                    userId={item.from.userId}
                  />
                }
                title={item.from.nickName}
                description={
                  <SingleMessage
                    {...item}
                    msgContent={item.msgContent}
                    type={item.msgType}
                  />
                }
              />
            </List.Item>
          );
        })}
      </List>
    </Drawer>
  );
}
