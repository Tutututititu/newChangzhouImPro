import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { range } from 'lodash';
import {
  AudioMutedOutlined,
  AudioOutlined,
  ShrinkOutlined,
  UserAddOutlined,
  VideoCameraOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import AvatarImage from '@/components/AvatarImage';
import './phoneStyle.less';
import { getTimeDiff } from '@/utils';
import { SdkType } from '@/typings/global';
import PhoneGroupMember from './PhoneGroupMember';
import axios from 'axios';

export default function (props: any) {
  // @ts-ignore
  const [groupController, setGroupController] = useState<SdkType>(null);
  const [visible, setVisible] = useState(false); //是否显示
  const [addPhoneGroupMember, setAddPhoneGroupMember] = useState(false); //新增人员
  const [connState, setConnState] = useState(0); //连接状态
  const [role, setRole] = useState(''); //房间类型
  const [meetingId, setMeetingId] = useState(''); //会议唯一编号，必填
  const [roomState, setRoomState] = useState(0); //房间状态
  const [localUserId, setLocalUserId] = useState(''); //用户id
  const [localUserName, setLocalUserName] = useState(''); //用户名称
  const [sizePeople, setSizePeople] = useState(1); //人数
  const [audioState, setAudioState] = useState(1); //开麦和关麦 1:开;0:关
  const [videoState, setVideoState] = useState(1); //开关摄像头,1:开;0:关
  const [streamState, setStreamState] = useState(1); //共享文件
  const [roomNum, setRoomNum] = useState(3); //房间数量
  const [meetingDetail, setMeetingDetail] = useState({}); //房间信息
  let timerId: any = null;
  const [durationTime, setDurationTime] = useState('--:--');
  const [startTime, setStartTime] = useState(0); //开始时间
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
    const meetingContent = props?.location?.query;
    console.log('meetingContent=======', meetingContent);
    if (meetingContent.audioState) {
      setAudioState(Number(meetingContent.audioState));
    }
    if (meetingContent.videoState) {
      setVideoState(Number(meetingContent.videoState));
    }
    //房间类型
    if (meetingContent.role) {
      setRole(meetingContent.role);
    }
    if (meetingContent.localUserName) {
      setLocalUserName(meetingContent.localUserName);
    }
    //会议唯一编号
    if (meetingContent.meetingId && meetingContent.localUserId) {
      setMeetingId(Number(meetingContent.meetingId));
      setLocalUserId(meetingContent.localUserId);
      // toCreateMeeting('李白',meetingContent.localUserId,'前端开发会议',0);
      toQueryOneMeeting(
        meetingContent.localUserId,
        Number(meetingContent.meetingId),
      );
    }
    setVisible(true);
  }, []);
  useEffect(() => {
    console.log('groupController===', groupController);
    if (!meetingDetail) return;
    creatController();
  }, [meetingDetail]);
  useEffect(() => {
    if (!groupController) return;
    groupController.OnConnectOK = OnConnectOK; //建立连接成功
    groupController.OnConnectClose = OnConnectClose; //断开连接回调
    groupController.OnConnectFailed = OnConnectFailed; //建立连接失败
    groupController.OnInitRoomConfigOK = OnInitRoomConfigOK; //初始化房间成功回调
    if (connState === 1) {
      initRoomInfo();
    }
  }, [groupController, connState]);
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
        `/api/meeting/create.json`,
        {
          // `/api/meeting/create.json`,
          // {
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
        console.log('data====', data);
      });
  };
  //查询单个会议
  const toQueryOneMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .get(
        `/api/meeting/queryOneMeeting.json?userId=${userId}&meetingId=${meetingId}`,
        // {
        // `/api/meeting/queryOneMeeting.json?userId=${userId}&meetingId=${meetingId}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        if (res && res.data && res.data.resultCode == 'success') {
          let data = res.data.data;
          setMeetingDetail(data);
        }
      });
  };
  //加入会议
  const toJoinMeeting = (userId: any, userName: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .post(
        `/api/meeting/joinMeeting.json`,
        // `/api/meeting/joinMeeting.json`,
        {
          // `/api/meeting/joinMeeting.json`,{
          userId: userId, //用户id，必填
          meetingId: meetingId, //会议唯一编号，必填
          userName: userName, //用户名称，必填
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
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
        `/api/meeting/createRoom.json`,
        // `/api/meeting/createRoom.json`,
        {
          // `/api/meeting/createRoom.json`,{
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
        console.log('data====', data);
      });
  };
  //离开会议
  const toLeaveMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .post(
        `/api/meeting/leaveMeeting.json`,
        // `/api/meeting/leaveMeeting.json`,
        {
          // `/api/meeting/leaveMeeting.json`,{
          userId: userId, //用户id，必填
          meetingId: meetingId, //会议唯一编号，必填
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //关闭会议
  const toCloseMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .post(
        `/api/meeting/closeMeeting.json`,
        // `/api/meeting/closeMeeting.json`,
        {
          // `/api/meeting/closeMeeting.json`,{
          userId: userId, //用户id，必填
          meetingId: meetingId, //会议唯一编号，必填
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
      });
  };
  //有新发布推送,对表格做更新操作
  const OnNewPublish = (feed: any) => {
    console.log('有新发布推送,对表格做更新操作===', feed);
  };
  //房间与会者列表信息
  const OnRoomAttendanceList = (participant: any) => {
    console.log('房间与会者列表信息===', participant);
    setSizePeople(() => participant.length + 1);
  };
  //创建房间成功
  const OnCreateRoomSucc = (room_id: any, rtoken: any) => {
    setRoomState(1);
    console.log('创建房间成功回调===', room_id);
    console.log('创建房间成功回调===rtoken', rtoken);
    setStartTime(+new Date());
    toCreateRoom(localUserId, room_id, rtoken, meetingId);
  };
  //加入房间成功
  const OnJoinRoomSucc = () => {
    console.log('加入房间成功===');
    setRoomState(1);
    setStartTime(+new Date());
    toJoinMeeting(localUserId, localUserName, meetingId);
  };
  const OnConnectOK = () => {
    console.log('建立连接成功===');
    setConnState(1);
  };
  //退出房间回调
  const OnLeaveRoom = (leaveType: any) => {
    console.log('退出房间回调===');
    setRoomState(0);
    groupController.warning(
      `~~~~~~~~~~~~~ leave room! leaveType = ${leaveType}`,
    );
    setRoomState(0);
    setVisible(false);
  };
  const OnConnectFailed = () => {
    console.log('建立连接失败, 请尝试https修复===');
    setConnState(0);
  };
  const OnConnectClose = () => {
    console.log('断开连接回调===');
    setConnState(0);
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
    let initSubscribe = [];
    for (let i = 1; i <= roomNum; i++) {
      initSubscribe.push({
        subscribe_video_id: 'video' + i,
        subscribe_audio_id: 'audio' + i,
        subscribe_streamId_id: 'subscribe_streamId' + i,
        feedId_id: 'feedId' + i,
      });
    }
    config_param.enableVideo = videoState === 1;
    config_param.enableAudio = audioState === 1;
    config_param.enableDatachannel = false;
    config_param.subscribeEnableVideo = true;
    config_param.subscribeEnableAudio = true;
    config_param.subscribeEnableDatachannel = false;
    config_param.publish_device = publish_device;
    switch (config_param.auto_publish_subscribe) {
      case 1:
        //订阅的时候的参数
        config_param.initSubscribe = initSubscribe;
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
        config_param.initSubscribe = initSubscribe;
        config_param.aspectRatioStrongDepend = false;
        config_param.aspectRatio = '0';
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
    console.log('config_param===', config_param);
    console.log('groupController=666==', groupController);
    groupController.InitRoomConfig(config_param);
    groupController.OnCreateRoomSucc = OnCreateRoomSucc; //创建房间成功
    groupController.OnJoinRoomSucc = OnJoinRoomSucc; //加入房间成功
    groupController.OnLeaveRoom = OnLeaveRoom; //退出房间回调
    groupController.OnNewJoinerIn = OnNewJoinerIn; //有新加入的回调
    groupController.OnSubscribeSucc = OnSubscribeSucc; //订阅成功回调
    groupController.OnNewPublish = OnNewPublish; //有新发布推送,对表格做更新操作
    groupController.OnParticipantLeaveRoom = OnParticipantLeaveRoom; //推送“退出房间者”给与会者
    groupController.OnRoomAttendanceList = OnRoomAttendanceList; //房间与会者列表信息
  };
  const creatController = () => {
    // @ts-ignore
    console.log('=====进来了2===');
    const mcuController = new window.McuController();
    console.log('localUserId======', localUserId);
    if (connState != 1) {
      let configParam = {
        log: true,
        uid: localUserId,
        biz_name: 'demo',
        sub_biz: 'default',
        workspaceId: 'default',
        room_server_url: 'wss://artvcroomdev.dl.alipaydev.com/ws',
        sign: 'signature',
        network_check_timeout: 120 * 1000, //允许最大断网时间 (超过未重连, 直接关闭)
        logCacheMaxLines: 200,
      };
      mcuController.Connect(configParam);
      console.log('mcuController===========', mcuController);
      setGroupController(mcuController);
    }
  };
  //初始化成功回调
  const OnInitRoomConfigOK = () => {
    console.log('初始化成功回调===创建', role);
    console.log('初始化成功回调===groupController', groupController);
    if (role === 'caller') {
      console.log('初始化成功回调===创建');
      groupController.CreateRoom('signature');
    } else if (role == 'callee') {
      console.log('初始化成功回调===加入');
      groupController.JoinRoom(
        meetingDetail.roomId,
        meetingDetail.roomToken,
        getSign(localUserId),
      );
    }
  };
  //推送“退出房间者”给与会者
  const OnParticipantLeaveRoom = (uid: any, exitType: any) => {
    console.log('推送“退出房间者”给与会者======uid', uid);
    setSizePeople((sizePeople) => sizePeople - 1);
  };
  //订阅成功回调
  const OnSubscribeSucc = (feedId: any, sid: any) => {
    console.log('订阅成功回调===feedId', feedId);
    console.log('订阅成功回调===sid', sid);
  };
  const getSign = (uid: any) => {
    groupController.trace(`GetSign uid=${uid}`);
    return 'signature';
  };
  //有新加入的回调
  const OnNewJoinerIn = (participant: any) => {
    console.log('有新加入的回调===', participant);
    setSizePeople((sizePeople) => sizePeople + 1);
  };
  //结束会议
  const handleClose = async () => {
    window?.webkit?.messageHandlers?.closeMeeting?.postMessage({});
    window?.webkit?.closeMeeting();
    if (localUserId === meetingDetail.creator) {
      //发起人
    }
    groupController.LeaveRoom();
    toLeaveMeeting(localUserId, meetingId);
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
  // 开关摄像头,1:开;0:关
  const checkVideo = (value: number) => {
    // @ts-ignore
    let sid = document.getElementById('publish_video1').name;
    if (sid) {
      groupController.SetLocalVideoEnable(value, parseInt(sid));
      setVideoState(value);
    }
  };
  //邀请好友
  const addCreateGroup = async (selectedUsers: any, selectedUserIds: any) => {
    setAddPhoneGroupMember(false);
    // for (let i = 0; i < selectedUsers.length; i++) {
    //   await groupController.Invite(selectedUsers[i].userId, 0, roomTitle);
    // }
  };
  //切流
  const streamChange = (publishDevice: Number) => {
    // @ts-ignore
    let sid =
      document.getElementById('publish_video1').name ||
      document.getElementById('publish_streamId1').name;
    let publish_config = {};
    publish_config.publish_device = publishDevice;
    publish_config.enableVideo = videoState === 1;
    publish_config.enableAudio = audioState === 1;
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
  const closeGroup = () => {
    setAddPhoneGroupMember(false);
  };
  return (
    <div>
      {visible && (
        <div className="meeting_body">
          <div className="topBar">
            <div className="topBar_left">{/*<ShrinkOutlined/>*/}</div>
            <div className="topBar_center">
              <div className="roomTitle">
                {meetingDetail.subject ? meetingDetail.subject : ''}
              </div>
              <div className="room_main">
                <div className="durationTime">{durationTime}</div>
                <div className="sizePeople">{sizePeople}人在会议中</div>
              </div>
            </div>
            <div className="topBar_right">
              <UserAddOutlined onClick={() => setAddPhoneGroupMember(true)} />
            </div>
          </div>
          <div className="meeting-body">
            <div className="meeting_list">
              <div className="cardWrap" style={{ backgroundColor: '#1e1c20' }}>
                {(roomState !== 1 || videoState === 0) && (
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
                )}
                <video
                  autoPlay={true}
                  muted={true}
                  webkitPlaysinline="true"
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
                <div className="meeting_list" key={index}>
                  <div
                    className="cardWrap"
                    style={{ backgroundColor: '#1e1c20' }}
                  >
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
          </div>
          <div className="meeting-footer">
            <div className="iconWrap">
              <div className="iconButton">
                {audioState === 1 && (
                  <div>
                    <AudioOutlined
                      className="icon"
                      onClick={() => checkAudio(0)}
                    />
                    <div className="icon_value">静音</div>
                  </div>
                )}
                {audioState === 0 && (
                  <div>
                    <AudioMutedOutlined
                      className="icon"
                      onClick={() => checkAudio(1)}
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
              <div className="iconButton">
                {streamState === 1 && (
                  <div>
                    <FolderOutlined
                      className="icon"
                      onClick={() => streamChange(2)}
                    />
                    <div className="icon_value">打开摄像头</div>
                  </div>
                )}
                {/* {streamState === 2 && (
                  <div>
                    <VideoCameraOutlined
                      className="icon"
                      onClick={() => streamChange(1)}
                    />
                    <div className="icon_value">共享</div>
                  </div>
                )} */}
              </div>
            </div>
            <div className="iconWrap add_user">
              <div className="iconButton">
                <UserAddOutlined
                  className="icon"
                  // onClick={() => setCreateGroupConversationModal(true)}
                />
                <div className="icon_value">添加成员</div>
              </div>
            </div>
            <div className="close_meeting">
              <div className="close_circle" onClick={handleClose}>
                <img src={require('@/assets/close_phone.png')} alt="" />
              </div>
            </div>
          </div>
        </div>
      )}
      {addPhoneGroupMember && (
        <PhoneGroupMember
          type="addMeeting"
          closeGroup={closeGroup}
          addCreateGroup={addCreateGroup}
          onClose={closeGroup}
        />
      )}
    </div>
  );
}
