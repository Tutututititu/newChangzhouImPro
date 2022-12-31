import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Modal, List, message as Message, Checkbox, Empty } from 'antd';
import {
  UserOutlined,
  ProjectFilled,
  CloseOutlined,
  RightOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import classNames from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '@/components/AvatarImage';

import { UserInfo, UserList } from '@/typings/global';

import './style.less';
import axios from 'axios';
import LayoutRightHeader from '@/components/LayoutRightHeader';
import { pinyin } from 'pinyin-pro';

interface Props {
  type?: 'create' | 'add' | 'addMeeting';
  cid?: string;
  subUser?: { userId: string; nickName: string };
  onClose: () => void;
  setAddValue?: (arg: any) => void;
  inCatList?: [];
  addCreateGroup: any;
}

const calcPrefferGroupName = (names: string[], suffix: string) => {
  let calcName = names.join(',');
  const maxLength = 10 - suffix.length;
  while (calcName.length > maxLength) {
    names.pop();
    calcName = names.join(',');
  }

  return `${calcName}${suffix}`;
};

export default function (props: Props) {
  const {
    sdk,
    userInfo: { userId: myUserId, nickName: myNickName },
    setPagePath,
  } = useModel('global');
  const {
    type = 'create',
    cid,
    subUser,
    onClose,
    setAddValue,
    addCreateGroup,
    inCatList,
  } = props;

  const [userList, setUserList] = useState<UserList>([]);
  const [organizationalList, setOrganizationalList] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState<UserList>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [pagination, setPanination] = useState({ pageIndex: 1, totalPage: 1 });
  const [activeKey, setActiveKey] = useState('friend');
  const [organizationalData, setOrganizationalData] = useState('');
  const [activeOrganizationalPage, setActiveOrganizationalPage] = useState('');
  const getMyFriendList = async (pageIndex: number) => {
    const data = await sdk.queryFriend({ cid: '', pageIndex, pageSize: 100 });
    console.log('data===', data);
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
  useEffect(() => {
    //${UserInfo.appId}
    let urlTitle = window.location.protocol;
    axios
      .get(
        `/api/gov/cz/user/deptAll?userId=${myUserId}`,
        // `/api/gov/cz/user/deptAll?userId=${myUserId}`,
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
        if (data && data.length > 0) {
          data = changeList(data);
          setOrganizationalList(data);
        }
      });
  }, []);
  const changeList = (list: any) => {
    for (let item of list) {
      item.show = false;
      const children = item.children ? item.children : [];
      if (children && children.length > 0) {
        changeList(item.children);
      }
    }
    return list;
  };
  const onActiveOrganizationalChange = async (
    item: any,
    activePage: string,
  ) => {
    getChildList(item, activePage);
  };
  const getChildList = (item: any, activePage: string) => {
    let urlTitle = window.location.protocol;
    axios
      .get(
        `/api/gov/cz/dept/querySub?parentId=${item.deptId}`,
        // `/api/gov/cz/dept/querySub?parentId=${item.deptId}`,
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
        if (data && data.length > 0) {
          let newList = JSON.parse(JSON.stringify(organizationalList));
          // @ts-ignore
          console.log(newList, item.deptId, data, '----');

          newList = renderChild(newList, item.deptId, data);

          setOrganizationalList(newList);
        } else {
          getOrganizational(1, item.deptId);
        }
      });
  };
  const renderChild = (list: any, iid: any, child: any) => {
    for (let item of list) {
      console.log('1');

      if (item.deptId == iid) {
        item.show = true;
        item.children = child;
      }
      if (item.children) {
        renderChild(item.children, iid, child);
      }
    }
    return list;
  };
  const organizationalChange = async (item) => {
    let newList = JSON.parse(JSON.stringify(organizationalList));
    newList = renderOrganizationalChange(newList, item.deptId);
    setOrganizationalList(newList);
  };
  const renderOrganizationalChange = (list: any, iid: any) => {
    for (let item of list) {
      if (item.deptId === iid) {
        item.show = !item.show;
      }
      if (item.children) {
        renderOrganizationalChange(item.children, iid);
      }
    }
    return list;
  };
  const renderTreeOrganizational = (list: any) => {
    return list.map((item: any, index: number) => {
      if (!item.children) {
        return (
          <div
            key={index}
            className={classNames({
              operationBar: true,
              active: activeOrganizationalPage === item.deptId,
            })}
            onClick={() => onActiveOrganizationalChange(item, item.deptId)}
          >
            <div className="apartment">
              <img src={require('@/assets/department.png')} alt="" />
            </div>
            {item.deptName}
            <RightOutlined className="apartmentRight" />
          </div>
        );
      } else {
        return (
          <div key={index}>
            <div
              className={classNames({
                operationBar: true,
                active: item.show,
              })}
              onClick={() => organizationalChange(item)}
            >
              <div className="apartment">
                <img src={require('@/assets/apartment.png')} alt="" />
              </div>
              {item.deptName}
              {item.show && (
                <img
                  className="apartment-down"
                  src={require('@/assets/caret-down.png')}
                  alt=""
                />
              )}
              {!item.show && (
                <img
                  className="apartment-down"
                  src={require('@/assets/caret-up.png')}
                  alt=""
                />
              )}
            </div>
            {item.show && renderTreeOrganizational(item.children)}
          </div>
        );
      }
    });
  };
  const getOrganizational = async (pageIndex: number, deptId = '') => {
    const deptIdData = deptId ? deptId : organizationalData;
    setOrganizationalData(deptId);
    console.log('deptIdData====', deptIdData);
    let urlTitle = window.location.protocol;
    try {
      axios
        .get(
          `/api/gov/cz/dept/users?orgId=${deptIdData}&pageIndex=${pageIndex}&pageSize=100`,
          // `/api/gov/cz/dept/users?orgId=${deptIdData}&pageIndex=${pageIndex}&pageSize=100`,
        )
        .then((res) => {
          if (res?.data?.data) {
            let data = res.data.data;
            let { totalPage } = data;
            let rows = [];
            if (data?.rows) {
              rows = data.rows;
            }
            let newList = rows.filter(
              (item: UserInfo) => item.userId !== myUserId,
            );

            setUserList(pageIndex === 1 ? newList : [...userList, ...newList]);
            setPanination({ pageIndex, totalPage });
            setActiveKey('organizationalChild');
          }
        });
    } catch (e) {
      console.log(e, 'pp');
    }
  };

  const getNextData = async () => {
    if (activeKey === 'friend') {
      await getMyFriendList(pagination.pageIndex + 1);
    } else if (activeKey === 'contactor') {
      await getMyContactList(pagination.pageIndex + 1);
    } else if (activeKey === 'organizationalChild') {
      await getOrganizational(pagination.pageIndex + 1);
    }
  };

  useEffect(() => {
    if (activeKey === 'friend') {
      getMyFriendList(1);
    } else if (activeKey === 'contactor') {
      getMyContactList(1);
    }
  }, [activeKey]);

  useEffect(() => {
    if (type == 'add') {
      if (inCatList?.length) {
        if (selectedUsers.length) {
          let c = inCatList.includes(
            selectedUsers[selectedUsers.length - 1].userId,
          );
          if (c) {
            Message.error('该用户已在群组');
            setSelectedUsers([...selectedUsers.slice(0, -1)]);
            setSelectedUserIds([...selectedUserIds.slice(0, -1)]);
          }
        }
      }
    }
  }, [selectedUsers]);

  const createGroup = async (flage) => {
    try {
      const selectedUsersNames = (
        subUser ? [subUser, ...selectedUsers] : selectedUsers
      ).map((item: UserInfo) => item.nickName);
      let groupMember = [myNickName, ...selectedUsersNames];
      if (flage) {
        groupMember = groupMember.filter((x) => x.userId !== subUser?.userId);
      }
      let groupName = groupMember.join(',');
      if (groupName.length > 10) {
        let suffix;
        if (flage) {
          suffix = `等${groupMember.length - 1}人`;
        } else {
          suffix = `等${groupMember.length}人`;
        }
        groupName = calcPrefferGroupName(groupMember, suffix);
      }
      const members = subUser
        ? [subUser.userId, ...selectedUserIds]
        : selectedUserIds;
      const { cid } = await sdk.createConversation({
        type: 'group',
        name: groupName,
        owner: myUserId,
        members: members.map((userId) => ({ userId })),
      });
      setPagePath({ activeIcon: 'chat', cid });
      onClose();
    } catch (e: any) {
      Message.error('创建群聊失败');
    }
  };

  const addGroupMember = async () => {
    try {
      await sdk.addMemberToGroup({
        cid,
        owner: myUserId,
        members: selectedUserIds.map((userId) => ({ userId })),
      });
      onClose();
      Message.success('添加群成员成功');
    } catch (e: any) {
      Message.error(e.errorMessage || e.message);
    }
  };

  const handleOk = async () => {
    if (type === 'create') {
      if (!selectedUsers.length) return Message.error('未选择不允许创建');
      let flage =
        selectedUsers.findIndex((x) => x.userId == subUser?.userId) >= 0;

      if (flage) {
        if (selectedUsers?.length < 2)
          return Message.error('少于三人不允许创建群组');
      } else {
        if (selectedUsers?.length < 1)
          return Message.error('少于三人不允许创建群组');
      }

      createGroup(flage);
    } else if (type === 'add') {
      if (!selectedUsers.length) return Message.error('未选择不允许创建');
      addGroupMember();
    } else if (type === 'addMeeting') {
      addCreateGroup(selectedUsers, selectedUserIds);
    }
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((users) => users.filter((item) => item.userId !== userId));
    setSelectedUserIds((ids) => ids.filter((id) => id !== userId));
  };

  return (
    <Modal
      visible
      title="选择联系人"
      // width={780}
      onOk={handleOk}
      onCancel={onClose}
      className="addGroupMemberModal"
      style={{ zIndex: 9999 }}
    >
      <div className="leftBox">
        {activeKey !== 'organizationalChild' && (
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
            <div onClick={() => setActiveKey('organizational')}>
              <div
                className={classNames({
                  operationIcon: true,
                  active: activeKey === 'organizational',
                })}
              >
                <ProjectFilled style={{ fontSize: 22 }} />
              </div>
              按架构选
            </div>
          </div>
        )}
        <div>
          {activeKey === 'organizationalChild' && (
            <div className="organizational">
              <LeftOutlined
                className="apartment-left"
                onClick={() => setActiveKey('organizational')}
              />
              <div className="apartment-right">
                <LayoutRightHeader title="按架构选" />
              </div>
            </div>
          )}
        </div>
        <div id="scrollableDiv" className="organizationBox">
          {activeKey != 'organizational' && (
            <div>
              <InfiniteScroll
                height={400}
                dataLength={userList.length}
                next={getNextData}
                hasMore={pagination.totalPage > pagination.pageIndex}
                loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
                scrollableTarget="scrollableDiv"
              >
                <Checkbox.Group
                  value={selectedUserIds}
                  style={{ width: '100%' }}
                >
                  <List split={false} style={{ width: '100%' }}>
                    {userList.map((item) => {
                      return (
                        <List.Item key={item.userId}>
                          <Checkbox
                            value={item.userId}
                            style={{ marginRight: 8 }}
                            onChange={(e) => {
                              const userId = item.userId;
                              const checked = e.target.checked;

                              if (checked) {
                                setSelectedUsers([...selectedUsers, item]);
                                setSelectedUserIds([
                                  ...selectedUserIds,
                                  userId,
                                ]);
                              } else {
                                setSelectedUsers((users) =>
                                  users.filter(
                                    (item) => item.userId !== userId,
                                  ),
                                );
                                setSelectedUserIds((ids) =>
                                  ids.filter((id) => id !== userId),
                                );
                              }
                            }}
                          />
                          <List.Item.Meta
                            className="ove"
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
                            description={
                              <>
                                {item.departments
                                  ? item?.departments[0].deptName ||
                                    item?.departments[0].deptName
                                  : ''}
                              </>
                            }
                            title={item.nickName}
                          />
                        </List.Item>
                      );
                    })}
                  </List>
                </Checkbox.Group>
              </InfiniteScroll>
              {!userList.length && <Empty />}
            </div>
          )}
          {activeKey === 'organizational' && (
            <div>
              <div className="organizational">
                <div className="organizationalIcon">
                  <img src={require('@/assets/apartment.png')} alt="" />
                </div>
                <LayoutRightHeader title="组织架构" />
                <img
                  className="apartment-down"
                  src={require('@/assets/caret-up.png')}
                  alt=""
                />
              </div>
              {renderTreeOrganizational(organizationalList)}
            </div>
          )}
        </div>
      </div>
      <div className="rightBox">
        <div>已选择（{selectedUsers.length}/500）</div>
        <div className="selecteUserBox">
          {selectedUsers.map((item) => (
            <div className="selecteUserTag" key={item.userId}>
              <AvatarImage
                src={item.avatarUrl}
                style={{ borderRadius: 8, marginRight: 8 }}
                fit="cover"
                width={20}
                height={20}
                nickName={item.nickName}
                userName={item.userName}
                userId={item.userId}
              />
              {item.nickName}
              <CloseOutlined
                style={{ marginLeft: 12 }}
                onClick={() => removeSelectedUser(item.userId)}
              />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
