import { useState } from 'react';
import { useModel } from 'umi';
// const [roomUserOder, setRoomUserOder] = useState(0); // 房间总人数

const meetingFunc = () => {
  const [roomUserState, setRoomUserState] = useState([]); // 房间全部人员状态
  const [soloMute, setSoloMute] = useState([]);
  // {
  //     userId: xxx, // 用户id
  //     userName: 'xx', // 用户名称
  //     isOpenCamera: true, // 是否开启摄像头
  //     isOpenVicoe: true, // 是否开启麦克风
  //     feedId_id: xx, // 用户的视频流
  //     state: 1, 2, 3, // 1. 会议中 2. 离开 3. 未反应  // 先系统级是否开启麦克风 用户级 权限级
  //     limitsMute // 权限静音, 主持人联席主持人 true, false
  //     soloMute: //  单状态静音, 只对自己又效果 true ,false
  // }
  return {
    roomUserState,
    setRoomUserState,
  };
};

export default meetingFunc;
