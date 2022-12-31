// 在这个页面进行创建房间, 需要一个参数去判断是创建还是加入房间
import React, { useState, useEffect, useRef } from 'react';
import { Button, message as Message, Modal, Tag, Tabs } from 'antd';
import './style.less';

import AvatarImage from '@/components/AvatarImage';
import {
  ShrinkOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  UserAddOutlined,
  TeamOutlined,
  FolderViewOutlined,
  SettingOutlined,
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import {
  ContentType,
  CustomDataType,
  ConversationType,
  MsgTypeMap,
  RtcAction,
} from '../../constants';
import SelecteGroupMember from '@/components/SelecteGroupMember';
import { useModel } from 'umi';
import { getTimeDiff } from '@/utils';
import Cookie from 'js-cookie';
import { COOKIE_USER_KEY } from '@/constants';
import { range } from 'lodash';
import axios from 'axios';

export default function () {
  const { sdk, userInfo } = useModel('global');
  const { roomUserState, setRoomUserState, soloMute, setSoloMute } =
    useModel('metState');
  // @ts-ignore
  const {
    roomNum,
    visible,
    role,
    setRole,
    setVisible,
    props,
    setProps,
    connState,
    setConnState,
    groupController,
    audioState,
    setAudioState,
    videoState,
    setVideoState,
    roomState,
    setRoomState,
    roomId,
    setRoomId,
    roomToken,
    setRoomToken,
    sizePeople,
    setSizePeople,
    roomTitle,
    webMeeting,
    setWebMeeting,
    inMeetingType,
    setInMeetingType,
    infoSelectUser,
    setInfoSelectUser,
  } = useModel('meetingModal');
  const { rtcType, toList, selectedUserIds } = props;
  const [streamState, setStreamState] = useState(1); //共享文件
  useEffect(() => {
    setPublishList([]);
  }, []);
  const [createGroupConversationModal, setCreateGroupConversationModal] =
    useState(false);
  let timerId: any = null;
  const [durationTime, setDurationTime] = useState('--:--');
  const [startTime, setStartTime] = useState(0); //开始时间
  const [pageNum, setPageNum] = useState(1); //当前第几页
  const [pageTotal, setPageTotal] = useState(9); //当前总人数
  const [addToCreatMeeting, setAddToCreatMeeting] = useState();
  const [isInMeetingAdd, setIsInMeetingAdd] = useState(false);
  const [isShowSetBox, setIsShowSetBox] = useState(false);
  // useEffect(() => {
  //   if (webMeeting && visible) {
  //     if (isInMeetingAdd) {
  //       // 是否中途加人 或者踢人
  //     } else {
  //       // 没有中途加人踢人, 就是选择了人后进入
  //       groupController.OnInitRoomConfigOK = OnInitRoomConfigOK; //初始化房间成功回调
  //       groupController.OnLeaveRoom = OnLeaveRoom; //退出房间回调
  //       groupController.OnNewJoinerIn = OnNewJoinerIn; //有新加入的回调
  //       groupController.OnSubscribeSucc = OnSubscribeSucc; //订阅成功回调
  //       groupController.OnNewPublish = OnNewPublish; //有新发布推送,对表格做更新操作
  //       groupController.OnParticipantLeaveRoom = OnParticipantLeaveRoom; //推送“退出房间者”给与会者
  //       initRoomInfo();
  //     }
  //   }
  // }, [webMeeting]);

  useEffect(() => {
    if (inMeetingType == 'create') {
      // 创建房间
      groupController.OnCreateRoomSucc = OnCreateRoomSucc; //创建房间成功
      groupController.OnPublishSucc = OnPublishSucc; //发布媒体流成功
      groupController.OnJoinRoomSucc = OnJoinRoomSucc; //加入房间成功
      groupController.OnInitRoomConfigOK = OnInitRoomConfigOK; //初始化房间成功回调
      groupController.OnLeaveRoom = OnLeaveRoom; //退出房间回调
      groupController.OnNewJoinerIn = OnNewJoinerIn; //有新加入的回调
      groupController.OnSubscribeSucc = OnSubscribeSucc; //订阅成功回调
      groupController.OnNewPublish = OnNewPublish; //有新发布推送,对表格做更新操作
      groupController.OnParticipantLeaveRoom = OnParticipantLeaveRoom; //推送“退出房间者”给与会者
      groupController.OnReceiveTextMsg = OnReceiveTextMsg; // 接受新文本消息

      initRoomInfo();
      setInMeetingType();
      // if (infoSelectUser.length) {
      //   addCreateGroup(infoSelectUser);
      //   // inviteRoom();
      // }
    } else if (inMeetingType == 'add') {
      // groupController.OnCreateRoomSucc = OnCreateRoomSucc; //创建房间成功
      groupController.OnJoinRoomSucc = OnJoinRoomSucc; //加入房间成功
      groupController.OnPublishSucc = OnPublishSucc; //发布媒体流成功
      groupController.OnInitRoomConfigOK = OnInitRoomConfigOK; //初始化房间成功回调
      groupController.OnLeaveRoom = OnLeaveRoom; //退出房间回调
      groupController.OnNewJoinerIn = OnNewJoinerIn; //有新加入的回调
      groupController.OnSubscribeSucc = OnSubscribeSucc; //订阅成功回调
      groupController.OnNewPublish = OnNewPublish; //有新发布推送,对表格做更新操作
      groupController.OnParticipantLeaveRoom = OnParticipantLeaveRoom; //推送“退出房间者”给与会者
      groupController.OnReceiveTextMsg = OnReceiveTextMsg; // 接受新文本消息
      initRoomInfo();
      setInMeetingType();
    }
  }, [inMeetingType]);
  // if (inMeetingType == 'create') {
  //     // 创建房间
  //     groupController.OnInitRoomConfigOK = OnInitRoomConfigOK; //初始化房间成功回调
  //     groupController.OnLeaveRoom = OnLeaveRoom; //退出房间回调
  //     groupController.OnNewJoinerIn = OnNewJoinerIn; //有新加入的回调
  //     groupController.OnSubscribeSucc = OnSubscribeSucc; //订阅成功回调
  //     groupController.OnNewPublish = OnNewPublish; //有新发布推送,对表格做更新操作
  //     groupController.OnParticipantLeaveRoom = OnParticipantLeaveRoom; //推送“退出房间者”给与会者
  //     groupController.OnCreateRoomSucc = OnCreateRoomSucc; //创建房间成功
  //     groupController.OnJoinRoomSucc = OnJoinRoomSucc; //加入房间成功
  //     initRoomInfo();
  // } else if (inMeetingType == 'add') {

  // }
  useEffect(() => {
    if (startTime) {
      timerId = setInterval(() => {
        setDurationTime(getTimeDiff({ endTime: +new Date(), startTime }));
      }, 1000);
    }
    return () => {
      clearInterval(timerId);
    };
  }, [startTime]);
  useEffect(() => {
    return () => {};
  }, []);
  // useEffect(() => {
  //   if (!visible) return;
  //   console.log('进入当前页');
  //   groupController.OnInitRoomConfigOK = OnInitRoomConfigOK; //初始化房间成功回调
  //   groupController.OnLeaveRoom = OnLeaveRoom; //退出房间回调
  //   groupController.OnNewJoinerIn = OnNewJoinerIn; //有新加入的回调
  //   groupController.OnSubscribeSucc = OnSubscribeSucc; //订阅成功回调
  //   groupController.OnNewPublish = OnNewPublish; //有新发布推送,对表格做更新操作
  //   groupController.OnParticipantLeaveRoom = OnParticipantLeaveRoom; //推送“退出房间者”给与会者
  //   initRoomInfo();
  // }, [visible]);

  //初始化成功回调
  const OnInitRoomConfigOK = () => {
    if (role === 'caller') {
      console.log('初始化成功回调===创建');
      groupController.CreateRoom('signature');
      // 进入回调的时候去除我们的
      let feedId_id = document.getElementById('publish_video1').name;
    } else if (role == 'callee') {
      console.log('初始化成功回调===加入', userInfo.userId, '1111- 2222');
      groupController.JoinRoom(roomId, roomToken, getSign(userInfo.userId));
    }
  };
  const OnPublishSucc = (sid: any) => {
    console.log('发布流成功', sid);
    if (videoState === 0) {
      checkVideo(videoState);
    }
    if (audioState === 0) {
      checkAudio(audioState);
    }
  };
  const toQueryOneMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .get(
        `/api/meeting/queryOneMeeting.json?userId=${userId}&meetingId=${meetingId}`,
        {
          // `/api/meeting/queryOneMeeting.json?userId=${userId}&meetingId=${meetingId}`,
          // {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        console.log(res, '查询 - 单个会议');
        if (res?.data?.success) {
          let val = res.data.data.users;
          setRoomUserState(val);
        }
      });
  };
  const getAnyUserInfo = async (list) => {
    if (list?.length) {
      let params = [];
      for (let i = 0; i < list.length; i++) {
        const res = await sdk.queryUserInfoById({
          queryUserId: list[i].userId,
        });
        params.push(res);
      }
    }
  };
  //推送“退出房间者”给与会者
  const OnParticipantLeaveRoom = (uid: any, exitType: any) => {
    console.log('推送“退出房间者”给与会者======uid', uid);

    // groupController.SendTextMsg(`已退出/metSlice/`);
    roomUserState.forEach((x) => {
      if (x.userId == uid) {
        x.state = '2';
      }
    });

    filterInRoom();
  };
  //订阅成功回调
  const OnSubscribeSucc = (feedId: any, sid: any) => {
    console.log('订阅成功回调===feedId', feedId);
    console.log('订阅成功回调===sid', sid);
  };
  const getSign = (uid: any) => {
    const res = groupController.trace(`GetSign uid=${uid}`);
    console.log(res);

    return 'signature';
  };
  //有新加入的回调
  const OnNewJoinerIn = async (participant: any) => {
    console.log('有新加入的回调===', participant);
    if (participant) {
      // const res = await sdk.queryUserInfoById({ queryUserId: participant });
      // list.push(res);
      filterInRoom();
    }
  };
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    await groupController.LeaveRoom();
    // location.reload();
  };

  const handleOkAll = async () => {
    groupController.SendTextMsg('全员退出');
    await toCloseMeeting(userInfo.userId, webMeeting.id);
    await groupController.LeaveRoom();
    // location.reload();
  };

  const handleCancel = () => {
    setOpen(false);
  };
  // 初始化房间
  const initRoomInfo = () => {
    let config_param = {};
    let publish_device = 1;
    // 发布弱网告警
    groupController.SetPublishWeakBitrateLimit(200);
    // 编码方式
    let video_codec = 'AUTO';
    config_param.third_id = ''; //业务id
    config_param.auto_publish_subscribe = 3; //自动发布订阅
    config_param.video_profile_type = '2';
    let initPublish = [
      {
        publish_video_id: 'publish_video1',
        publish_streamId_id: 'publish_streamId1',
      },
    ];
    //分业务模式传入订阅参数

    config_param.enableVideo = true;
    config_param.enableAudio = true;
    // config_param.localVideoSwitch = videoState === 1;
    // config_param.localAudioSwitch = audioState === 1;
    config_param.localVideoSwitch = true;

    config_param.localAudioSwitch = audioState === 1;

    config_param.enableDatachannel = false;
    config_param.subscribeEnableVideo = true;
    config_param.subscribeEnableAudio = true;
    config_param.subscribeEnableDatachannel = false;
    config_param.publish_device = publish_device;
    config_param.room_mode = 2;
    let meeting_param = {};
    if (config_param.room_mode == 2) {
      meeting_param.video_dom_list = [];
      meeting_param.audio_dom_list = [];
      for (let i = 0; i <= roomNum; i++) {
        // meeting_param.video_dom_list.push('video' + (i));
        console.log('video' + i, 'v - i - d - e - o');
      }
      meeting_param.video_dom_list = [
        'video1',
        'video2',
        'video3',
        'video4',
        'video5',
      ];
      meeting_param.audio_dom_list = ['audio1', 'audio2', 'audio3'];
      console.log(meeting_param.audio_dom_list, 'list -  d -e - m - o');
      
      config_param.meeting_param = meeting_param;
    }
    let initSubscribe = [];

    switch (config_param.auto_publish_subscribe) {
      case 1:
        //订阅的时候的参数
        // config_param.initSubscribe = initSubscribe;
        break;
      case 2:
        //发布的时候的参数
        config_param.initPublish = initPublish;
        config_param.aspectRatioStrongDepend = false;
        config_param.aspectRatio = '0';
        break;
      case 3:
      case 5:
        config_param.initPublish = initPublish;
        // config_param.initSubscribe = initSubscribe;
        config_param.aspectRatioStrongDepend = true;
        config_param.aspectRatio = '1';
        break;
    }
    config_param.degradationType = 1;
    // 设置录制参数
    config_param.defaultRecord = false;
    //是否需要实时音量值,默认为false
    config_param.need_volume_analyser = true;
    config_param.need_volume_analyser = true;
    // 中转相关
    config_param.transport_ = 'all';
    config_param.defaultTurnServer = '';
    // E2EE
    let E2EE = {};
    E2EE.E2EE_enable = false;
    E2EE.E2EE_ikm = 'secret0123456789';
    config_param.E2EE = E2EE;
    // sknm
    config_param.sknm = '0,1';
    // 预热摄像头+麦克风
    if (
      (config_param.enableVideo || config_param.enableAudio) &&
      (config_param.auto_publish_subscribe == 2 ||
        config_param.auto_publish_subscribe == 3) &&
      config_param.publish_device == 1
    ) {
      groupController.PreOpenLocalMedia(config_param);
    }
    config_param.enableDataChannel = false;
    config_param.engine = 0;
    config_param.scalabilityMode = 'NONE';
    console.log(config_param, ' 我 -  是 -  初 - 始 - 化');

    groupController.InitRoomConfig(config_param);
    // 创建房间后就要去监听是否加入
  };
  const OnChangeMediaStreamSuccess = () => {
    console.log('切流成功回调');
  };
  const [publishList, setPublishList] = useState([]);
  //有新发布推送,对表格做更新操作
  const OnNewPublish = (feed: any) => {
    console.log('有新发布推送,对表格做更新操作===', feed);
    let params = publishList;
    params.push(feed);
    setPublishList(params);
  };
  //加入房间成功
  const OnJoinRoomSucc = () => {
    console.log('加入房间成功===');
    setRoomState(1);
    setStartTime(+new Date());
    filterInRoom();
    groupController.SendTextMsg('全局更新');
    // groupController.SendTextMsg(
    //   `加入房间成功/metSlice/${JSON.stringify(userInfo)}`,
    // );
  };
  //创建房间成功
  const OnCreateRoomSucc = (room_id: any, rtoken: any) => {
    setRoomState(1);
    console.log('创建房间成功回调===', room_id);
    setRoomId(room_id);
    setRoomToken(rtoken);
    setStartTime(+new Date());
    inviteRoom();
    // 改变房间状态
    changeRoomStatus();
    // 注册会议
    console.log(webMeeting, '111 ---3222');
    if (role == 'callee') {
      // 加入
    } else {
      // 查询单个会议
      filterInRoom();
      toCreateRoom(webMeeting.creator, room_id, rtoken, webMeeting.id);
      newCLi();
    }
    webMeeting.roomId = room_id;
    webMeeting.rtoken = rtoken;
    setWebMeeting(webMeeting);
  };
  // 改变房间状态
  const changeRoomStatus = async () => {
    let urlTitle = window.location.protocol;
    const res = await axios.post(
      `/api/meeting/updateStatus.json`,
      {
        userId: userInfo.userId,
        meetingId: webMeeting?.id,
        status: 'P',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    if (res?.data?.resultCode != 'success') {
      Message.error('改变房间状态失败');
    }
  };

  const OnReceiveTextMsg = async (res, msg) => {
    let newList = msg.split('/metSlice/');

    console.log(res, msg, '113fe');
    if (msg == '全员禁音') {
      let urlTitle = window.location.protocol;
      await axios.post(
        `/api/meeting/saveUserProperties.json`,
        {
          tntInstId: 'DEMOISVT', // 租户ID，必填
          appId: '9B16148C616CECA0', // 应用ID，必填
          end: 'PROD', // 环境，必填
          meetingId: webMeeting.id, // 会议ID，必填
          userId: userInfo.userId, // 成员用户ID，必填// 保存的用户属性，必填
          properties: {
            isOpenVicoe: false, // 是否开启麦克风
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      offSelfAudio();
    }
    if (msg == '全局更新') {
      filterInRoom();
    }
    if (msg == '全员退出') {
      handleOkAll();
    }
  };
  const filterInRoom = async () => {
    toQueryOneMeeting(userInfo.userId, webMeeting.id);
  };
  const [getCidSet, setGetCid] = useState([]);

  const newCLi = async () => {
    console.log(webMeeting, ' w -e = b ');
    let newWebMeeting = webMeeting;
    if (webMeeting?.users?.length) {
      newWebMeeting.users = webMeeting?.users.filter(
        (x) => x.userId != userInfo.userId,
      );
    } else {
    }
    let userList = [];
    for (let i = 0; i < newWebMeeting?.users?.length; i++) {
      // 重复查询会话id, 发送自定义消息
      const getCid = await sdk.queryUserInfoById({
        queryUserId: newWebMeeting?.users[i].userId,
      });
      userList.push(getCid);
      setGetCid(userList);

      let cid;
      if (getCid?.sessionVo?.cid) {
        cid = getCid?.sessionVo?.cid;
      } else {
        const res = await sdk.createConversation({
          type: 'single',
          subUserId: newWebMeeting?.users[i].userId,
        });
        if (res?.cid) {
          cid = res.cid;
        }
      }
      // await groupController.Invite(selectedUsers[i].userId, 0, roomTitle);
      try {
        let urlTitle = window.location.protocol;
        console.log(newWebMeeting.roomId, '我 - 是 - room - i -d');

        const enc = new TextEncoder();
        const msgbody: any = {
          msgType: 'custom',
          toCid: cid,
          cid: cid,
          msgContent: {
            data: enc.encode(
              `{"type":"inMeetingInvite","creator":"${newWebMeeting.creator}","subject":"${newWebMeeting.subject}","startTime":"${newWebMeeting.startTime}","location":"","meetingId":"${newWebMeeting.id}","joinToken":"${newWebMeeting.joinToken}","totaUsers":"${userInfo.userId}","users":[{"userId":"${newWebMeeting?.users[i].userId}","userName":"${newWebMeeting?.users[i].nickName}"}],"roomId":"${newWebMeeting.roomId}"}`,
            ),
            dataType: 'meetingCard',
            dataVersion: 1,
          },
        };

        let msg = await sdk.messageBuilder({ ...msgbody });
        console.log(msg, 're - -- ff');

        const res = await sdk.sendMessage({
          msgType: ContentType.Custom,
          ...msg,
        });
        console.log(res, '!!! fa - song');
      } catch (e) {
        console.log(e, 'baocuo ');
      }
    }
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
        `/api/meeting/createRoom.json`,
        // `/api/meeting/createRoom.json`,
        {
          userId: userId, //用户id，必填
          meetingId: meetingId, //会议唯一编号，必填
          roomId: roomId, //房间id，必填
          roomToken: roomToken, //房间token，必填
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data==注册会提==', data);
      });
  };
  //邀请加入
  const inviteRoom = async () => {
    console.log('邀请加入====');
    for (let i = 0; i < toList.length; i++) {
      await groupController.Invite(toList[i].userId, 0, roomTitle);
    }
  };
  const addCreateGroup = async (selectedUsers: any, selectedUserIds: any) => {
    setCreateGroupConversationModal(false);
    if (selectedUsers.length == 0) return;
    // setIsInMeetingAdd(true);

    // 这里应该考虑到重复拉人
    // debugger
    for (let x = 0; x < selectedUsers.length; x++) {
      await groupController.Invite(selectedUsers[x].userId, 0, roomTitle);
    }
    for (let n = 0; n < selectedUsers.length; n++) {
      console.log(toList, 'toList - d');

      // /meeting/joinMeeting.json
      //加入会议
      let urlTitle = window.location.protocol;
      axios
        .post(
          `/api/meeting/joinMeeting.json`,
          // `/api/meeting/joinMeeting.json`,
          {
            userId: selectedUsers[n].userId, //用户id，必填
            meetingId: webMeeting.id, //会议唯一编号，必填
            userName: selectedUsers[n].userName, //用户名称，必填
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .then((res) => {
          let data = res.data.data;
          console.log('dataff====', data);
        });
    }
    // let urlTitle = window.location.protocol;
    // debugger
    for (let i = 0; i < selectedUsers.length; i++) {
      // 重复查询会话id, 发送自定义消息
      const getCid = await sdk.queryUserInfoById({
        queryUserId: selectedUsers[i].userId,
      });
      let cid;
      if (getCid?.sessionVo?.cid) {
        cid = getCid?.sessionVo?.cid;
      } else {
        const res = await sdk.createConversation({
          type: 'single',
          subUserId: selectedUsers[i].userId,
        });
        if (res?.cid) {
          cid = res.cid;
        }
      }
      // await groupController.Invite(selectedUsers[i].userId, 0, roomTitle);
      try {
        let urlTitle = window.location.protocol;

        const enc = new TextEncoder();
        const msgbody: any = {
          msgType: 'custom',
          toCid: cid,
          cid: cid,
          msgContent: {
            data: enc.encode(
              `{"type":"inMeetingInvite","creator":"${webMeeting.creator}","subject":"${webMeeting.subject}","startTime":"${webMeeting.startTime}","location":"","meetingId":"${webMeeting.id}","joinToken":"${webMeeting.joinToken}","totaUsers":"${userInfo.userId}","users":[{"userId":"${selectedUsers[i].userId}","userName":"${selectedUsers[i].nickName}"}],"roomId":"${webMeeting.roomId}"}`,
            ),
            dataType: 'meetingCard',
            dataVersion: 1,
          },
        };

        let msg = await sdk.messageBuilder({ ...msgbody });
        const res = await sdk.sendMessage({
          msgType: ContentType.Custom,
          ...msg,
        });
        console.log(res, '!!! fa - song');
      } catch (e) {
        console.log(e, 'baocuo ');
      }
    }
    setInfoSelectUser([]);
  };
  //结束会议
  const handleClose = async () => {
    let urlTitle = window.location.protocol;
    const res = await axios.post(
      `/api/meeting/saveUserProperties.json`,
      {
        tntInstId: 'DEMOISVT', // 租户ID，必填
        appId: '9B16148C616CECA0', // 应用ID，必填
        end: 'PROD', // 环境，必填
        meetingId: webMeeting.id, // 会议ID，必填
        userId: userInfo.userId, // 成员用户ID，必填// 保存的用户属性，必填
        properties: {
          state: 2, // 是否开启麦克风
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    groupController.SendTextMsg('全局更新');
    try {
      getAnyUserInfo([]);
      let isLastOne = roomUserState.filter((x) => x?.properties?.state == '1');
      if (isLastOne?.length > 1) {
        if (webMeeting?.creator == userInfo.userId) {
          setOpen(true);
          // 仅退出, 或结束会议
          // await toCloseMeeting(userInfo.userId, webMeeting.id);
          // location.reload();
        } else {
          await groupController.LeaveRoom();
          // location.reload();
        }
      } else {
        // 结束会议
        groupController.SendTextMsg('全员退出');
        await toCloseMeeting(userInfo.userId, webMeeting.id);
        await groupController.LeaveRoom();
        // location.reload();
      }
    } catch (e) {
      console.log(e);
    }
  };

  //关闭会议
  const toCloseMeeting = async (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    const res = await axios.post(
      `/api/meeting/closeMeeting.json`,
      {
        // .post(
        //   `/api/meeting/closeMeeting.json`,
        //   {
        userId: userId, //用户id，必填
        meetingId: meetingId, //会议唯一编号，必填
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    if (res?.data?.data) {
      Message.success('结束成功');
    }
    // .then((res) => {
    //   let data = res.data.data;
    //   Message.success('结束成功');
    //   // setMeetDetail(false);
    //   console.log('data====', data);
    // });
  };
  //退出房间回调
  const OnLeaveRoom = (leaveType) => {
    try {
      console.log('退出房间回调===');
      setRoomState(0);
      groupController.warning(
        `~~~~~~~~~~~~~ leave room! leaveType = ${leaveType}`,
      );
      setRoomId('');
      setRoomToken('');
      setRoomState(0);
      setVisible(false);
      setRoomUserState([]);
    } catch (e) {
      console.log(e, '退出房间报错');
    }
  };
  // 开关摄像头,1:开;0:关
  const checkVideo = (value: number) => {
    console.log(value, '开关摄像头');
    // @ts-ignore
    let sid = document.getElementById('publish_video1').name;
    console.log(sid, '开关摄像头===sid');
    if (sid) {
      groupController.SetLocalVideoEnable(value, parseInt(sid));
      setVideoState(value);
    }
  };
  // 开麦和关麦 1:开;0:关
  const checkAudio = (value: number) => {
    // @ts-ignore
    let sid = document.getElementById('publish_video1').name;
    if (sid) {
      groupController.SetLocalAudioEnable(value, parseInt(sid));
      setAudioState(value);
    }
  };
  const isLoding = (val) => {
    console.log(val, 'v -a - l');

    // 如果是接受状态隐藏load
    if (val?.properties?.state == '1') {
      return false;
    }
    // 如果是拒绝状态隐藏load
    if (val?.properties?.state == '3') {
      return false;
    }
    // 如果是等待状态
    return true;
  };
  const isTurn = (val) => {
    if (val.state == '2') {
      return true;
    }
  };
  const clickImg = (item) => {
    // 切流
    console.log(publishList, item, '11331');
    let list = publishList.filter((x) => {
      return x?.uid == item.userId;
    });
    let data = list.splice(-1);
    console.log(data, '选中的流');
    // groupController.SwitchTrack([{ video_dom_id: 'publish_video1', pub_feed: ''}]);
  };

  const onChangeTab = (key: string) => {
    console.log(key);
  };

  // 全员静音
  const allUserNoneVoic = async () => {
    groupController.SendTextMsg('全员禁音');
    filterInRoom();
    // groupController.SendTextMsg('全局更新');
    // roomUserState.forEach((x) => {
    //   if (x.userId != webMeeting?.creator) {
    //     x.limitsMute = true;
    //   }
    // });
  };
  //切流
  const streamChange = (publishDevice: Number) => {
    // @ts-ignore
    let sid =
      document.getElementById('publish_video1').name ||
      document.getElementById('publish_streamId1').name;
    let publish_config = {};
    publish_config.publish_device = publishDevice;
    publish_config.enableVideo = true;
    publish_config.enableAudio = true;
    publish_config.enableDatachannel = false;
    publish_config.sid = sid;
    let audioSource = '';
    let videoSource = '';
    publish_config.audioSource = audioSource;
    publish_config.videoSource = videoSource;
    publish_config.aspectRatioStrongDepend = false;
    publish_config.aspectRatio = '0';
    publish_config.video_profile_type = '2';
    if (publishDevice == 2) {
      publish_config.enableDesktopAudio = false;
    } else if (publishDevice == 3) {
    } else if (publishDevice == 4) {
      publish_config.part_of_screen_id = 'a2';
    } else if (publishDevice == 5) {
    }
    let stream = groupController.ChangeMediaStream(publish_config);
    // @ts-ignore
    setStreamState(publishDevice);
  };
  // 人员数量
  const sizeFUn = () => {
    let useList = roomUserState.filter((x) => x?.properties?.state == '1');

    return useList.length;
  };
  // 右侧会话列表静音, // 分权限级 // 用户级别
  const rightListAudClick = (item) => {};
  // 按照权限判断是否展示开关麦克风
  const isShowAudIcon = (item) => {
    if (item?.properties?.isOpenVicoe == 'true') return false;
    return true;
  };
  // 会中人数
  const inMetList = (roomUserState) => {
    let list = roomUserState.filter((x) => x?.properties?.state == '1');
    console.log(roomUserState, 'l - i - s- - t');

    return list.map((item) => {
      return (
        <div className="rightList-item">
          {/* {isLoding(item) && <div className="loading"></div>} */}
          {/* {isTurn(item) && <div className="turn">已拒绝</div>}{' '} */}
          <AvatarImage
            src={item?.avatarUrl || ''}
            nickName={item?.nickName}
            userName={item?.userName}
            userId={item?.userId}
            style={{
              borderRadius: '50%',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            fit="cover"
            width={54}
            height={54}
            onClick={() => {
              clickImg(item);
            }}
          />
          {
            <div>
              {isShowAudIcon(item) ? (
                <AudioMutedOutlined
                  style={{ color: '#fff' }}
                  className="audIcon"
                  // onClick={() => {
                  //   rightListAudClick(item);
                  // }}
                />
              ) : (
                <AudioOutlined
                  // onClick={() => {
                  //   rightListAudClick(item);
                  // }}
                  style={{ color: '#fff' }}
                  className="audIcon"
                ></AudioOutlined>
              )}
            </div>
          }
        </div>
      );
    });
  };
  // 未入会人数
  const unInMetList = (roomUserState) => {
    let list = roomUserState.filter((x) => x?.properties?.state != '1');

    return list.map((item) => {
      return (
        <div className="rightList-item">
          {isLoding(item) && <div className="loading"></div>}{' '}
          {isTurn(item) && <div className="turn">已拒绝</div>}{' '}
          <AvatarImage
            src={item?.avatarUrl || ''}
            nickName={item?.nickName}
            userName={item?.userName}
            userId={item?.userId}
            style={{
              borderRadius: '50%',
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            fit="cover"
            width={54}
            height={54}
            onClick={() => {
              clickImg(item);
            }}
          />
        </div>
      );
    });
  };
  const SwitchTrack = () => {
    console.log('进入=====', roomNum * pageNum);
    console.log('进入===pageTotal==', pageTotal);
    if (roomNum * pageNum < pageTotal) {
      console.log('进入===比较==');
      for (let i = roomNum * pageNum + 1; i <= pageTotal; i++) {
        console.log('进入===i==', i);
      }
    }
    groupController.OnSwitchTrackFail = OnSwitchTrackFail;
    groupController.OnSwitchTrackSucc = OnSwitchTrackSucc;
    // groupController.SwitchTrack([{ video_dom_id: domId, pub_feed: $("#" + streamListId).val() }])
  };
  //大方会议切换失败
  const OnSwitchTrackFail = (sid: any, code: any, msg: any) => {
    console.log(
      `~~~~~~~~~~~~~ OnSwitchTrack Failed, sid=${sid},code=${code},msg=${msg}`,
    );
  };
  //大方会议切换成功
  const OnSwitchTrackSucc = (
    uid: any,
    feedId: any,
    pub_ssrc: any,
    dom_id: any,
  ) => {
    console.log(
      `~~~~~~~~~~~~~ OnSwitchTrack Success Response, uid=${uid},feedId=${feedId}, pub_ssrc=${pub_ssrc}, dom_id=${dom_id}`,
    );
  };
  // 关闭自己的静音
  const offSelfAudio = () => {
    checkAudio(0);
    openOrOffAudio(0);
  };
  // 开启自己的声音
  const openSelfAudio = () => {
    checkAudio(1);
    openOrOffAudio(1);
  };
  const openOrOffAudio = async (val) => {
    let flage;
    if (val == 1) {
      flage = true;
    } else if (val == 0) {
      flage = false;
    }
    let urlTitle = window.location.protocol;
    const res = await axios.post(
      `/api/meeting/saveUserProperties.json`,
      {
        tntInstId: 'DEMOISVT', // 租户ID，必填
        appId: '9B16148C616CECA0', // 应用ID，必填
        end: 'PROD', // 环境，必填
        meetingId: webMeeting.id, // 会议ID，必填
        userId: userInfo.userId, // 成员用户ID，必填// 保存的用户属性，必填
        properties: {
          isOpenVicoe: flage, // 是否开启麦克风
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (res?.data?.success) {
      filterInRoom();
      groupController.SendTextMsg('全局更新');
    }
  };

  // @ts-ignore
  return (
    <div className="meetingDetail" style={{ zIndex: visible ? 999 : -9998 }}>
      <div className="topBar">
        <div className="topBar_left">
          <ShrinkOutlined />
        </div>
        <div className="topBar_center">
          <div className="roomTitle">{roomTitle}</div>
          <div className="room_main">
            <div className="durationTime">{durationTime}</div>
            <div className="sizePeople">{sizeFUn()}人在会议中</div>
          </div>
        </div>
        <div className="topBar_right">
          <UserAddOutlined />
        </div>
      </div>
      <div className="meeting_main">
        <div className="meeting_main_left">
          <LeftOutlined />
        </div>
        <div className="meeting-body">
          <div className="meeting_list">
            <div className="cardWrap" style={{ backgroundColor: '#1e1c20' }}>
              {/* {(roomState !== 1 || videoState === 0) && (
              <AvatarImage
                className="avatarImage"
                src=""
                nickName="nickName"
                userName="userName"
                userId="userId"
                style={{
                  borderRadius: 8,
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                fit="cover"
                width={54}
                height={54}
              />
            )} */}
              <video
                autoPlay={true}
                muted={true}
                webkit-playsinline="true"
                playsInline={true}
                width="100%"
                height="100%"
                id="publish_video1"
              />
              <audio id="publish_audio1" autoPlay></audio>
            </div>
          </div>

          {range(roomNum).map(
            (item: string, index: React.Key | null | undefined) => (
              <div className="meeting_list">
                <div
                  className="cardWrap"
                  style={{ backgroundColor: '#1e1c20' }}
                  key={index}
                >
                  {/* <div className='videoImg'>
                  <AvatarImage
                    className={getCidSet[index]?.avatarImage}
                    src={getCidSet[index]?.avatarUrl}
                    nickName={getCidSet[index]?.nickName}
                    userName={getCidSet[index]?.userName}
                    userId={getCidSet[index]?.userId}
                    style={{
                      borderRadius: 8,
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    fit="cover"
                    width={54}
                    height={54}
                  />
                </div> */}
                  <video
                    autoPlay={true}
                    muted={true}
                    webkit-playsinline="true"
                    playsInline={true}
                    width="100%"
                    height="100%"
                    id={'video' + Number(item + 1)}
                  />
                  <audio id={'audio' + Number(item + 1)} autoPlay></audio>
                </div>
              </div>
            ),
          )}
          {/* {toList.map((item, index) => (
          <div className="cardWrap" style={{ backgroundColor: '#1e1c20' }} key={index}>
            {!startTime && <div className="loading"></div>}
            <AvatarImage
              className='avatarImage'
              src={item.avatarUrl}
              nickName={item.nickName}
              userName={item.userName}
              userId={item.userId}
              style={{
                borderRadius: 8,
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              fit="cover"
              width={54}
              height={54}
            />
            <video
              autoPlay={true}
              muted={true}
              webkit-playsinline='true'
              playsInline={true}
              width="100%"
              height="100%"
              id={"video"+item.userId}
            />
            <audio id={"audio$"+item.userId} autoPlay></audio>
          </div>
        ))} */}
        </div>
        <div
          className="meeting_main_right"
          onClick={() => {
            SwitchTrack();
          }}
        >
          <RightOutlined />
        </div>
      </div>
      {isShowSetBox && (
        <div className="rightList">
          <div className="listTop">
            <div>群成员管理</div>
            <div>
              <CloseOutlined
                onClick={() => {
                  setIsShowSetBox(!isShowSetBox);
                }}
              />
            </div>
          </div>
          <div className="rightSetList">
            <Tabs
              defaultActiveKey="1"
              onChange={onChangeTab}
              centered
              items={[
                {
                  label: `已入会`,
                  key: '1',
                  children: inMetList(roomUserState),
                },
                {
                  label: `未入会`,
                  key: '2',
                  children: unInMetList(roomUserState),
                },
              ]}
            />
          </div>

          {webMeeting?.creator == userInfo.userId ? (
            <div className="setBtn">
              <Button
                onClick={() => {
                  allUserNoneVoic();
                }}
              >
                全员静音
              </Button>
            </div>
          ) : (
            ''
          )}
        </div>
      )}
      <div className="meeting-footer">
        <div className="iconWrap">
          <div className="iconButton">
            {audioState === 1 && (
              <div>
                <AudioOutlined
                  className="icon"
                  onClick={() => offSelfAudio()}
                />
                <div className="icon_value">静音</div>
              </div>
            )}
            {audioState === 0 && (
              <div>
                <AudioMutedOutlined
                  className="icon"
                  onClick={() => openSelfAudio()}
                />
                <div className="icon_value">开启</div>
              </div>
            )}
          </div>
          <div className="iconButton">
            {videoState === 1 && (
              <div>
                <VideoCameraOutlined
                  className="icon"
                  onClick={() => checkVideo(0)}
                />
                <div className="icon_value">关闭摄像头</div>
              </div>
            )}
            {videoState === 0 && (
              <div>
                <VideoCameraOutlined
                  className="icon"
                  onClick={() => checkVideo(1)}
                />
                <div className="icon_value">打开摄像头</div>
              </div>
            )}
          </div>
        </div>
        <div className="iconWrap add_user">
          <div className="iconButton">
            <UserAddOutlined
              className="icon"
              onClick={() => setCreateGroupConversationModal(true)}
            />
            <div className="icon_value">邀请</div>
          </div>
          <div className="iconButton">
            <TeamOutlined
              className="icon"
              // onClick={() => setCreateGroupConversationModal(true)}
            />
            <div className="icon_value">成员({sizeFUn()})</div>
          </div>
          {streamState === 2 && (
            <div className="iconButton">
              <VideoCameraOutlined
                className="icon"
                onClick={() => streamChange(1)}
              />
              <div className="icon_value">打开摄像头</div>
            </div>
          )}
          {/* {streamState === 1 && (
            <div className="iconButton">
              <FolderViewOutlined
                className="icon"
                onClick={() => streamChange(2)}
              />
              <div className="icon_value">共享</div>
            </div>
          )} */}
          <div className="iconButton">
            <SettingOutlined
              className="icon"
              onClick={() => {
                setIsShowSetBox(!isShowSetBox);
              }}
            />
            <div className="icon_value">设置</div>
          </div>
        </div>
        <div className="close_meeting">
          <Button
            className="close_button"
            type="primary"
            danger
            onClick={handleClose}
          >
            {webMeeting?.creator == userInfo.userId ? '结束会议' : '退出'}
          </Button>
          <div className="close_circle" onClick={handleClose}>
            <img src={require('@/assets/close_phone.png')} alt="" />
          </div>
        </div>
      </div>
      {createGroupConversationModal && (
        <SelecteGroupMember
          type="addMeeting"
          addCreateGroup={addCreateGroup}
          onClose={() => setCreateGroupConversationModal(false)}
        />
      )}
      <Modal
        open={open}
        title="全员结束"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            取消
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleOk}
          >
            仅自己
          </Button>,
          <Button
            key="link"
            href="https://google.com"
            type="primary"
            loading={loading}
            onClick={handleOkAll}
          >
            全员结束
          </Button>,
        ]}
      ></Modal>
    </div>
  )
}
