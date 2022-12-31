import { useEffect, useState } from 'react';
import AppointmentMeetingDetail from './../../AppointmentMeetingDetail';
import './meetingCard.less';
import { useModel } from 'umi';
import PubSub from 'pubsub-js';
import moment from 'moment';
import { Button } from 'antd';
import {
  VideoCameraOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
export default function (props) {
  const { sdk } = useModel('global');
  console.log(props, 'p - 2 3');
  let utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'
  let u8arr = new Uint8Array(props.msgContent.data);
  console.log(u8arr, 'u 8 ');

  let val = JSON.parse(utf8decoder.decode(u8arr));
  console.log(val, 'v - a - l');

  if (val.creator) {
    sdk.queryUserInfoById({ queryUserId: val.creator }).then((res) => {
      console.log(res, 'p -  r - s');
      setCreatMetName(res?.nickName || res?.userName);
    });
  }
  const [creatMetName, setCreatMetName] = useState('');
  const [meetDetail, setMeetDetail] = useState(false);
  useEffect(() => {
    console.log(meetDetail, '1 - 2 - 4');
  }, [meetDetail]);
  // useEffect(() => {
  //   if (val) {
  //     console.log(val, 'v - a - l');
  //     alert('yes')
  //   }
  // }, [val])
  // console.log(String.fromCharCode(...new Uint8Array(props.msgContent.data)), '1 - 2')
  // 会议中
  if (val.type == 'inMeetingInvite') {
    console.log(props, val, 'p - 2 3 -3');
  }
  // const [type, setType] = useState();

  const inMeetingAddMore = () => {
    // {
    //   PubSub.publish('inMeetingAddMore', val);
    // }
    if (val.type == 'inMeetingInvite') {
      console.log(props, val, '1111 --222');

      PubSub.publish('showMeetDetail', { props, val, type: 'add' });
    } else {
      PubSub.publish('showMeetDetail', { props, val, type: 'make' });
      // setMeetDetail(true);
    }
  };

  return (
    <div>
      {/* {meetDetail && (
        <AppointmentMeetingDetail
          userInfo={val.creator}
          meetDetail={meetDetail}
          meetingId={val.meetingId}
          setMeetDetail={setMeetDetail}
        ></AppointmentMeetingDetail>
      )} */}
      {val.type == 'inMeetingInvite' ? (
        <div>
          <div>
            <VideoCameraOutlined className="meetingCardIcon"></VideoCameraOutlined>
            <span className="title">视频会议</span>
          </div>
          <div>
            <span className="metingName">
              {val?.subject ? val.subject : ''}
            </span>
          </div>
          <div>
            <ClockCircleOutlined className="meetingCardIcon" />
            {moment(props.timestamp).format('YYYY-MM-DD HH:mm:ss')}
          </div>
          <div>
            <UserOutlined className="meetingCardIcon" />
            {creatMetName}(组织人)
          </div>
          <div>
            <VideoCameraOutlined className="meetingCardIcon" />
            入会号 : {val.meetingId}
          </div>
          <Button className="meetingCardBtn" onClick={() => inMeetingAddMore()}>
            查看详情
          </Button>
        </div>
      ) : (
        // 预约
        <div>
          <div>
            <VideoCameraOutlined className="meetingCardIcon"></VideoCameraOutlined>
            <span className="title">视频会议</span>
          </div>
          <div>
            <span className="metingName">
              {val?.subject ? val.subject : ''}
            </span>
          </div>
          <div>
            <ClockCircleOutlined className="meetingCardIcon" />
            {moment(Number(val.startTime)).format('YYYY-MM-DD HH:mm:ss')} :{' '}
            {moment(Number(val.endTime)).format('YYYY-MM-DD HH:mm:ss')}
          </div>
          <div>
            <UserOutlined className="meetingCardIcon" />
            {creatMetName}(组织人)
          </div>
          <div>
            <VideoCameraOutlined className="meetingCardIcon" />
            入会号 : {val.meetingId}
          </div>
          <Button className="meetingCardBtn" onClick={() => inMeetingAddMore()}>
            查看详情
          </Button>
        </div>
      )}
    </div>
  );
}
