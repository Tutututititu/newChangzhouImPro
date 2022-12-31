import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { useModel, history } from 'umi';
import { Popover, Input, List } from 'antd';
import PubSub from 'pubsub-js';
import Barcode from '@/components/scanQRC';
import {
  CommentOutlined,
  UserOutlined,
  SearchOutlined,
  PlusCircleOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  VideoCameraOutlined,
  PlusSquareOutlined,
  VideoCameraAddOutlined,
  // VideoCameraOutlined,
  SaveOutlined,
  ExpandOutlined,
  // ThunderboltOutlined,
} from '@ant-design/icons';
import AddUserModal from './AddUserModal';
import SelectSingleMember from '@/components/SelectSingleMember';
import SelecteGroupMember from '@/components/SelecteGroupMember';
import GlobalSearch from '@/pages/Chat/GlobalSearch';
import MeetingBlack from '@/components/meetingBlackboard';
import { TabKeys } from './config';
import { debounce } from 'lodash';
import MyInfoModal from '@/components/MyInfoModal';
import AvatarImage from '@/components/AvatarImage';
import AppointmentMeeting from '@/components/AppointmentMeeting';
import AppointmentMeetingDetail from '@/components/AppointmentMeetingDetail';
import styles from './styles.less';
import axios from 'axios';

