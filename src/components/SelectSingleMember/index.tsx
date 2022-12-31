import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Modal, List, message as Message, Radio, Empty } from 'antd';
import { UserOutlined, ProjectFilled } from '@ant-design/icons';
import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '@/components/AvatarImage';

import { UserInfo, UserList } from '@/typings/global';

import './style.less';

interface Props {
  onClose: () => void;
}

export default function (props: Props) {
  const {
    sdk,
    userInfo: { userId: myUserId },
    setPagePath,
  } = useModel('global');
  const { onClose } = props;
  const [userList, setUserList] = useState<UserList>([]);
  const [selectedUsersId, setSelectedUsersId] = useState();
  const [pagination, setPanination] = useState({ pageIndex: 1, totalPage: 1 });
  const [activeKey, setActiveKey] = useState('friend');

  const getMyFriendList = async (pageIndex: number) => {
    const data = await sdk.queryFriend({ cid: '', pageIndex, pageSize: 100 });
    const { rows = [], totalPage } = data;
    let newList = rows.filter((item: UserInfo) => item.userId !== myUserId);
    setUserList(pageIndex === 1 ? newList : [...userList, ...newList]);
    setPanination({ pageIndex, totalPage });
  };

  const getMyContactList = async (pageIndex: number) => {
    const data = await sdk.queryUsers({ cid: '', pageIndex, pageSize: 100 });
    const { rows = [], totalPage } = data;
    let newList = rows.filter((item: UserInfo) => item.userId !== myUserId);
    setUserList(pageIndex === 1 ? newList : [...userList, ...newList]);
    setPanination({ pageIndex, totalPage });
  };

  const getNextData = async () => {
    if (activeKey === 'friend') {
      await getMyFriendList(pagination.pageIndex + 1);
    } else {
      await getMyContactList(pagination.pageIndex + 1);
    }
  };

  useEffect(() => {
    if (activeKey === 'friend') {
      getMyFriendList(1);
    } else {
      getMyContactList(1);
    }
  }, [activeKey]);

  const handleOk = async () => {
    try {
      const { cid } = await sdk.createConversation({
        type: 'single',
        subUserId: selectedUsersId,
      });
      setPagePath({ activeIcon: 'chat', cid });
      onClose();
    } catch {
      Message.error('创建单聊失败');
    }
  };

  return (
    <Modal
      visible
      title="选择联系人"
      width={360}
      onOk={handleOk}
      onCancel={onClose}
      className="createSingleConversationModal"
    >
      <div className="navBar">
        <div onClick={() => setActiveKey('friend')}>
          <div
            className={classNames({
              operationIcon: true,
              active: activeKey === 'friend',
            })}
          >
            <UserOutlined style={{ fontSize: 22 }} />
          </div>
          按好友选
        </div>
        <div onClick={() => setActiveKey('contactor')}>
          <div
            className={classNames({
              operationIcon: true,
              active: activeKey === 'contactor',
            })}
          >
            <ProjectFilled style={{ fontSize: 22 }} />
          </div>
          按联系人选
        </div>
      </div>
      <div id="scrollableDiv" className="friendListPageScrollableDiv">
        <InfiniteScroll
          height={400}
          dataLength={userList.length}
          next={getNextData}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
          scrollableTarget="scrollableDiv"
        >
          <Radio.Group
            onChange={(e) => setSelectedUsersId(e.target.value)}
            style={{ width: '100%' }}
          >
            <List split={false}>
              {userList.map((item) => {
                return (
                  <List.Item key={item.userId}>
                    <Radio value={item.userId} style={{ marginRight: 8 }} />
                    <List.Item.Meta
                      avatar={
                        <AvatarImage
                          src={item.avatarUrl}
                          style={{ borderRadius: 8 }}
                          fit="cover"
                          width={42}
                          height={42}
                          nickName={item.nickName}
                          userName={item.userName}
                          userId={item.userId}
                        />
                      }
                      // description={<>ID: {item.userId}</>}
                      title={item.nickName}
                    />
                  </List.Item>
                );
              })}
            </List>
          </Radio.Group>
        </InfiniteScroll>
        {!userList.length && <Empty />}
      </div>
    </Modal>
  );
}
