import React, { useState, useEffect } from 'react';
import { useModel, history } from 'umi';
import {
  Space,
  List,
  Drawer,
  Modal,
  Input,
  Divider,
  message as Message,
} from 'antd';
import {
  UsergroupAddOutlined,
  EditOutlined,
  RightOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import ClearChat from '../../../components/ClearChat';
import AvatarImage from '@/components/AvatarImage';
import TagModal from '@/components/TagModal';
import SelecteGroupMember from '@/components/SelecteGroupMember';
import ChatGroupManage from '../ChatGroupManage';

import './style.less';

interface Props {
  cid: string;
  onClose: () => void;
  onConverInfoChange: (changeInfo: { [field: string]: any }) => void;
}

export default function (props: Props) {
  const { cid, onClose, onConverInfoChange } = props;
  const {
    sdk,
    userInfo: { userId: myUserId },
    mySdkStore,
    setPagePath,
  } = useModel('global');
  const [members, setMembers] = useState([]);
  const [memberPagination, setMemberPagination] = useState({
    current: 1,
    totalPage: 1,
  });
  const [addToGroupVisible, setAddToGroupVisible] = useState(false);
  // 管理员判断标识
  const [administratorsFlag, setAdministratorsFlag] = useState(false);
  const [childrenDrawer, setChildrenDrawer] = useState(false);
  const [conversationDetail, setConversationDetail] = useState({});
  const [collectionCompProps, setCollectCompProps] = useState({
    visible: false,
    onOk: () => {},
    onClose: () => {},
  });
  const [modifyFieldProps, setModifyFieldProps] = useState<{
    [filed: string]: any;
  }>({});

  const queryConversationDetail = async () => {
    const info = await sdk.querySingleConversation({ cid });
    console.log('info====', info);
    setConversationDetail(info);
  };

  const getMember = async (pageIndex: number) => {
    const { rows = [], totalPage } = await sdk.listGroupMembers({
      cid,
      pageIndex,
      pageSize: 10,
    });
    setMembers(pageIndex === 1 ? rows : [...members, ...rows]);
    setMemberPagination({ totalPage, current: pageIndex });

    console.log(rows, members, 'members');

    rows.forEach((v) => {
      if (v.userId === myUserId) {
        if (v.roleId === 2) {
          setAdministratorsFlag(true);
        } else {
          setAdministratorsFlag(false);
        }
      }
    });
  };

  useEffect(() => {
    getMember(1);
  }, []);

  useEffect(() => {
    queryConversationDetail();
    sdk.onGroupMembersChange = (res) => updateMembers(res);
  }, []);

  const updateMembers = async (res) => {
    let { userId, opType, newValue } = res.membersList[0];

    console.log(members, 'pp=');
    if (members?.length) {
      let newList = members;
      newList.forEach((x) => {
        if (x?.userId == userId) {
          if (opType == 'role') {
            x.roleId = newValue;
          }
        }
      });
      setMembers([...newList]);
    }
    // setMembers
    // const { rows = [], totalPage } = await sdk.listGroupMembers({
    //   cid,
    //   pageIndex: '1',
    //   pageSize: 10,
    // });
    // console.log(rows, totalPage, 'ppp');
  };
  const handleRemoveMember = async (userId: string) => {
    try {
      await sdk.removeMemberFromGroup({ cid, members: [{ userId }] });
      setMembers((members) => members.filter((item) => item.userId !== userId));
      console.log('members=====', members);
      setConversationDetail({
        ...conversationDetail,
        memberCount: conversationDetail.memberCount - 1,
      });
    } catch (e: any) {
      if (e?.errorMessage) {
        Message.error(e?.errorMessage);
        return;
      }
    }
  };

  const handleAddMemberVisible = async () => {
    setAddToGroupVisible(true);
  };

  const handleMidifySessionName = async (e) => {
    try {
      const value = e.target.value;
      await sdk.updateGroup({
        cid,
        updateType: 'name',
        group: { name: value },
      });
      setModifyFieldProps({ ...modifyFieldProps, nameVisible: false });
      queryConversationDetail();
    } catch (e: any) {
      Message.error(e.message);
    }
  };

  const handleModifyNickName = async (e) => {
    try {
      await sdk.updateUserInfoInGroup({
        cid,
        type: 'nickName',
        value: e.target.value,
      });
    } catch (e: any) {
      Message.error(e.message);
    }
    setModifyFieldProps({ ...modifyFieldProps, userNickVisible: false });
    queryConversationDetail();
  };

  const handleModifyUserMark = async (e) => {
    try {
      await sdk.updateUserInfoInGroup({
        cid,
        type: 'userMark',
        value: e.target.value,
      });
    } catch (e: any) {
      Message.error(e.message);
    }
    setModifyFieldProps({ ...modifyFieldProps, userMarkVisible: false });
    queryConversationDetail();
  };

  const handleModifyRemark = async (value) => {
    try {
      await sdk.updateGroup({
        cid,
        updateType: 'remark',
        group: { remark: value },
      });
    } catch (e: any) {
      Message.error(e.message);
    }
    setModifyFieldProps({ ...modifyFieldProps, remarkVisible: false });
    queryConversationDetail();
  };

  const handleModifyNotice = async (value) => {
    try {
      await sdk.updateGroup({
        cid,
        updateType: 'notice',
        group: { notice: value },
      });
    } catch (e: any) {
      Message.error(e.message);
    }
    setModifyFieldProps({ ...modifyFieldProps, noticeVisible: false });
    queryConversationDetail();
    onConverInfoChange({ notice: value });
  };
  const closeGroupVisible = async () => {
    setAddToGroupVisible(false);
    getMember(1);
  };
  const handleQuitGroupChat = async () => {
    Modal.confirm({
      content: '确定要退出吗？',
      onOk: async () => {
        try {
          const { errorMessage } = await sdk.removeMemberFromGroup({
            cid,
            members: [{ userId: mySdkStore.mockConfig.userId }],
          });
          if (errorMessage) {
            Message.error(errorMessage);
            return;
          }
          Message.success('你已退出群聊');
          setPagePath({ activeIcon: '', cid: undefined });
          onClose();
        } catch (e: any) {
          Message.error(e.errorMessage);
        }
        // setPagePath({activeIcon: '', cid: undefined})
      },
    });
  };

  const handleDismissGroupChat = async () => {
    Modal.confirm({
      content: '确定要解散吗？',
      onOk: async () => {
        try {
          const { errorMessage } = await sdk.closeConversation({ cid });
          if (errorMessage) {
            Message.error(errorMessage);
            return;
          }
          Message.success('你已解散群聊');
          onClose();
          setPagePath({ activeIcon: '', cid: undefined });
          // history.push({ pathname: '/gov/cz/index' });
        } catch (e: any) {
          Message.error(e.errorMessage);
        }
        // setPagePath({activeIcon: '', cid: undefined})
      },
    });
  };

  const handleCollectionOk = async (tagCodes, allTagInfos) => {
    try {
      // sdk.collectSession({ cid, tagCodes });
      const tags = allTagInfos.map(({ name }) => name);
      await sdk.updateGroup({ cid, updateType: 'tags', group: { tags: tags } });
      Message.success('标记成功');
      setConversationDetail({ ...conversationDetail, tags });
      setCollectCompProps({
        visible: false,
        onOk: () => {},
        onClose: () => {},
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleCollect = () => {
    setCollectCompProps({
      visible: true,
      cid,
      onOk: (tagCode, allTagInfos) => handleCollectionOk(tagCode, allTagInfos),
      onClose: () =>
        setCollectCompProps({
          visible: false,
          onOk: () => {},
          onClose: () => {},
        }),
    });
  };

  const handleCheckMoreMember = () => {
    getMember(memberPagination.current + 1);
  };

  const handleGroupManageVisible = () => {
    setChildrenDrawer(true);
  };
  const showChildrenDrawer = () => {
    setChildrenDrawer(true);
  };

  const onChildrenDrawerClose = () => {
    setChildrenDrawer(false);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    if (outItem?.userId) {
      handleRemoveMember(outItem.userId);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const [outItem, setOutItem] = useState();
  const outItemFun = (val) => {
    if (val) {
      setOutItem(val);
      showModal();
    }
  };
  return (
    <Drawer
      visible
      title="群设置"
      width={502}
      onClose={onClose}
      className="chatGroupDetailSettingPage"
      mask={false}
      // autoFocus={true}
    >
      <Modal
        title="提示"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div>是否移除{outItem?.userName}?</div>
      </Modal>
      <div>
        <List className="groupNameInfo">
          <List.Item>
            <List.Item.Meta
              avatar={
                <AvatarImage
                  src={conversationDetail.sessionLogoUrl}
                  style={{ borderRadius: 8 }}
                  fit="cover"
                  width={42}
                  height={42}
                  groupName={conversationDetail.name}
                />
              }
              title={
                !modifyFieldProps.nameVisible ? (
                  <Space>
                    {conversationDetail.name}
                    <EditOutlined
                      style={{ cursor: 'pointer', color: 'rgba(0,0,0,.45)' }}
                      onClick={() => {
                        setModifyFieldProps({
                          ...modifyFieldProps,
                          nameVisible: true,
                        });
                      }}
                    />
                  </Space>
                ) : (
                  <Input
                    style={{ width: '70%' }}
                    maxLength={10}
                    defaultValue={conversationDetail.name}
                    onPressEnter={handleMidifySessionName}
                    onBlur={handleMidifySessionName}
                  />
                )
              }
              description={conversationDetail.remark}
            />
          </List.Item>
        </List>
        <div className="groupMemberInfo">
          <div className="groupMemberInfoTopBar">
            群成员 {conversationDetail.memberCount}
            <UsergroupAddOutlined
              onClick={handleAddMemberVisible}
              style={{ fontSize: 16, cursor: 'pointer' }}
            />
          </div>
          <Space wrap size={24}>
            {members.map((item) => (
              <div className="avaterCard" key={item.id}>
                <div className="imageWrap">
                  {(myUserId === conversationDetail.ownerId ||
                    (conversationDetail.adminUsers || []).indexOf(myUserId) >
                      -1) && (
                    <CloseCircleOutlined
                      className="removeMemberIcon"
                      onClick={() => outItemFun(item)}
                      // onClick={() => handleRemoveMember(item.userId)}
                    />
                  )}
                  <AvatarImage
                    src={item.avatarUrl}
                    nickName={item.nickName}
                    userName={item.userName}
                    userId={item.userId}
                    style={{ marginBottom: 8, borderRadius: 8 }}
                    fit="cover"
                    width={42}
                    height={42}
                  />
                  {item.roleId === 1 && <div className="memberRole">群主</div>}
                  {item.roleId == 2 && <div className="memberRole">群管理</div>}
                </div>
                {item.userName || item.nickName}
              </div>
            ))}
          </Space>
          {memberPagination.totalPage > memberPagination.current && (
            <a className="checkAllMemberBar" onClick={handleCheckMoreMember}>
              查看更多
            </a>
          )}
        </div>
        {/* <Divider className="boldDivider" /> */}
        {/* <List style={{ margin: '12px 0' }} className="setting-list">
          <List.Item>
            我在本群的昵称
            <Space className="listValue">
              {!modifyFieldProps.userNickVisible ? (
                <>
                  {conversationDetail?.relationVO?.userNick || '未设置'}
                  <EditOutlined
                    onClick={() => {
                      setModifyFieldProps({
                        ...modifyFieldProps,
                        userNickVisible: true,
                      });
                    }}
                  />
                </>
              ) : (
                <Input
                  maxLength={8}
                  defaultValue={conversationDetail?.relationVO?.userNick}
                  onPressEnter={handleModifyNickName}
                  onBlur={handleModifyNickName}
                />
              )}
            </Space>
          </List.Item>
          <List.Item>
            群备注
            <Space className="listValue">
              {!modifyFieldProps.userMarkVisible ? (
                <>
                  {conversationDetail?.relationVO?.userMark || '未设置'}
                  <EditOutlined
                    onClick={() => {
                      setModifyFieldProps({
                        ...modifyFieldProps,
                        userMarkVisible: true,
                      });
                    }}
                  />
                </>
              ) : (
                <Input
                  maxLength={8}
                  defaultValue={conversationDetail?.relationVO?.userMark}
                  onPressEnter={handleModifyUserMark}
                  onBlur={handleModifyUserMark}
                />
              )}
            </Space>
          </List.Item>
        </List> */}
        <Divider className="boldDivider" />
        <List style={{ margin: '12px 0' }} className="setting-list">
          <List.Item>
            群介绍
            <Space className="listValue">
              {!modifyFieldProps.remarkVisible ? (
                <>
                  {conversationDetail.remark || '无'}
                  <EditOutlined
                    onClick={() => {
                      setModifyFieldProps({
                        ...modifyFieldProps,
                        remarkVisible: true,
                      });
                    }}
                  />
                </>
              ) : (
                <Input.TextArea
                  maxLength={100}
                  defaultValue={conversationDetail.remark}
                  onBlur={(e) => handleModifyRemark(e.target.value)}
                />
              )}
            </Space>
          </List.Item>
          <List.Item>
            群公告
            <Space className="listValue">
              {!modifyFieldProps.noticeVisible ? (
                <>
                  {conversationDetail.notice || '无'}
                  <EditOutlined
                    onClick={() => {
                      setModifyFieldProps({
                        ...modifyFieldProps,
                        noticeVisible: true,
                      });
                    }}
                  />
                </>
              ) : (
                <Input.TextArea
                  maxLength={400}
                  defaultValue={conversationDetail.notice}
                  onBlur={(e) => handleModifyNotice(e.target.value)}
                />
              )}
            </Space>
          </List.Item>
          {!mySdkStore.isHideSomeFunctions && (
            <List.Item>
              群标签
              <Space className="listValue" onClick={handleCollect}>
                {(conversationDetail.tags || []).join('、') || '无'}
                <RightOutlined />
              </Space>
            </List.Item>
          )}
          {(myUserId === conversationDetail.ownerId ||
            (conversationDetail.adminUsers || []).indexOf(myUserId) > -1 ||
            administratorsFlag) && (
            <List.Item>
              群管理
              <Space className="listValue">
                <RightOutlined onClick={handleGroupManageVisible} />
              </Space>
            </List.Item>
          )}
          <ChatGroupManage
            cid={cid}
            img={conversationDetail?.sessionLogoUrl}
            childrenDrawer={childrenDrawer}
            onClose={onClose}
            isOwner={myUserId === conversationDetail.ownerId}
            onChildrenDrawerClose={onChildrenDrawerClose}
            administratorsFlag={administratorsFlag}
          ></ChatGroupManage>
          <ClearChat cidProps={cid} borderType={'bottom'}></ClearChat>
        </List>
        <Divider className="boldDivider" />
        <List style={{ margin: '12px 0' }}>
          {myUserId === conversationDetail.ownerId && (
            <List.Item onClick={handleDismissGroupChat} className="buttonBar">
              解散群聊
            </List.Item>
          )}
          {myUserId !== conversationDetail.ownerId && (
            <List.Item onClick={handleQuitGroupChat} className="buttonBar">
              退出群聊
            </List.Item>
          )}
        </List>
        {collectionCompProps.visible && <TagModal {...collectionCompProps} />}
        {addToGroupVisible && (
          <SelecteGroupMember
            cid={cid}
            type="add"
            onClose={closeGroupVisible}
          />
        )}
      </div>
    </Drawer>
  );
}
