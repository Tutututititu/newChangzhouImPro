//预约会议列表详情
import React, { useState, useEffect, useRef } from 'react';
import copy from 'copy-text-to-clipboard';
import AvatarImage from '@/components/AvatarImage';
import {
  MinusCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  UserAddOutlined,
  ShareAltOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  UserOutlined,
  VideoCameraOutlined,
  BellOutlined,
  RightOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';

import {
  ContentType,
  CustomDataType,
  ConversationType,
  MsgTypeMap,
  RtcAction,
} from '../../constants';
import './style.less';
import { Button, Tabs, Avatar, Modal, message as Message } from 'antd';
import axios from 'axios';
import { useModel } from 'umi';
import { filterTime } from '@/utils';
import { dictArr } from 'pinyin-pro/types/lib/data';
import SelecteGroupMember from '@/components/SelecteGroupMember';

export default function (props: any) {
  const {
    meetJoinTip,
    setMeetJoinTip,
    roomId,
    roomToken,
    setRole,
    setVisible,
    setRoomId,
    setRoomToken,
    setInMeetingType,
    setWebMeeting,
  } = useModel('meetingModal');
  const { sdk } = useModel('global');
  const { userInfo, setMeetDetail, meetDetail, meetingId, otherProps } = props;
  const [meetingDetail, setMeetingDetail] = useState({}); //房间信息
  const [userData, setUserData] = useState(''); //分享还是新增
  const [meetingList, setMeetingList] = useState([]); //参会状态列表
  const [createGroupConversationModal, setCreateGroupConversationModal] =
    useState(false);
  useEffect(() => {
    if (!meetDetail) return;
    console.log('进入当前页');
    toQueryOneMeeting(userInfo.userId, meetingId);
  }, [meetDetail]);
  const [startSet, setStartTime] = useState('');
  const [endSet, setEndTime] = useState('');

  //查询单个会议
  const toQueryOneMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      .get(
        // `/api/meeting/queryOneMeeting.json?userId=${userId}&meetingId=${meetingId}`,{
        `/api/meeting/queryOneMeeting.json?userId=${userId}&meetingId=${meetingId}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        if (res && res.data && res.data.data) {
          let data = res.data.data;
          const time = filterTime(data.startTime);
          setStartTime(time);
          const endTime = data.endTime ? filterTime(data.endTime) : '';
          setEndTime(endTime);
          data.startTimeValue = `${time.Y}年${time.M}月${time.D}日 ${time.H}:${time.minutes}`;
          data.endTimeValue = endTime
            ? `${endTime.H}:${endTime.minutes}`
            : '待定';
          const list = data.users ? data.users : [];
          const users = list.filter((item) => {
            return item.responseStatus == 2;
          });
          console.log('users====', users);
          setMeetingList(users);
          list.forEach((item) => {
            if (data.creator == item.userId) {
              data.creatorName = item.userName;
            }
            if (userInfo.userId == item.userId) {
              data.localUser = item;
            }
          });
          console.log('data==3==', data);
          setMeetingDetail(data);
          // if ()
        }
      });
  };
  //预约会议响应
  const toResponseMeeting = (type: any) => {
    let urlTitle = window.location.protocol;
    console.log();

    axios
      .post(
        // `/api/meeting/responseMeeting.json`,{
        `/api/meeting/responseMeeting.json`,
        {
          userId: userInfo.userId, //用户id，必填
          userName: userInfo.userName, //用户名称，必填
          meetingId: meetingId, //会议唯一编号，必填
          type: type, //响应操作类型0-决绝 1-接受 2-未响应 3-暂定
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((res) => {
        let data = res.data.data;
        if (type == '1') {
          Message.success('已接受');
        } else {
          setMeetDetail(false);
          Message.success('已拒绝');
        }
      });
  };
  //关闭会议
  const toCloseMeeting = (userId: any, meetingId: any) => {
    let urlTitle = window.location.protocol;
    axios
      // .post(`/api/meeting/closeMeeting.json`, {
      .post(
        `/api/meeting/closeMeeting.json`,
        {
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
        Message.success('删除成功');
        setMeetDetail(false);
        console.log('data====', data);
      });
  };
  const closeMeeting = () => {
    Modal.confirm({
      title: '确认删除会议？',
      icon: <ExclamationCircleOutlined />,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        console.log('确认====');
        toCloseMeeting(userInfo.userId, meetingId);
      },
    });
  };
  const onChange = (key: string | number) => {
    const type =
      key == 1 ? 2 : key == 2 ? 1 : key == 3 ? 0 : key == 4 ? '' : '';
    if (type !== '') {
      const list = meetingDetail.users ? meetingDetail.users : [];
      const users = list.filter((item) => {
        return item.responseStatus == type;
      });
      console.log('users====', users);
      setMeetingList(users);
    } else {
      setMeetingList(meetingDetail.users);
    }
  };
  const showList = (list: any) => {
    return (
      <div className="meeting_show">
        {list.map((item: any, index: React.Key | null | undefined) => {
          return (
            <div key={index} className="meeting_show_item">
              <div className="meeting_show_portrait">
                {/* <Avatar size={64} icon={<UserOutlined />} /> */}
                <AvatarImage
                  // src={item?.avatarUrl}
                  nickName={item?.nickName}
                  userName={item?.userName}
                  userId={item?.from?.userId}
                  style={{ borderRadius: 8 }}
                  fit="cover"
                  width={40}
                  height={40}
                />
              </div>
              <div className="meeting_show_name">{item.userName}</div>
            </div>
          );
        })}
      </div>
    );
  };
  const addCreateGroup = async (selectedUsers: any, selectedUserIds: any) => {
    setCreateGroupConversationModal(false);
    if (userData == 'share') {
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
                `{"type":"makeMeetingInvite","creator":"${meetingDetail.creator}","subject":"${meetingDetail.subject}","startTime":"${startSet}","endTime":"${endSet}","location":"","meetingId":"${meetingDetail.id}","joinToken":"${meetingDetail.joinToken}","totaUsers":"${userInfo.userId}","users":[{"userId":"${selectedUsers[i].userId}","userName":"${selectedUsers[i].nickName}"}]}`,
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
    } else if (userData == 'adduser') {
      let urlTitle = window.location.protocol;
      if (selectedUsers?.length) {
        for (let i = 0; i < selectedUsers.length; i++) {
          console.log(meetingDetail.id, '1ddd');
          axios
            .post(
              // `/api/meeting/joinMeeting.json`,
              // {
              `/api/meeting/joinMeeting.json`,
              {
                userId: selectedUsers[i].userId, //用户id，必填
                meetingId: meetingDetail.id, //会议唯一编号，必填
                userName: selectedUsers[i].userName, //用户名称，必填
              },
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
              },
            )
            .then((res) => {
              let data = res.data.data;
              console.log('data111====', data);
            });
        }
        Message.success('邀请成功');
        onChange(1);
      }
    }
  };
  const getUserData = (value: string) => {
    console.log('====value====', value);
    setUserData(value);
    setCreateGroupConversationModal(true);
  };
  const copyUserId = (e) => {
    let params = meetingDetail?.id;
    copy(`${params}`);
    Message.success('复制成功');
    e.stopPropagation();
  };

  //加入会议
  const goInMeeting = async () => {
    console.log(meetingDetail, 'g - o -m - t');
    let urlTitle = window.location.protocol;
    // 先查单个
    axios
      .get(
        `/api/meeting/queryOneMeeting.json?userId=${userInfo.userId}&meetingId=${meetingDetail.id}`,
        {
          // `/api/meeting/queryOneMeeting.json?userId=${userInfo.userId}&meetingId=${meetingTitle}`,
          // {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then(async (res) => {
        if (res && res.data && res.data.data) {
          let joinParams = res.data.data;

          await axios.post(
            `/api/meeting/joinMeeting.json`,
            // `/api/meeting/joinMeeting.json`,
            {
              userId: userInfo.userId, //用户id，必填
              meetingId: joinParams.id, //会议唯一编号，必填
              userName: userInfo.userName, //用户名称，必填
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            },
          );
          // 如果是已开始的情况下, 加入
          if (res?.status == 200) {
            let room_id = joinParams?.roomId;
            let rtoken = joinParams?.roomToken;
            let urlTitle = window.location.protocol;

            if (joinParams.status == 'I') {
              return Message.warning('视频会议待发起');
            } else if (joinParams.status == 'C') {
              return Message.error('视频会议已取消');
            } else if (joinParams.status == 'P') {
              const res = await axios.post(
                `/api/meeting/saveUserProperties.json`,
                {
                  tntInstId: 'DEMOISVT', // 租户ID，必填
                  appId: '9B16148C616CECA0', // 应用ID，必填
                  end: 'PROD', // 环境，必填
                  meetingId: meetingDetail?.id, // 会议ID，必填
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
              console.log(res, 'r - ee - s');

              if (res?.status == 200) {
                setRoomId(room_id);
                setRoomToken(rtoken);
                setWebMeeting(joinParams);
                let inviter = userInfo.userId;
                let extra = { url: joinParams?.subject };
                let inviteId = userInfo.userId;
                let inviteInfo = { audioEnable: 1, videoEnable: 1 };
                setMeetJoinTip(false);
                setRole('callee');
                setInMeetingType('add');
                setVisible(true);
                // expJumpMeeting(room_id, rtoken, inviter, extra, inviteId, inviteInfo);
                setMeetDetail(false);
                return;
              }
            } else if (joinParams.status == 'F') {
              return Message.error('视频会议已结束');
            }
          }
        }
      });
  };
  const createMet = () => {
    setWebMeeting(meetingDetail);
    // let inviter = userInfo.userId;
    // let extra = { url: meetingDetail?.subject };
    // let inviteId = userInfo.userId;
    // let inviteInfo = { audioEnable: 1, videoEnable: 1 };
    // setMeetJoinTip(false);
    // setRole('callee');
    // setInMeetingType('add');
    // setVisible(true);
    // // expJumpMeeting(room_id, rtoken, inviter, extra, inviteId, inviteInfo);
    // setMeetDetail(false);
    setMeetJoinTip(false);
    setRole('caller');
    setInMeetingType('create');
    setVisible(true);
    // expJumpMeeting(room_id, rtoken, inviter, extra, inviteId, inviteInfo);
    setMeetDetail(false);
  };
  // @ts-ignore
  return (
    <div className="AppointmentMeetingDetail">
      <div className="meetingDetail_head">
        {meetingDetail?.localUser?.responseStatus == 2 && (
          <div className="meeting_head_left">
            <div
              className="meeting_icon"
              onClick={() => {
                toResponseMeeting(0);
              }}
            >
              <Button
                type="dashed"
                icon={
                  <MinusCircleOutlined
                    style={{ fontSize: '16px', color: '#fa0101' }}
                  />
                }
              >
                拒绝
              </Button>
            </div>
            <div className="meeting_icon">
              <Button
                onClick={() => {
                  toResponseMeeting(1);
                }}
                type="dashed"
                icon={
                  <CheckCircleOutlined
                    style={{ fontSize: '16px', color: '#02f89a' }}
                  />
                }
              >
                接受
              </Button>
            </div>
          </div>
        )}
        <div className="meeting_head_right">
          {meetingDetail.creator == userInfo.userId && (
            <div
              className="meeting_icon"
              onClick={() => {
                closeMeeting();
              }}
            >
              <DeleteOutlined style={{ fontSize: '18px' }} />
            </div>
          )}
          <div
            className="meeting_icon"
            onClick={() => {
              getUserData('adduser');
            }}
          >
            <UserAddOutlined style={{ fontSize: '18px' }} />
          </div>
          <div
            className="meeting_icon"
            onClick={() => {
              getUserData('share');
            }}
          >
            <ShareAltOutlined style={{ fontSize: '18px' }} />
          </div>
          <div
            className="meeting_icon"
            onClick={() => {
              setMeetDetail(false);
            }}
          >
            <CloseCircleOutlined style={{ fontSize: '18px' }} />
          </div>
        </div>
      </div>
      <div className="meetingDetail_main">
        <div className="meetingDetail_main_title meetingDetail_main_item">
          <div className="meeting_circle"></div>
          {meetingDetail.subject ? meetingDetail.subject : ''}
        </div>
        <div className="meetingDetail_main_time meetingDetail_main_item">
          <div className="meeting_icon">
            <FieldTimeOutlined />
          </div>
          {meetingDetail.startTimeValue}- {meetingDetail.endTimeValue}
        </div>
        <div className="meetingDetail_main_time meetingDetail_main_item">
          <div className="meeting_icon">
            <UserOutlined />
          </div>
          {meetingDetail.creatorName ? meetingDetail.creatorName : ''}(组织人)
        </div>
        <div className="meetingDetail_main_time meetingDetail_main_item">
          <div className="meeting_icon">
            <VideoCameraOutlined />
          </div>
          {meetingDetail.subject ? meetingDetail.subject : ''}
        </div>
        {meetingDetail?.roomId && meetingDetail?.creator != userInfo.userId && (
          <div className="meetingDetail_main_time meetingDetail_main_item">
            <div className="meeting_icon">
              <VideoCameraOutlined />
            </div>
            <Button
              onClick={() => {
                goInMeeting();
              }}
              type="primary"
            >
              加入视频会议
            </Button>
          </div>
        )}
        {
          // 这是给会议创建人退出后重新进入的地方
          meetingDetail?.roomId !== '' &&
            meetingDetail?.creator == userInfo.userId && (
              <div>
                <div className="meetingDetail_main_time meetingDetail_main_item">
                  <div className="meeting_icon">
                    <VideoCameraOutlined />
                  </div>
                  <Button
                    onClick={() => {
                      goInMeeting();
                    }}
                    type="primary"
                  >
                    加入视频会议
                  </Button>
                </div>
              </div>
            )
        }
        {(meetingDetail?.roomId == '' || meetingDetail?.roomId == undefined) &&
          meetingDetail?.creator == userInfo.userId && (
            <div className="meetingDetail_main_time meetingDetail_main_item">
              <div className="meeting_icon">
                <VideoCameraOutlined />
              </div>
              <Button
                onClick={() => {
                  createMet();
                }}
                type="primary"
              >
                创建会议
              </Button>
            </div>
          )}
        <div>
          入会号: {meetingDetail.id}
          <CopyOutlined style={{ color: '#1890FF' }} onClick={copyUserId} />
        </div>
        {/* {meetingDetail.status=='P'&&(
          <div className="meetingDetail_main_item">
            <div className="main_item_content">
              <div className="item_content_value">
                入会号:{meetingDetail.roomId ? meetingDetail.roomId : ''}
              </div>
              <div className="item_content_value">
                更多入会信息<RightOutlined/>
              </div>
            </div>
          </div>
        )} */}
        <Tabs
          defaultActiveKey="1"
          onChange={onChange}
          items={[
            {
              label: `未响应`,
              key: '1',
              children: showList(meetingList),
            },
            {
              label: `已接受`,
              key: '2',
              children: showList(meetingList),
            },
            {
              label: `已拒绝`,
              key: '3',
              children: showList(meetingList),
            },
            {
              label: `全部`,
              key: '4',
              children: showList(meetingList),
            },
          ]}
        />
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
}
