//预约会议
import React, { useEffect, useState } from 'react';
import './style.less';
import AppointmentMeetingDetail from '@/components/AppointmentMeetingDetail';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import { filterTime } from '@/utils';
import MeetingBlack from '@/components/meetingBlackboard';
import { useModel } from 'umi';
import { ContentType } from '../../constants';
export default function (props: any) {
  const { sdk } = useModel('global');
  const { setMakeMeeting, userInfo, makeMeeting } = props;
  const [meetDetail, setMeetDetail] = useState(false);
  const [orderMeeting, setOrderMeeting] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [iList, setIList] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });
  useEffect(() => {
    if (!makeMeeting) return;
    toQueryHistoryMeetings(1);
  }, [makeMeeting]);
  const groupBy = (arr: any[], fn: (arg0: any) => any) => {
    let group = {};
    arr.map((item) => {
      let type = JSON.stringify(fn(item));
      // @ts-ignore
      group[type] = group[type] || [];
      // @ts-ignore
      group[type].push(item);
    });
    return Object.keys(group).map((item) => {
      return {
        key: item.replace('"', '').replace('"', ''),
        value: group[item],
      };
    });
  };
  const handleMeetDetail = (childItem: {
    status: string;
    id: React.SetStateAction<string>;
  }) => {
    if (childItem.status == 'I') {
      setMeetingId(childItem.id);
      setMeetDetail(true);
    }
  };
  const getNextData = async () => {
    await toQueryHistoryMeetings(pagination.pageIndex + 1);
  };
  const newAppointment = () => {
    setOrderMeeting(true);
  };
  //创建会议
  const toCreateMeeting = (
    createUserName: any,
    creator: any,
    subject: any,
    type = 0,
    users = [],
    notifyBySingleSession = true,
    startTime: number,
    endTime: number,
  ) => {
    let urlTitle = window.location.protocol;
    axios
      .post(
        // `/api/meeting/create.json`,{
        `/api/meeting/create.json`,
        {
          appId: '9B16148C616CECA0', //appId，必填
          createUserName: createUserName, //创建会议用户名称，必填
          creator: creator, //创建会议用户id，必填
          env: 'PROD', //环境id，必填
          location: '', //会议地点，可选
          // "notifyBySingleSession":notifyBySingleSession, //是否通过单聊发送通知，预约会议时生效，可选
          subject: subject, //会议主题，必填
          tntInstId: 'DEMOISVT', //租户id，必填
          type: type, //会议类型 0-立即开会 1-预约会议，必填
          users: users, //参与会议用户列表
          startTime: startTime, //会议预约开始时间
          endTime: endTime, //会议预约结束时间
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      .then(async (res) => {
        let data = res.data.data;
        console.log('data==11==', data);
        setOrderMeeting(false);
        // getAllList();
        if (type == 1) {
          console.log(users, '选择的user');

          for (let i = 0; i < users?.length; i++) {
            const getCid = await sdk.queryUserInfoById({
              queryUserId: users[i].userId,
            });
            console.log(getCid, 'pp-p-p--');

            let cid;
            if (getCid?.sessionVo?.cid) {
              cid = getCid?.sessionVo?.cid;
            } else {
              const res = await sdk.createConversation({
                type: 'single',
                subUserId: users[i].userId,
              });
              if (res?.cid) {
                cid = res.cid;
              }
            }
            console.log(cid, 'c - i - d');

            try {
              let urlTitle = window.location.protocol;
              const enc = new TextEncoder();
              const msgbody: any = {
                msgType: 'custom',
                toCid: cid,
                cid: cid,
                msgContent: {
                  data: enc.encode(
                    `{"type":"makeMeetingInvite","creator":"${userInfo.userId}","subject":"${subject}","startTime":"${startTime}","endTime":"${endTime}","location":"","meetingId":"${data.id}","totaUsers":"${userInfo.userId}","users":[{"userId":"${users[i].userId}","userName":"${users[i].nickName}"}]}`,
                  ),
                  dataType: 'meetingCard',
                  dataVersion: 1,
                },
              };

              let msg = await sdk.messageBuilder({ ...msgbody });
              console.log(msg, 'm - s - g');

              const res = await sdk.sendMessage({
                msgType: ContentType.Custom,
                ...msg,
              });
              console.log(res, '!!! fa - song111');
            } catch (e) {
              console.log(e, 'baocuo ');
            }
          }
        }
      });
  };
  //查询历史会议列表 支持我创建的会议和我加入的会议
  const toQueryHistoryMeetings = (pageIndex: number) => {
    console.log('userInfo==', userInfo);
    let urlTitle = window.location.protocol;
    axios
      .post(
        // `/api/meeting/queryHistoryMeetings.json`,{
        `/api/meeting/queryHistoryMeetings.json`,
        {
          pageIndex: pageIndex, //开始页码，可选
          pageSize: 20, //每页记录大小，可选
          tntInstId: 'DEMOISVT', //租户id，必填
          appId: '9B16148C616CECA0', //appId，必填
          env: 'PROD', //环境id，必填
          createType: 'none', //创建方式 none-所有 create-我创建的 join-我加入的，可选
          userId: userInfo.userId, //用户id，必填
        },
      )
      .then((result) => {
        const totalPage =
          result && result.data && result.data.totalPage
            ? Number(result.data.totalPage)
            : 1;
        setPagination({ pageIndex, totalPage });
        if (
          result &&
          result.data &&
          result.data.list &&
          result.data.list.length > 0
        ) {
          let list = result.data.list;
          list.forEach((item) => {
            const time = filterTime(item.startTime);
            const endTime = item.endTime ? filterTime(item.endTime) : '';
            item.presentTime = `${time.Y}年${time.M}月${time.D}日`;
            item.startTimeValue = `${time.H}:${time.minutes}`;
            item.endTimeValue = endTime
              ? `${endTime.H}:${endTime.minutes}`
              : '待定';
          });
          let res = groupBy(list, function (res) {
            return res.presentTime;
          });
          res.sort(function (a, b) {
            return a.startTime < b.startTime ? 1 : -1;
          });
          console.log(res, 'r - e - s');
          console.log(iList, 'iList===');
          let newList: any[] = [];
          newList = newList.concat(iList).concat(res);
          console.log(newList, 'newList===');
          // @ts-ignore
          setIList(newList);
        }
      });
  };
  const handleMeetingDetail = (
    meetingTitle: any,
    meetingList: any,
    startTime: any,
    endTime: any,
  ) => {
    console.log(
      userInfo.userName,
      userInfo.userId,
      meetingTitle,
      1,
      meetingList,
      true,
      startTime,
      endTime,
      '1 - 2 - 3',
    );

    toCreateMeeting(
      userInfo.userName,
      userInfo.userId,
      meetingTitle,
      1,
      meetingList,
      true,
      startTime,
      endTime,
    );
  };
  return (
    <div className="AppointmentMeeting">
      <div className="Meetinghead">
        <div className="Meetingheadl">会议</div>
        <div className="Meetingheadr">
          <img
            src={require('@/assets/ze-cross.png')}
            alt=""
            onClick={() => setMakeMeeting(false)}
          />
        </div>
      </div>
      <div className="isContent" id="scrollableDiv">
        <InfiniteScroll
          dataLength={iList.length}
          next={getNextData}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
          scrollableTarget="scrollableDiv"
        >
          {iList.map((item, index) => {
            return (
              <div key={index}>
                <div className="isToday">{item.key}</div>
                <div>
                  {item.value.map((childItem, child) => {
                    return (
                      <div
                        key={childItem.id}
                        className="isTodaylist"
                        onClick={() => handleMeetDetail(childItem)}
                      >
                        <div className="isTodaylistl">
                          <div className="isTodaylistlimg">
                            <img
                              src={require('@/assets/antOutline-video-camerablue.png')}
                              alt=""
                            />
                          </div>
                          <div className="isTodaylistltext">
                            <div className="isTodaylistltext-title">
                              {childItem.subject}
                            </div>
                            {childItem.status == 'P' && (
                              <div className="isTodaylistltext-ing">
                                <img
                                  src={require('@/assets/iconPark-waves-left.png')}
                                  alt=""
                                />
                                <span> {childItem.acceptUsers}人在会议中</span>
                              </div>
                            )}
                            {childItem.status == 'I' && (
                              <div className="isTodaylistltext-time">
                                {childItem.startTimeValue} -{' '}
                                {childItem.endTimeValue}{' '}
                              </div>
                            )}
                          </div>
                        </div>
                        {childItem.status == 'P' && (
                          <div className="isTodaylistr">入会</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </InfiniteScroll>
      </div>
      <div className="openline"></div>
      <div className="creatbtn" onClick={() => newAppointment()}>
        新建预约
      </div>
      {meetDetail && (
        <AppointmentMeetingDetail
          userInfo={userInfo}
          meetDetail={meetDetail}
          meetingId={meetingId}
          setMeetDetail={setMeetDetail}
        ></AppointmentMeetingDetail>
      )}
      {orderMeeting && (
        <MeetingBlack
          meetType={1}
          userInfo={userInfo}
          setCreateMeeting={setOrderMeeting}
          handleMeetingDetail={handleMeetingDetail}
        ></MeetingBlack>
      )}
    </div>
  );
}
