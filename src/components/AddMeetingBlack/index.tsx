import React, { useEffect, useState, useRef } from 'react';

import './style.less';
import { Button, message as Message } from 'antd';
import {
  AudioMutedOutlined,
  AudioOutlined,
  CloseOutlined,
  VideoCameraFilled,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useModel } from '@@/plugin-model/useModel';
import axios from 'axios';
import { filterTime } from '@/utils';
const AddMeeting = (props: any) => {
  const {
    audioState,
    setAudioState,
    videoState,
    setVideoState,
    setVisible: setMeetingModalVisible,
    setProps: setMeetingModalProps,
  } = useModel('meetingModal');
  let { setAddMeeting, userInfo } = props;
  const [meetingNum, setMeetingNum] = useState('');
  const changeNum = (e: any) => {
    let val = e.target.value.replace(/[^\d]/g, '');
    setMeetingNum(val);
  };
  // 开麦和关麦 1:开;0:关
  const checkAudio = (value: number) => {
    setAudioState(value);
  };
  // 开关摄像头,1:开;0:关
  const checkVideo = (value: number) => {
    setVideoState(value);
  };
  const toJoinMeeting = () => {
    if (!meetingNum) {
      Message.info('请输入入会号');
      return;
    }
    toQueryOneMeeting(userInfo.userId, meetingNum);
  };
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
          console.log('data====', data);
          if (data.status !== 'P') {
            Message.info('您输入的入会号未开始或已关闭');
          } else {
          }
        } else {
          console.log('res====', res);
          Message.info('请输入正确的入会号');
        }
      });
  };
  return (
    <div className="AddMeeting">
      <div className="box">
        <div className="top">
          <div className="titleName">请输入入会号</div>
          <div>
            <input
              type="text"
              className="input"
              value={meetingNum}
              onChange={changeNum}
            />
          </div>
          <CloseOutlined
            className="close"
            onClick={() => setAddMeeting(false)}
          />
        </div>
        <div className="iconFun">
          {videoState === 1 && (
            <VideoCameraFilled className="icon" onClick={() => checkVideo(0)} />
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
        <Button type="primary" className="btn" onClick={() => toJoinMeeting()}>
          加入
        </Button>
      </div>
    </div>
  );
};
export default AddMeeting;
