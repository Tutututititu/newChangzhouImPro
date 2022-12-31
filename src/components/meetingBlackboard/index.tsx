// 思路 在创建房间时, 添完人后, 创建房间, 调用sdk, 发送消息, 再进入
//, 如果先选人再进入 拿到人, 创建房间 调用sdk, 发送消息
// 如果先进入 再拉人 调用sdk, 拉人, 创建房间
// 被邀请的进入 则是 查询单个会议数据塞到setWebMeeting里, 进入app初始化记得删掉setWebMeeting
import React, { useEffect, useState, useRef } from 'react';
import { Button, message as Message, DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import moment from 'moment';
import type { Dayjs } from 'dayjs';
import axios from 'axios';
import {
  RightOutlined,
  VideoCameraFilled,
  AudioFilled,
  CloseOutlined,
  FullscreenOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import SelecteGroupMember from '@/components/SelecteGroupMember';
import './style.less';
import { useModel } from 'umi';
const MeetingBlack = (props: any) => {
  const { sdk } = useModel('global');
  const {
    audioState,
    setAudioState,
    videoState,
    setVideoState,
    setRole,
    roomTitle,
    setRoomTitle,
    setVisible: setMeetingModalVisible,
    setProps: setMeetingModalProps,
    webMeeting,
    setWebMeeting,
    setInMeetingType,
    inMeetingType,
    setInfoSelectUser,
    infoSelectUser,
    setMeetJoinTip,
    setRoomToken,
    setRoomId,
  } = useModel('meetingModal');
  let {
    userInfo,
    setCreateMeeting,
    handleMeetingDetail,
    meetType,
    jointype = 'noJoin',
  } = props;

  const [createGroupConversationModal, setCreateGroupConversationModal] =
    useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetingList, setMeetingList] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState(
    `${userInfo.userName}发起的视频会议`,
  );
  const [meetingDetail, setMeetingDetail] = useState({}); //房间信息
  useEffect(() => {
    if (jointype == 'joinType') {
      setMeetingTitle('');
    }
  }, [jointype]);
  const changeTitle = (e: any) => {
    setMeetingTitle(e.target.value);
  };

  const addCreateGroup = async (selectedUsers: any, selectedUserIds: any) => {
    console.log(selectedUsers, '1111 =22');
    if (meetType == 0) {
      setCreateMeeting(false);
      setMeetingModalVisible(true);
      setRole('caller');
      setRoomTitle(meetingTitle);
      setMeetingModalProps({
        from: {
          nickName: userInfo.userName,
        },
        rtcType: 'VIDEO',
        toList: selectedUsers,
        selectedUserIds: selectedUserIds,
      });
      if (selectedUsers?.length) {
        let params = {
          createUserName: userInfo.nickName,
          creator: userInfo.userId,
          subject: meetingTitle,
          users: selectedUsers,
          notifyBySingleSession: true,
        };
        // 拉人进入
        toCreateMeeting(params, selectedUsers);
      } else {
        let params = {
          createUserName: userInfo.nickName,
          creator: userInfo.userId,
          subject: meetingTitle,
          users: [],
          notifyBySingleSession: true,
        };
        // 先进入
        toCreateMeetingNew(params);
      }
    } else if (meetType == 1) {
      setCreateGroupConversationModal(false);
      setMeetingList(selectedUsers);
    }
  };
  const toCreateMeetingNew = (val) => {
    let urlTitle = window.location.protocol;

    axios
      .post(
        `/api/meeting/create.json`,
        {
          // `/api/meeting/create.json`,
          // {
          appId: '9B16148C616CECA0', //appId，必填
          createUserName: val.createUserName, //创建会议用户名称，必填
          creator: val.creator, //创建会议用户id，必填
          env: 'PROD', //环境id，必填
          location: '', //会议地点，可选
          // notifyBySingleSession: val.notifyBySingleSession, //是否通过单聊发送通知，预约会议时生效，可选
          subject: val.subject, //会议主题，必填
          tntInstId: 'DEMOISVT', //租户id，必填
          type: 0, //会议类型 0-立即开会 1-预约会议，必填
          users: [], //参与会议用户列表
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then(async (res) => {
        let val = res.data.data;
        const data = await axios.post(
          `/api/meeting/saveUserProperties.json`,
          {
            tntInstId: 'DEMOISVT', // 租户ID，必填
            appId: '9B16148C616CECA0', // 应用ID，必填
            end: 'PROD', // 环境，必填
            meetingId: val?.id, // 会议ID，必填
            userId: userInfo.userId, // 成员用户ID，必填// 保存的用户属性，必填
            properties: {
              isOpenCamera: videoState == 1, // 是否开启摄像头
              isOpenVicoe: audioState == 1, // 是否开启麦克风
              feedId_id: '', // 用户的视频流
              state: 1, // 1. 会议中 2. 离开 3. 未反应  // 先系统级是否开启麦克风 用户级 权限级
              limitsMute: false, // 权限静音, 主持人联席主持人 true, false
              soloMute: [], //  单状态静音, 只对自己又效果 true ,false
              isCompere: true, // 是否主持人
              isCroupier: [], // 是否联席主持人
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (data?.data?.success) {
          setWebMeeting(val);
          setRole('caller');
          setRoomTitle(meetingTitle);
          setMeetingModalProps({
            from: {
              nickName: userInfo.userName,
            },
            rtcType: 'VIDEO',
            toList: [],
            selectedUserIds: [],
          });
          setInMeetingType('create');
          setInfoSelectUser([]);
        }
      });
  };
  const toCreateMeeting = (val, selectedUsers, selectedUserIds) => {
    console.log(selectedUsers, selectedUserIds, '1 ------3');

    let urlTitle = window.location.protocol;
    axios
      .post(
        `/api/meeting/create.json`,
        {
          // `/api/meeting/create.json`,
          // {
          appId: '9B16148C616CECA0', //appId，必填
          createUserName: val.createUserName, //创建会议用户名称，必填
          creator: val.creator, //创建会议用户id，必填
          env: 'PROD', //环境id，必填
          location: '', //会议地点，可选
          // notifyBySingleSession: val.notifyBySingleSession, //是否通过单聊发送通知，预约会议时生效，可选
          subject: val.subject, //会议主题，必填
          tntInstId: 'DEMOISVT', //租户id，必填
          type: 0, //会议类型 0-立即开会 1-预约会议，必填
          users: val.users, //参与会议用户列表
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      .then(async (res) => {
        let val = res.data.data;
        console.log(val, '创建会议');
        console.log(videoState, audioState, ' s - t - a - t');

        const data = await axios.post(
          `/api/meeting/saveUserProperties.json`,
          {
            tntInstId: 'DEMOISVT', // 租户ID，必填
            appId: '9B16148C616CECA0', // 应用ID，必填
            end: 'PROD', // 环境，必填
            meetingId: val?.id, // 会议ID，必填
            userId: userInfo.userId, // 成员用户ID，必填// 保存的用户属性，必填
            properties: {
              isOpenCamera: videoState == 1, // 是否开启摄像头
              isOpenVicoe: audioState == 1, // 是否开启麦克风
              feedId_id: '', // 用户的视频流
              state: 1, // 1. 会议中 2. 离开 3. 未反应  // 先系统级是否开启麦克风 用户级 权限级
              limitsMute: false, // 权限静音, 主持人联席主持人 true, false
              soloMute: [], //  单状态静音, 只对自己又效果 true ,false
              isCompere: true, // 是否主持人
              isCroupier: [], // 是否联席主持人
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        if (data?.data?.success) {
          setWebMeeting(val);
          setRole('caller');
          setRoomTitle(meetingTitle);
          setMeetingModalProps({
            from: {
              nickName: userInfo.userName,
            },
            rtcType: 'VIDEO',
            toList: selectedUsers,
            selectedUserIds: selectedUserIds,
          });
          setInMeetingType('create'), setInfoSelectUser(selectedUsers);
        }
      });
  };

  useEffect(() => {
    if (inMeetingType == 'create' && setInfoSelectUser?.length > 0) {
      setMeetingModalVisible(true);
      setCreateMeeting(false);
    }
  }, [inMeetingType, setInfoSelectUser]);

  //关闭会议
  const toCloseMeeting = (userId: any, meetingId: any) => {
    console.log(userInfo.userId, webMeeting);
    let urlTitle = window.location.protocol;
    axios
      .post(
        `/api/meeting/closeMeeting.json`,
        // `/api/meeting/closeMeeting.json`,
        {
          // `/api/meeting/closeMeeting.json`,{
          userId: userInfo.userId, //用户id，必填
          meetingId: webMeeting.id, //会议唯一编号，必填
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        let data = res.data.data;
        console.log('datadd ====', data);
      });
  };
  // 开麦和关麦 1:开;0:关
  const checkAudio = (value: number) => {
    setAudioState(value);
  };
  // 开关摄像头,1:开;0:关
  const checkVideo = (value: number) => {
    setVideoState(value);
  };
  const orderPrimary = async () => {
    if (startTime && endTime && meetingTitle) {
      handleMeetingDetail(meetingTitle, meetingList, startTime, endTime);
    }
  };
  const onChange = (dayjs: any) => {
    if (dayjs && dayjs.length == 2) {
      const date1 = new Date(dayjs[0].$d);
      // @ts-ignore
      const startTime = Date.parse(date1);
      // @ts-ignore
      setStartTime(startTime);
      const date2 = new Date(dayjs[1].$d);
      // @ts-ignore
      const endTime = Date.parse(date2);
      // @ts-ignore
      setEndTime(endTime);
    } else {
      setStartTime('');
      setEndTime('');
    }
  };
  const disabledDate = (current: any) => {
    return current && current < moment().subtract(1, 'days').endOf('day');
  };
  const joinMet = () => {
    //查询单个会议
    // const toQueryOneMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .get(
        `/api/meeting/queryOneMeeting.json?userId=${userInfo.userId}&meetingId=${meetingTitle}`,
        {
          // `/api/meeting/queryOneMeeting.json?userId=${userInfo.userId}&meetingId=${meetingTitle}`,
          // {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then(async (res) => {
        console.log(res, 'e -s -s');

        if (res && res.data && res.data.data) {
          let data = res.data.data;
          console.log('data====', data);
          if (data?.roomId && data?.roomToken) {
            await axios.post(
              `/api/meeting/joinMeeting.json`,
              // `/api/meeting/joinMeeting.json`,
              {
                userId: userInfo.userId, //用户id，必填
                meetingId: meetingTitle, //会议唯一编号，必填
                userName: userInfo.userName, //用户名称，必填
              },
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              },
            );
          }
          setMeetingDetail(data);
          if (data.status == 'I') {
            return Message.warning('视频会议待发起');
          } else if (data.status == 'C') {
            return Message.error('视频会议已取消');
          } else if (data.status == 'P') {
            const res = await axios.post(
              `/api/meeting/saveUserProperties.json`,
              {
                tntInstId: 'DEMOISVT', // 租户ID，必填
                appId: '9B16148C616CECA0', // 应用ID，必填
                end: 'PROD', // 环境，必填
                meetingId: data?.id, // 会议ID，必填
                userId: userInfo.userId, // 成员用户ID，必填// 保存的用户属性，必填
                properties: {
                  isOpenCamera: true, // 是否开启摄像头
                  isOpenVicoe: true, // 是否开启麦克风
                  feedId_id: '', // 用户的视频流
                  state: 1, // 1. 会议中 2. 离开 3. 未反应  // 先系统级是否开启麦克风 用户级 权限级
                  limitsMute: false, // 权限静音, 主持人联席主持人 true, false
                  soloMute: [], //  单状态静音, 只对自己又效果 true ,false
                  isCompere: false, // 是否主持人
                  isCroupier: [], // 是否联席主持人
                },
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              },
            );
            if (res?.status == 200) {
              let room_id = data?.roomId;
              let rtoken = data?.roomToken;
              let urlTitle = window.location.protocol;
              setRoomId(room_id);
              setRoomToken(rtoken);
              setWebMeeting(data);
              let inviter = userInfo.userId;
              let extra = { url: data?.subject };
              let inviteId = userInfo.userId;
              let inviteInfo = { audioEnable: 1, videoEnable: 1 };
              setMeetJoinTip(false);
              setRole('callee');
              setInMeetingType('add');
              setMeetingModalVisible(true);
              // expJumpMeeting(room_id, rtoken, inviter, extra, inviteId, inviteInfo);
              // setMeetDetail(false);
              setCreateMeeting(false);
              return;
            }
          } else if (data.status == 'F') {
            return Message.error('视频会议已结束');
          }
        } else {
          console.log('res====', res);
          Message.info('请输入正确的入会号');
        }
      });
    // };
  };
  return jointype == 'joinType' ? (
    <div className="meetingBlack">
      <div className="box">
        <div className="top">
          <div className="titleName">会议号输入</div>
          <div>
            <input
              type="text"
              className="input"
              value={meetingTitle}
              onChange={changeTitle}
            />
          </div>
          <CloseOutlined
            className="close"
            onClick={() => setCreateMeeting(false)}
          />
        </div>
        <Button type="primary" onClick={() => joinMet()}>
          加入会议
        </Button>
        {/* {meetType == 0 && (
            <div className="iconFun">
              {videoState === 1 && (
                <VideoCameraFilled
                  className="icon"
                  onClick={() => checkVideo(0)}
                />
              )}
              {videoState === 0 && (
                <VideoCameraOutlined
                  className="icon"
                  onClick={() => checkVideo(1)}
                />
              )}
              {audioState === 1 && (
                <AudioOutlined className="icon" onClick={() => checkAudio(0)} />
              )}
              {audioState === 0 && (
                <AudioMutedOutlined
                  className="icon"
                  onClick={() => checkAudio(1)}
                />
              )}
            </div>
          )}
          {meetType == 1 && (
            <div className="meeting_order">
              <div className="meeting_order_key">预约时间:</div>
              <div className="meeting_time">
                <RangePicker
                  showTime
                  disabledDate={disabledDate}
                  onChange={onChange}
                />
              </div>
            </div>
          )} */}
        {/* <Button
            type="primary"
            className="btn"
            onClick={() => setCreateGroupConversationModal(true)}
          >
            添加参会人
          </Button>
          {meetType == 0 && (
            <div className="to_meeting" onClick={() => addCreateGroup([], [])}>
              先进入会议
              <RightOutlined />
            </div>
          )}
          {meetType == 1 && (
            <Button type="primary" className="btn" onClick={() => orderPrimary()}>
              确认
            </Button>
          )} */}
      </div>
      {/* {createGroupConversationModal && (
          <SelecteGroupMember
            type="addMeeting"
            addCreateGroup={addCreateGroup}
            onClose={() => setCreateGroupConversationModal(false)}
          />
        )} */}
    </div>
  ) : (
    <div className="meetingBlack">
      <div className="box">
        <div className="top">
          <div className="titleName">会议主题</div>
          <div>
            <input
              type="text"
              className="input"
              value={meetingTitle}
              onChange={changeTitle}
            />
          </div>
          <CloseOutlined
            className="close"
            onClick={() => setCreateMeeting(false)}
          />
        </div>
        {meetType == 0 && (
          <div className="iconFun">
            {videoState === 1 && (
              <VideoCameraFilled
                className="icon"
                onClick={() => checkVideo(0)}
              />
            )}
            {videoState === 0 && (
              <VideoCameraOutlined
                className="icon"
                onClick={() => checkVideo(1)}
              />
            )}
            {audioState === 1 && (
              <AudioOutlined className="icon" onClick={() => checkAudio(0)} />
            )}
            {audioState === 0 && (
              <AudioMutedOutlined
                className="icon"
                onClick={() => checkAudio(1)}
              />
            )}
          </div>
        )}
        {meetType == 1 && (
          <div className="meeting_order">
            <div className="meeting_order_key">预约时间:</div>
            <div className="meeting_time">
              <RangePicker
                showTime
                disabledDate={disabledDate}
                onChange={onChange}
              />
            </div>
          </div>
        )}
        <Button
          type="primary"
          className="btn"
          onClick={() => setCreateGroupConversationModal(true)}
        >
          添加参会人
        </Button>
        {meetType == 0 && (
          <div className="to_meeting" onClick={() => addCreateGroup([], [])}>
            先进入会议
            <RightOutlined />
          </div>
        )}
        {meetType == 1 && (
          <Button type="primary" className="btn" onClick={() => orderPrimary()}>
            确认
          </Button>
        )}
      </div>
      {createGroupConversationModal && (
        <SelecteGroupMember
          type="addMeeting"
          addCreateGroup={addCreateGroup}
          onClose={() => setCreateGroupConversationModal(false)}
        />
      )}
    </div>
  );
};
export default MeetingBlack;
