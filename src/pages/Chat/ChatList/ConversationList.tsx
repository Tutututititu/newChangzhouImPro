import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import PubSub from 'pubsub-js';
import { useModel } from 'umi';
import { message as Message, List, Menu, Skeleton } from 'antd';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';

import ChatInboxCard from '@/components/ChatInboxCard';
import TagModal from '@/components/TagModal';

import { resolveMsgFormContent } from '@/utils';

import './style.less';

const ConverList = forwardRef((props, ref) => {
  const { onCidChange } = props;
  useImperativeHandle(ref, () => ({
    toChangeGroupName,
  }));
  const {
    sdk,
    newMessage,
    userInfo: { userId: myUserId },
    globalConverList,
    updateGlobalConverList,
    clearGlobalConverList,
    setPagePath,
    userInfo: getMyUserInfo,
  } = useModel('global');
  console.log('newMessage=====', newMessage);
  console.log('globalConverList=====', globalConverList);
  const [currentCid, setCurrentCid] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [topModeId, setTopModeId] = useState();
  const [shieldModeId, setShieldMode] = useState();
  const [topModeList, setTopModeList] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTankTopList = async () => {
    const group = await sdk.queryConversationGroups();
    const topModeId = group.find(
      (item) => item.groupName.indexOf('置顶') > -1,
    )?.id;
    const shieldModeId = group.find(
      (item) => item.groupName.indexOf('打扰') > -1,
    )?.id;
    setTopModeId(topModeId);
    setShieldMode(shieldModeId);
    if (topModeId) {
      const { list = [] } = await sdk.queryConversationListByGroup({
        pageIndex: 1,
        pageSize: 100,
        groupId: topModeId,
      });
      const newConvers = list.map((conver) => {
        const {
          gmtCreate,
          lastMsgContentType,
          lastMsgContent,
          lastMsgSenderId,
          lastMsgRecallStatus,
        } = conver;
        const lastMsg =
          lastMsgRecallStatus > 0
            ? `${lastMsgSenderId === myUserId ? '你' : '对方'}撤回了一条消息`
            : resolveMsgFormContent(lastMsgContentType, lastMsgContent);
        return {
          ...conver,
          gmtCreate: moment(gmtCreate).format('YYYY/MM/DD HH:mm:ss'),
          lastMsg,
        };
      });
      // updateGlobalConverList(newConvers);
      setTopModeList(newConvers);
      return newConvers;
    } else {
      return [];
    }
  };
  const toChangeGroupName = async () => {
    await getConver(1, true, topModeList);
  };
  const getConver = (pageIndex: number, clear: boolean, topList?) => {
    sdk
      .queryConversationList({ pageIndex, pageSize: 500, type: 'all' })
      .then((data) => {
        const { list, totalPage } = data;
        setPagination({ pageIndex, totalPage });
        setLoading(false);
        const newConvers = list
          .map((conver) => {
            const {
              gmtCreate,
              lastMsgContentType,
              lastMsgContent,
              lastMsgSenderId,
              lastMsgRecallStatus,
            } = conver;
            const lastMsg =
              lastMsgRecallStatus > 0
                ? `${
                    lastMsgSenderId === myUserId ? '你' : '对方'
                  }撤回了一条消息`
                : resolveMsgFormContent(lastMsgContentType, lastMsgContent);
            return {
              ...conver,
              gmtCreate: moment(gmtCreate).format('YYYY/MM/DD HH:mm:ss'),
              lastMsg,
            };
          })
          .filter(
            (item) =>
              !(topList || topModeList).find(({ cid }) => item.cid === cid),
          );

        const conversList = [...(topList || []), ...newConvers];
        if (clear) {
          updateGlobalConverList([...conversList]);
        } else {
          updateGlobalConverList([...globalConverList, ...conversList]);
        }
      });
  };

  const refreshConverData = async () => {
    const topModeList = await getTankTopList();
    await getConver(1, true, topModeList);
  };

  const resolveNewMessage = (msgs) => {
    const lastMsg = msgs[msgs.length - 1];
    const {
      cid,
      msgType,
      msgContent,
      msgId,
      lastMsgRecallStatus,
      lastMsgSenderId,
      from,
    } = lastMsg;

    const newConvers = [...globalConverList];
    const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
    if (matchIndex >= 0) {
      const lastMsg =
        lastMsgRecallStatus > 0
          ? `${lastMsgSenderId === myUserId ? '你' : '对方'}撤回了一条消息`
          : resolveMsgFormContent(msgType, msgContent);
      console.log('onNewMessage change lastmag>>>:', matchIndex, lastMsg);
      const matchItem = newConvers[matchIndex];
      const { unReadCount, bizParams } = matchItem;
      // 计算新的会话维度，考虑是否默认已读，是否存在转发、多端同步等本人发送的消息
      const converDefaultRead = bizParams.is_default_read;
      let calcuUnReadCount = unReadCount;
      if (
        !converDefaultRead &&
        from?.userId !== myUserId &&
        cid !== currentCid
      ) {
        calcuUnReadCount = unReadCount + msgs.length;
      }
      newConvers[matchIndex] = {
        ...matchItem,
        unReadCount: calcuUnReadCount,
        lastMsgId: msgId,
        lastMsgContentType: msgType,
        lastMsg,
        gmtModified: new Date().valueOf(),
        bizParams: { ...bizParams, is_hidden: '0' },
      };
      if (bizParams.is_hidden === '1') {
        sdk.addConversationUserMark({
          cid,
          marks: [{ propertyName: 'is_hidden', propertyValue: 0 }],
        });
      }
    }
    updateGlobalConverList([...newConvers]);
  };

  const msgStatusChange = (msg, list) => {
    switch (msg.msgStateChangeType) {
      case 'deleteFromCursor':
        modificationList(msg, list);
        break;
      case 'recall':
        refreshConverData();
        PubSub.publish('chehuiToo', msg);
        break;
    }
  };

  const modificationList = (msg, list) => {
    list.forEach((x) => {
      if (x.cid == msg.cid) {
        x.lastMsg = '';
      }
    });
    updateGlobalConverList([...globalConverList]);
  };

  const sendMessageOk = (messageData, converList) => {
    console.log('onSendMessageOk----------', messageData, converList);
    const {
      cid,
      msgType,
      msgContent,
      messageContentType,
      msgId,
      lastMsgRecallStatus,
      lastMsgSenderId,
      from,
    } = messageData;
    if (!messageContentType) return;

    const newConvers = [...converList];
    const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
    console.log('matchIndex>>>:', matchIndex);
    if (matchIndex >= 0) {
      const lastMsg =
        lastMsgRecallStatus > 0
          ? `${lastMsgSenderId === myUserId ? '你' : '对方'}撤回了一条消息`
          : resolveMsgFormContent(msgType, msgContent);
      console.log('onSendMessageOk change lastmag>>>:', matchIndex, lastMsg);
      const matchItem = newConvers[matchIndex];
      const { unReadCount, bizParams } = matchItem;
      // 计算新的会话维度，考虑是否默认已读，是否存在转发、多端同步等本人发送的消息
      const converDefaultRead = bizParams.is_default_read;
      let calcuUnReadCount = unReadCount;
      if (!converDefaultRead && from?.userId !== myUserId) {
        calcuUnReadCount = unReadCount + 1;
      }
      newConvers[matchIndex] = {
        ...matchItem,
        unReadCount: calcuUnReadCount,
        lastMsgId: msgId,
        lastMsgContentType: msgType,
        lastMsg,
        gmtModified: new Date().valueOf(),
        bizParams: { ...bizParams, is_hidden: '0' },
      };
      if (bizParams.is_hidden === '1') {
        sdk.addConversationUserMark({
          cid,
          marks: [{ propertyName: 'is_hidden', propertyValue: 0 }],
        });
      }
    }
    updateGlobalConverList([...newConvers]);
  };

  useEffect(() => {
    setTopModeList([]);
    refreshConverData();
    PubSub.subscribe('chehui', (_, msg) => {
      refreshConverData();
    });
    PubSub.subscribe('getNewList', () => {
      refreshConverData();
    });
    // let params = {
    //   key: 'newFirend',
    //   // lastMsgSendTime: 'x'
    // };
    // console.log(globalConverList, 'plp');

    // [...globalConverList].push(params);
    updateGlobalConverList([...globalConverList]);
    return () => {
      PubSub.unsubscribe('chehui');
      clearGlobalConverList();
    };
  }, []);

  const checkMsgList = () => {
    let index = globalConverList.findIndex(
      (val) => val?.cid == newMessage[0]?.cid,
    );
    return !!index;
  };

  useEffect(() => {
    if (newMessage && newMessage.length) {
      resolveNewMessage(newMessage);
      if (
        getMyUserInfo?.sessionVo?.cid == newMessage[0]?.cid ||
        checkMsgList()
      ) {
        // 这里又个bug 如果列表被隐藏, 发送消息时候, 不会置顶到最上, 先用500条顶上
        getMyCat();
      }
      if (newMessage[0]?.msgContent?.dataType == 'meetingCard') {
        let utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'
        let u8arr = new Uint8Array(newMessage[0]?.msgContent?.data);
        let val = JSON.parse(utf8decoder.decode(u8arr));
        if (val.type == 'makeMeetingInvite') {
        } else {
          PubSub.publish('showMeetDetail', {
            props: newMessage[0],
            val,
            type: 'add',
          });
        }
      }
    }
  }, [newMessage]);

  useEffect(() => {
    sdk.onMsgStatusChange = (res) => msgStatusChange(res, globalConverList);
    if (sdk && globalConverList && globalConverList.length) {
      sdk.onSendMessageOk = (data) => sendMessageOk(data, globalConverList);
    }
    let numSum = addUnReadCount(globalConverList);
    PubSub.publish('numSum', numSum);
  }, [globalConverList]);

  useEffect(() => {
    sdk.onGroupInfoChange = (updateGroupRepones) => {
      const { cid, updateType, name, logoUrl } = updateGroupRepones;

      const newConvers = [...globalConverList];
      const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
      if (matchIndex > -1) {
        const matchItem = newConvers[matchIndex];
        if (updateType === 'name') {
          newConvers[matchIndex] = { ...matchItem, name };
        } else if (updateType === 'logo') {
          newConvers[matchIndex] = { ...matchItem, logoUrl };
        }
      }
      updateGlobalConverList([...newConvers]);
      console.log('onGroupInfoChange>>>: ', updateGroupRepones);
    };

    sdk.onConverChange = (changeInfo) => {
      // setPageIndex(1);
      refreshConverData();
      setCurrentCid(changeInfo.cid);
    };

    // return () => {
    //   removeStore('ConversationList');
    // };
  }, [sdk]);

  const conversationEdit = (action, converInfo) => {
    const { lastMsgId, cid, bizParams = {} } = converInfo;
    console.log('conversationEdit>>>', action, converInfo);
    const { val } = action;
    if (!sdk) return;
    if (val === 'allRead') {
      //消息游标已读
      sdk.changeMessagesStatus({ type: 'read', cursorMsgId: lastMsgId, cid });

      const newConvers = [...globalConverList];
      const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
      if (matchIndex > -1) {
        const matchItem = newConvers[matchIndex];
        newConvers[matchIndex] = { ...matchItem, unReadCount: 0 };
      }
      updateGlobalConverList([...newConvers]);
    }
    if (val === 'is_default_read') {
      //会话新消息默认已读
      const newDefaultReadState = !bizParams.is_default_read;
      sdk.setConversationTag({
        cid,
        type: 'is_default_read',
        value: newDefaultReadState,
      });

      const newConvers = [...globalConverList];
      const matchIndex = newConvers.findIndex((conver) => conver.cid === cid);
      if (matchIndex > -1) {
        const matchItem = newConvers[matchIndex];
        const { bizParams = {} } = matchItem;
        newConvers[matchIndex] = {
          ...matchItem,
          bizParams: { ...bizParams, is_default_read: newDefaultReadState },
        };
      }
      updateGlobalConverList([...newConvers]);
    }

    if (val === 'remove') {
      sdk
        .addConversationUserMark({
          cid,
          marks: [{ propertyName: 'is_hidden', propertyValue: 1 }],
        })
        .then((res) => {
          if (res?.errorMessage) {
            Message.error(res.errorMessage);
            return;
          }

          const newConvers = [...globalConverList];
          updateGlobalConverList([
            ...newConvers.filter((item) => item.cid !== cid),
          ]);
        });

      onCidChange(null);
    }
  };

  const toChatPage = (cid: string) => {
    setCurrentCid(cid);
    onCidChange(cid);
  };

  const handleToggleShieldMode = async (cid, rowData) => {
    if (!rowData.shieldMode) {
      // 设置免打扰
      rowData.shieldMode = true;
      await sdk.addConversationToGroups({ cid, groupId: shieldModeId });
      console.log(
        globalConverList.map((item) => (item.cid === cid ? rowData : item)),
      );
      const newConvers = [...globalConverList];
      updateGlobalConverList(
        newConvers.map((item) => (item.cid === cid ? rowData : item)),
      );
    } else {
      // 取消免打扰
      rowData.shieldMode = false;
      await sdk.removeConversationFromGroups({ cid, groupId: shieldModeId });

      const newConvers = [...globalConverList];
      updateGlobalConverList(
        newConvers.map((item) => (item.cid === cid ? rowData : item)),
      );
    }
  };

  const handleToggleStayTop = async (cid, rowData) => {
    if (!rowData.topMode) {
      // 置顶
      rowData.topMode = true;
      await sdk.addConversationToGroups({ cid, groupId: topModeId });

      const newConvers = [...globalConverList];
      updateGlobalConverList([
        rowData,
        ...newConvers.filter((item) => item.cid !== cid),
      ]);
      setTopModeList([...topModeList, rowData]);
    } else {
      // 取消置顶
      rowData.topMode = false;
      await sdk.removeConversationFromGroups({ cid, groupId: topModeId });

      const newConvers = [...globalConverList];
      updateGlobalConverList([
        ...newConvers.filter((item) => item.cid !== cid),
        rowData,
      ]);
      setTopModeList((converList) => {
        return converList.filter((item) => item.cid !== cid);
      });
    }
  };
  const handleToggleClearChat = async (cid, con) => {
    let params = {
      cid,
    };
    PubSub.publish('clearMsg', cid);
    const res = await sdk.querySingleConversation(params);
    let { lastMsgId } = res;
    clear(lastMsgId);
  };

  const clear = async (lastMsgId: string) => {
    let params = { type: 'delete', cursorMsgId: lastMsgId };
    await sdk.changeMessagesStatus(params);
    updateGlobalConverList([...globalConverList]);
  };

  const handleRemoveConversation = async (cid) => {
    const res = await sdk.addConversationUserMark({
      cid,
      marks: [{ propertyName: 'is_hidden', propertyValue: 1 }],
    });
    if (res?.errorMessage) {
      Message.error(res.errorMessage);
      return;
    }

    const newConvers = [...globalConverList];
    updateGlobalConverList(newConvers.filter((item) => item.cid !== cid));

    onCidChange(null);
  };

  const handleCollectionOk = async (tagCodes) => {
    try {
      await sdk.collectSession({ cid: currentCid, tagCodes });
      Message.success('标记成功');
      setTagModalVisible(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleCollect = (cid: string) => {
    setCurrentCid(cid);
    setTagModalVisible(true);
  };

  const handleRead = async (cid, conver) => {
    try {
      await sdk.changeMessagesStatus({
        type: 'read',
        cursorMsgId: conver.lastMsgId,
        cid,
      });
      PubSub.publish('getNewList');
    } catch (e) {
      console.log(e);
      Message.error(e.errorMessage);
    }
  };

  const handleGroupSeting = async (cid, conver) => {
    await setPagePath({ activeIcon: 'chat', cid, action: 'openSeting' });
  };

  const createConverOpesationAction = (cid: string, conver: any) => {
    {
      return conver.type == 'group' ? (
        <Menu>
          {[
            {
              label: conver.topMode ? '取消置顶' : '置顶会话',
              key: 'stayTop',
              onClick: () => handleToggleStayTop(cid, conver),
            },
            // {
            //   label: '标签',
            //   key: 'setTag',
            //   onClick: () => handleCollect(cid),
            // },
            {
              label: '移除会话',
              key: 'remove',
              onClick: () => handleRemoveConversation(cid),
            },
            {
              label: conver.shieldMode ? '取消免打扰' : '消息免打扰',
              key: 'setShildMode',
              onClick: () => handleToggleShieldMode(cid, conver),
            },
            {
              label: '群设置',
              key: 'groupSeting',
              onClick: () => handleGroupSeting(cid, conver),
            },
            {
              label: '一键已读',
              key: 'onceRead',
              onClick: () => handleRead(cid, conver),
            },
            {
              label: '快捷清空聊天记录',
              key: 'clearChatXiu',
              onClick: () => handleToggleClearChat(cid, conver),
            },
          ].map((item) => (
            <Menu.Item key={item.key} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      ) : (
        <Menu>
          {[
            {
              label: conver.topMode ? '取消置顶' : '置顶会话',
              key: 'stayTop',
              onClick: () => handleToggleStayTop(cid, conver),
            },
            {
              label: '标签',
              key: 'setTag',
              onClick: () => handleCollect(cid),
            },
            {
              label: '移除会话',
              key: 'remove',
              onClick: () => handleRemoveConversation(cid),
            },
            {
              label: conver.shieldMode ? '取消免打扰' : '消息免打扰',
              key: 'setShildMode',
              onClick: () => handleToggleShieldMode(cid, conver),
            },
            {
              label: '一键已读',
              key: 'onceRead',
              onClick: () => handleRead(cid, conver),
            },
            {
              label: '快捷清空聊天记录',
              key: 'clearChatXiu',
              onClick: () => handleToggleClearChat(cid, conver),
            },
          ].map((item) => (
            <Menu.Item key={item.key} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ))}
        </Menu>
      );
    }
  };
  const addUnReadCount = (val) => {
    let list = val.map((x) => {
      if (x?.type) {
        if (x.type == 'group' || x.type == 'single') return x.unReadCount;
      }
    });

    if (list.length) {
      let sum = list.reduce((res, rej) => {
        return res + rej;
      });
      return sum;
    } else {
      return 0;
    }
  };

  const getMyCat = async () => {
    await refreshConverData();
  };
  const renderRow = (rowData) => {
    const { cid, bizParams = {} } = rowData;
    const { is_default_read } = bizParams;
    return (
      <List.Item>
        <Skeleton loading={loading} paragraph={{ rows: 1 }} active avatar>
          <ChatInboxCard
            key={cid}
            onCardClicked={() => toChatPage(cid)}
            {...rowData}
            isDefaultRead={is_default_read}
            currentCid={currentCid}
            editFunc={(action) => conversationEdit(action, rowData)}
            dropdownMenu={createConverOpesationAction(cid, rowData)}
          />
        </Skeleton>
      </List.Item>
    );
  };

  return (
    <>
      <div id="scrollableDiv" style={{ overflow: 'auto' }} className="leftList">
        <InfiniteScroll
          dataLength={globalConverList.length}
          next={() => getConver(pagination.pageIndex + 1, false)}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
          scrollableTarget="scrollableDiv"
        >
          <List
            className="converList"
            rowKey="cid"
            dataSource={globalConverList.filter(
              (item) => item.bizParams?.is_hidden !== '1',
            )}
            renderItem={renderRow}
            loadMore={pagination.pageIndex < pagination.totalPage}
          />
        </InfiniteScroll>
      </div>
      {tagModalVisible && (
        <TagModal
          onClose={() => setTagModalVisible(false)}
          onOk={handleCollectionOk}
        />
      )}
    </>
  );
});

export default ConverList;
