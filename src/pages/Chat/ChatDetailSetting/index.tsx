import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Switch, Space, message as Message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ClearChat from '../../../components/ClearChat';
import copy from 'copy-text-to-clipboard';
import PubSub from 'pubsub-js';
import AvatarImage from '../../../components/AvatarImage';
import UseMsgCard from '../../../components/UseMsgCard/useMsgCard';
import { ConversationInfo } from '@/typings/chat';

import './style.less';
import { Drawer } from 'antd';

interface Props {
  cid: string;
  converInfo: ConversationInfo;
  onClose: () => void;
}

export default function (props: Props) {
  const { sdk, setPagePath } = useModel('global');
  const { cid, converInfo, onClose } = props;
  const [groups, setGroups] = useState({ topModeId: 0, shieldModeId: 0 });
  const [conversationDetail, setConversationDetail] =
    useState<ConversationInfo>(converInfo);
  const [messageApi, contextHolder] = Message.useMessage();
  const querySwitch = async () => {
    const group = await sdk.queryConversationGroups();
    const topModeId = group.find(
      (item) => item.groupName.indexOf('置顶') > -1,
    )?.id;
    const shieldModeId = group.find(
      (item) => item.groupName.indexOf('免打扰') > -1,
    )?.id;
    setGroups({ topModeId, shieldModeId });
  };
  let [userMoreCardFlage, setUserMoreCardFlage] = useState(false);
  let [useData, setUseData] = useState();
  useEffect(() => {
    querySwitch();
  }, []);

  const handleModeChange = async (groupId: number, modeName: string) => {
    if (!groupId) {
      return;
    }
    const api = conversationDetail[modeName]
      ? 'removeConversationFromGroups'
      : 'addConversationToGroups';
    await sdk[api]({ cid, groupId });
    setConversationDetail({
      ...conversationDetail,
      [modeName]: !conversationDetail[modeName],
    });
    PubSub.publish('getNewList');
  };

  const handleModeChangeTwo = async (groupId: number, modeName: string) => {
    if (!groupId) {
      return;
    }
    const api = conversationDetail[modeName]
      ? 'removeConversationFromGroups'
      : 'addConversationToGroups';
    await sdk[api]({ cid, groupId });
    setConversationDetail({
      ...conversationDetail,
      [modeName]: !conversationDetail[modeName],
    });
    PubSub.publish('getNewList');
  };

  const handleCopy = (text: string) => {
    copy(text);
    Message.success('ID复制成功');
  };

  const showUserMoreMsg = async () => {
    if (!userMoreCardFlage) {
      let params = {
        queryUserId: conversationDetail.subUserId,
      };
      const res = await sdk.queryUserInfoById(params);
      setUseData(res);
      setUserMoreCardFlage(true);
    } else {
      setUserMoreCardFlage(false);
    }
  };
  const success = () => {
    messageApi.open({
      type: 'success',
      content: '删除成功',
    });
  };

  const openMsg = async () => {
    setUserMoreCardFlage(false);
    try {
      const res = await sdk.createConversation({
        type: 'single',
        subUserId: useData.userId,
      });
      console.log(res, 'pppp');
      setPagePath({ activeIcon: 'chat', cid: res.cid });
    } catch (e) {
      Message.error('操作失败');
    }
  };
  return (
    <div className="chatBox">
      {contextHolder}
      {userMoreCardFlage ? (
        <UseMsgCard
          successMsg={success}
          setUserMoreCardFlage={openMsg}
          conversationDetail={conversationDetail}
          useDataProps={useData}
        ></UseMsgCard>
      ) : null}
      <Drawer visible title="聊天设置" onClose={onClose}>
        <div className="chatDetailSettingPage">
          <List className="userInfo">
            <List.Item>
              <List.Item.Meta
                avatar={
                  <AvatarImage
                    onClick={() => showUserMoreMsg()}
                    src={conversationDetail.subAvatarUrl}
                    nickName={conversationDetail.nickName}
                    userName={conversationDetail.userName}
                    userId={conversationDetail.userId}
                    style={{ marginBottom: 8, borderRadius: 8 }}
                    fit="cover"
                    width={42}
                    height={42}
                  />
                }
                title={
                  conversationDetail.nickName || conversationDetail.userName
                }
                description={
                  <Space>
                    {/* Id: {conversationDetail.subUserId}{' '} */}
                    {/* <a>
                      <CopyOutlined
                        onClick={() => handleCopy(conversationDetail.subUserId)}
                      />
                    </a> */}
                  </Space>
                }
              />
            </List.Item>
          </List>
          <List style={{ marginBottom: 12 }} split={false}>
            <List.Item
              extra={
                <Switch
                  checked={conversationDetail.topMode}
                  onChange={() => handleModeChange(groups.topModeId, 'topMode')}
                />
              }
            >
              置顶聊天
            </List.Item>
            <List.Item
              extra={
                <Switch
                  checked={conversationDetail.shieldMode}
                  onChange={() =>
                    handleModeChangeTwo(groups.shieldModeId, 'shieldMode')
                  }
                />
              }
            >
              消息免打扰
            </List.Item>
            <List>
              <ClearChat cidProps={cid}></ClearChat>
            </List>
          </List>
          {/* todo: 没有清空聊天记录Api */}
          {/* <div className="buttonBar" style={{ color: '#E02020', textAlign: 'center'}} onClick={handleClearChatHistory}>清空聊天记录</div> */}
          {/* todo: 没有密聊相关Api */}
          {/* <div className="buttonBar"><a>进入密聊</a></div> */}
        </div>
      </Drawer>
    </div>
  );
}