export default function (props) {
  const [inputValue, setInputValue] = useState('');
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const {
    userInfo,
    pagePath,
    mySdkStore,
    newFirend,
    sdk,
    setPagePath,
    serNewFirend,
  } = useModel('global');
  const { onActiveIconChange } = props;
  const [globalSearchProps, setGlobalSearchProps] = useState({
    visible: false,
    keyword: '',
  });
  const [getPropsSta, setGetProps] = useState();
  const [valSta, valProps] = useState();
  const [activeKey, setActiveKey] = useState(
    pagePath.activeIcon || TabKeys.Chat,
  );
  // newSdkIns.onNewFriendRequest = (newFriendRepones) => {
  //   console.log('onNewFriendRequest>>>: ', newFriendRepones);
  //   const { userId, inviteBizNo } = newFriendRepones;
  //   setTimeout(() => {
  //     /**同意好友申请 */
  //     newSdkIns.replyAddFriendRequest({ invitedNo: inviteBizNo, accept: true, toUserId: userId });
  //   }, 100);
  // };
  const [havNewFirend, setHavNewFirend] = useState(false);
  const [meetDetail, setMeetDetail] = useState(false);
  useEffect(() => {
    if (newFirend) {
      setHavNewFirend(true);
    } else {
      setHavNewFirend(false);
    }
  }, [newFirend]);
  const [
    createGroupConversationModalVisible,
    setCreateGroupConversationModalVisible,
  ] = useState(false);
  const handleSearch = (e) => {
    const value = e.target.value;
    setGlobalSearchProps({ visible: !!value, keyword: value });
    setInputValue(value);
  };
  const [openType, setOpenType] = useState('make');
  useEffect(() => {
    PubSub.subscribe('offVisible', (_, res) => {
      setGlobalSearchProps({ visible: res, keyword: '' });
      // inputRef!.current!.input!.value = '';
      setInputValue('');
    });
    PubSub.subscribe('showMeetDetail', (_, params) => {
      setGetProps(params.props);
      valProps(params.val);
    });
    sdk
      .queryFriendApplyListByStatus({
        pageIndex: 1,
      })
      .then((res) => {
        checkNewFriendList(res);
      });
    return () => {
      setGlobalSearchProps({ visible: false, keyword: '' });
      PubSub.unsubscribe('offVisible');
      PubSub.unsubscribe('showMeetDetail');
    };
  }, []);
  useEffect(() => {
    if (getPropsSta && valSta) {
      setMeetDetail(true);
      console.log(getPropsSta, valSta, '1 - 2');
    }
  }, [getPropsSta, valSta]);
  useEffect(() => {
    if (meetDetail == false) {
      setGetProps('');
      valProps('');
    }
  }, [meetDetail]);
  const checkNewFriendList = (val) => {
    console.log(val, 'v -a -l');

    if (val && val?.rows?.length) {
      let list = val.rows.filter((x) => {
        return x.status != 0;
      });
      if (list?.length) {
        serNewFirend(list);
      }
    }
  };
  const handleChangeTabKey = (key: string) => {
    setActiveKey(key);
    onActiveIconChange(key);
  };
  const handleAddUser = () => {
    setAddUserModalVisible(true);
    setOpen(false);
  };
  const [createMeeting, setCreateMeeting] = useState(false);
  const [createMeetingJoin, setCreateMeetingJoin] = useState(false);
  const [makeMeeting, setMakeMeeting] = useState(false);
  const [selectSingleMemberVisible, setSelectSingleMemberVisible] =
    useState(false);
  const handleCreateGroupConversation = () => {
    setCreateGroupConversationModalVisible(true);
    setOpen(false);
  };

  const handleCreateConversation = () => {
    setSelectSingleMemberVisible(true);
    setOpen(false);
  };

  const handleCreateMeeting = () => {
    setCreateMeeting(true);
  };
  const handleCreateMeetingJoin = () => {
    setCreateMeetingJoin(true);
  };
  //创建会议
  const toCreateMeeting = (
    createUserName: any,
    creator: any,
    subject: any,
    type = 0,
    users = [],
    notifyBySingleSession = true,
  ) => {
    let urlTitle = window.location.protocol;
    axios
      .post(
        // `/api/meeting/create.json`, {
        `/api/meeting/create.json`,
        {
          appId: '9B16148C616CECA0', //appId，必填
          createUserName: createUserName, //创建会议用户名称，必填
          creator: creator, //创建会议用户id，必填
          env: 'PROD', //环境id，必填
          location: '', //会议地点，可选
          notifyBySingleSession: notifyBySingleSession, //是否通过单聊发送通知，预约会议时生效，可选
          subject: subject, //会议主题，必填
          tntInstId: 'DEMOISVT', //租户id，必填
          type: type, //会议类型 0-立即开会 1-预约会议，必填
          users: users, //参与会议用户列表
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then((res) => {
        let data = res.data.data;
      });
  };

  //创建房间
  const toCreateRoom = (
    userId: any,
    roomId: any,
    roomToken: any,
    meetingId: any,
  ) => {
    let urlTitle = window.location.protocol;
    axios
      .post(
        // `/api/meeting/createRoom.json`, {
        `/api/meeting/createRoom.json`,
        {
          userId: userId, //用户id，必填
          meetingId: meetingId, //会议唯一编号，必填
          roomId: roomId, //房间id，必填
          roomToken: roomToken, //房间token，必填
        },
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //加入会议
  const toJoinMeeting = (userId: any, userName: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .post(`/api/meeting/joinMeeting.json`, {
        // `/api/meeting/joinMeeting.json`,
        // {
        userId: userId, //用户id，必填
        meetingId: meetingId, //会议唯一编号，必填
        userName: userName, //房间id，必填
      })
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //离开会议
  const toLeaveMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .post(`/api/meeting/leaveMeeting.json`, {
        // `/api/meeting/leaveMeeting.json`,
        // {
        userId: userId, //用户id，必填
        meetingId: meetingId, //会议唯一编号，必填
      })
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //关闭会议
  const toCloseMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .post(`/api/meeting/closeMeeting.json`, {
        // `/api/meeting/closeMeeting.json`,
        // {
        userId: userId, //用户id，必填
        meetingId: meetingId, //会议唯一编号，必填
      })
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //查询历史会议列表 支持我创建的会议和我加入的会议
  const toQueryHistoryMeetings = () => {
    let urlTitle = window.location.protocol;
    axios
      .post(`/api/meeting/queryHistoryMeetings.json`, {
        // `/api/meeting/queryHistoryMeetings.json`,
        // {
        pageIndex: 1, //开始页码，可选
        pageSize: 20, //每页记录大小，可选
        tntInstId: 'DEMOISVT', //租户id，必填
        appId: '9B16148C616CECA0', //appId，必填
        env: 'PROD', //环境id，必填
        createType: 'none', //创建方式 none-所有 create-我创建的 join-我加入的，可选
        userId: '0005c7c700d311edad0a6805cacc3098', //用户id，必填
      })
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //查询单个会议
  const toQueryOneMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .post(`/api/meeting/queryOneMeeting.json`, {
        // `/api/meeting/queryOneMeeting.json`,
        // {
        userId: userId, //用户id，必填
        meetingId: meetingId, //会议唯一编号，必填
      })
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //预约会议响应
  const toResponseMeeting = (
    userId: any,
    userName: any,
    meetingId: any,
    type: any,
  ) => {
    let urlTitle = window.location.protocol;
    axios
      .post(`/api/meeting/responseMeeting.json`, {
        // `/api/meeting/responseMeeting.json`,
        // {
        userId: userId, //用户id，必填
        userName: userName, //用户名称，必填
        meetingId: meetingId, //会议唯一编号，必填
        type: type, //响应操作类型0-决绝 1-接受 2-未响应 3-暂定
      })
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  const handleMakeMeeting = () => {
    setMakeMeeting(true);
  };
  const handleMeetingDetail = () => {
    console.log('进入');
  };
  const createPopoverItem = [
    // {
    //   key: 'addUser',
    //   icon: <UserAddOutlined style={{ marginRight: 15 }} />,
    //   text: '添加好友',
    //   handler: handleAddUser,
    // },
    {
      key: 'createConversation',
      icon: <UserOutlined style={{ marginRight: 15 }} />,
      text: '发起单聊',
      handler: handleCreateConversation,
    },
    {
      key: 'createGroupConversation',
      icon: <UsergroupAddOutlined style={{ marginRight: 15 }} />,
      text: '发起群聊',
      handler: handleCreateGroupConversation,
    },
    {
      key: 'createMeeting',
      icon: <VideoCameraOutlined style={{ marginRight: 15 }} />,
      text: '发起会议',
      handler: handleCreateMeeting,
    },
    // {
    //   key: 'makeMeeting',
    //   icon: <VideoCameraAddOutlined style={{ marginRight: 15 }} />,
    //   text: '预约会议',
    //   handler: handleMakeMeeting,
    // },
    {
      key: 'joinMeeting',
      icon: <PlusSquareOutlined style={{ marginRight: 15 }} />,
      text: '加入会议',
      handler: handleCreateMeetingJoin,
    },
    // { key: 'createChattingRoom', icon: <DesktopOutlined style={{ marginRight: 15 }} />, text: '创建聊天室', },
    // { key: 'createSecretConversation', icon: <LockOutlined style={{ marginRight: 15 }} />, text: '发起密聊' },
  ];
  const [showORC, setShowORC] = useState(false);
  const goQRC = () => {
    setShowORC(true);
  };
  const offQRC = () => {
    setShowORC(false);
  };
  useEffect(() => {
    isMobile();
  }, []);
  const [ismobileFlage, setIsMobildFlage] = useState(false);
  const isMobile = () => {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      setIsMobildFlage(true);
    } else {
      setIsMobildFlage(false);
    }
  };

  const plusMemu = (
    <List split={false}>
      {createPopoverItem.map((item) => (
        <List.Item key={item.key} onClick={item.handler}>
          {item.icon}
          {item.text}
        </List.Item>
      ))}
      {ismobileFlage && (
        <List.Item key={'QRCKey'} onClick={goQRC}>
          <ExpandOutlined style={{ marginRight: 15 }} />
          {'扫一扫'}
        </List.Item>
      )}
    </List>
  );
  const handleSearchWithDebounce = handleSearch;
  let [open, setOpen] = useState(false);
  const handleOpenChange = () => {
    setOpen(!open);
  };
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Popover
          destroyTooltipOnHide
          trigger={'click'}
          placement="topLeft"
          overlayClassName="userInfoPopover"
          content={
            <MyInfoModal
              userId={userInfo.userId}
              handleChangeTabKey={handleChangeTabKey}
            />
          }
          overlayStyle={{ width: 197 }}
        >
          <AvatarImage
            nickName={userInfo.nickName}
            userName={userInfo.userName}
            userId={userInfo.userId}
            style={{ borderRadius: '12px', marginLeft: '21px', paddingTop: 0 }}
            src={userInfo.avatarUrl}
            width={40}
            height={40}
            fit="fill"
          />
        </Popover>
        <div
          className={classNames({
            [styles.topItem]: true,
            [styles.active]: activeKey === TabKeys.Chat,
          })}
          onClick={() => handleChangeTabKey(TabKeys.Chat)}
        >
          <CommentOutlined style={{ fontSize: 18, display: 'block' }} />
          消息
        </div>
        <div
          className={classNames({
            [styles.topItem]: true,
            [styles.active]: activeKey === TabKeys.Mail,
          })}
          onClick={() => handleChangeTabKey(TabKeys.Mail)}
          style={{ position: 'relative' }}
        >
          {havNewFirend ? <div className={styles.havNewFirend}></div> : ''}
          <UserOutlined style={{ fontSize: 18, display: 'block' }} />
          通讯录
        </div>
        {
          <div className={styles.bottom}>
            <div
              className={classNames({
                [styles.topItem]: true,
                [styles.active]: activeKey === TabKeys.Collect,
              })}
              onClick={() => handleChangeTabKey(TabKeys.Collect)}
            >
              <SaveOutlined style={{ fontSize: 18, display: 'block' }} />
              收藏
            </div>
          </div>
        }
      </div>
      <div className={styles.searchBox}>
        <div className={styles.search}>
          <div style={{ position: 'relative' }}>
            {!mySdkStore.isHideSomeFunctions && (
              <Input
                value={inputValue}
                placeholder="搜索"
                prefix={<SearchOutlined />}
                className={styles.searchBar}
                onChange={handleSearchWithDebounce}
              />
            )}
            {globalSearchProps.visible && (
              <GlobalSearch
                {...globalSearchProps}
                onClose={() =>
                  setGlobalSearchProps({ visible: false, keyword: '' })
                }
              />
            )}
          </div>
        </div>
        <div className={styles.addIcon} onClick={handleOpenChange}>
          <Popover
            placement="topRight"
            title={null}
            overlayClassName="plusMemuList"
            content={plusMemu}
            trigger="click"
            open={open}
          >
            <PlusCircleOutlined
              style={{ marginLeft: 7, fontSize: '22px', cursor: 'pointer' }}
            />
          </Popover>
        </div>
      </div>
      {addUserModalVisible && (
        <AddUserModal onClose={() => setAddUserModalVisible(false)} />
      )}
      {selectSingleMemberVisible && (
        <SelectSingleMember
          onClose={() => setSelectSingleMemberVisible(false)}
        />
      )}
      {createGroupConversationModalVisible && (
        <SelecteGroupMember
          type="create"
          onClose={() => setCreateGroupConversationModalVisible(false)}
        />
      )}
      {createMeeting && (
        <MeetingBlack
          userInfo={userInfo}
          meetType={0}
          setCreateMeeting={setCreateMeeting}
          handleMeetingDetail={handleMeetingDetail}
        ></MeetingBlack>
      )}
      {createMeetingJoin && (
        <MeetingBlack
          jointype={'joinType'}
          userInfo={userInfo}
          meetType={0}
          setCreateMeeting={setCreateMeetingJoin}
          handleMeetingDetail={handleMeetingDetail}
        ></MeetingBlack>
      )}
      {showORC && (
        <Barcode
          offQRC={offQRC}
          sdk={sdk}
          userInfo={userInfo}
          setPagePath={setPagePath}
        ></Barcode>
      )}
      {makeMeeting && (
        <AppointmentMeeting
          userInfo={userInfo}
          makeMeeting={makeMeeting}
          setMakeMeeting={setMakeMeeting}
          // handleMeetingDetail={handleMeetingDetail}
        ></AppointmentMeeting>
      )}
      {meetDetail && (
        <AppointmentMeetingDetail
          userInfo={userInfo}
          meetDetail={meetDetail}
          meetingId={valSta.meetingId}
          otherProps={valSta}
          setMeetDetail={setMeetDetail}
        ></AppointmentMeetingDetail>
      )}
    </div>
  );
}
