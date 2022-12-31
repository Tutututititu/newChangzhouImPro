import React, { useState, useEffect } from 'react';
import { List, Tabs, Avatar } from 'antd';
import TagList from './TagList';
import { useModel } from 'umi';
import { resolveMsgFormContent } from '../../utils/index';
import './style.less';
export default () => {
  const { sdk } = useModel('global');
  const [tagInfo, setTagInfo] = useState(null);
  const [collectMessages, setCollectMessages] = useState([]);
  const [collectConversations, setCollectConversations] = useState([]);
  const [collectUsers, setCollectUsers] = useState([]);
  const [sourceActiveKey, setSourceActiveKey] = useState('Messages');

  const queryCollectData = (tagCodes: Array<string>) => {
    const apiName = `queryFavorite${sourceActiveKey}`;
    if (sdk[apiName] && typeof sdk[apiName] === 'function') {
      sdk[apiName]({
        tagCodes,
        pageIndex: 1,
        pageSize: 2000,
      }).then((data: any) => {
        console.log(data, 'pp');

        const { list } = data;
        if (list) {
          switch (sourceActiveKey) {
            case 'Messages':
              setCollectMessages(list);
              break;
            case 'Conversations':
              setCollectConversations(list);
              break;
            case 'Users':
              setCollectUsers(list);
              break;
            default:
              break;
          }
        }
      });
    }
  };

  useEffect(() => {
    if (tagInfo) {
      const { code } = tagInfo;
      const tagCodes = [code];
      queryCollectData(tagCodes);
    }
  }, [tagInfo]);

  useEffect(() => {
    if (tagInfo) {
      const { code } = tagInfo;
      const tagCodes = [code];
      queryCollectData(tagCodes);
    }
  }, [sourceActiveKey]);

  const items = [
    {
      label: '聊天消息',
      key: 'Messages',
      children: (
        <List
          dataSource={collectMessages}
          renderItem={(m: any) => (
            <List.Item className="tagItem">
              <List.Item.Meta
                avatar={
                  m?.from?.avatar ? (
                    <Avatar src={m.from.avatarUrl} />
                  ) : (
                    <div className="defaultAvatarImage">{m.from.nickName}</div>
                  )
                }
                title={m.from.nickName}
                description={resolveMsgFormContent(m.msgType, m.msgContent)}
              />
            </List.Item>
          )}
        />
      ),
    },
    // {
    //   label: '会话',
    //   key: 'Conversations',
    //   children: (
    //     <List
    //       dataSource={collectConversations}
    //       renderItem={(c: any) => (
    //         <List.Item className="tagItem">
    //           <List.Item.Meta
    //             avatar={
    //               c?.avatarUrl ? (
    //                 <Avatar src={c.avatarUrl} />
    //               ) : (
    //                 <div className="defaultAvatarImage">
    //                   {c.lastMsgSenderNickName}
    //                 </div>
    //               )
    //             }
    //             title={c.lastMsgSenderNickName}
    //             description={resolveMsgFormContent(
    //               c.lastMsgContentType,
    //               c.lastMsgContent,
    //             )}
    //           />
    //         </List.Item>
    //       )}
    //     />
    //   ),
    // },
    // {
    //   label: '联系人',
    //   key: 'Users',
    //   children: (
    //     <List
    //       dataSource={collectUsers}
    //       renderItem={(u: any) => (
    //         <List.Item className="tagItem">
    //           <List.Item.Meta
    //             avatar={
    //               u?.avatarUrl ? (
    //                 <Avatar src={u.avatarUrl} />
    //               ) : (
    //                 <div className="defaultAvatarImage">{u.nickName}</div>
    //               )
    //             }
    //             title={u.nickName}
    //           />
    //         </List.Item>
    //       )}
    //     />
    //   ),
    // },
  ];

  return (
    <>
      <div className="im-layout-center">
        <TagList
          changeTagType={(tag: any) => {
            setTagInfo(tag);
          }}
        />
      </div>
      <div
        className="im-layout-right"
        style={{ background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.06)' }}
      >
        {tagInfo && (
          <Tabs
            className="collectList"
            items={items}
            activeKey={sourceActiveKey}
            onChange={(key) => setSourceActiveKey(key)}
          />
        )}
      </div>
    </>
  );
};
