import { useState, useEffect } from 'react';

import { history } from 'umi';

import Cookie from 'js-cookie';

import axios from 'axios';

import { message as Message } from 'antd';

import type {
  DefaultSdkConfig,
  SdkType,
  UserInfo,
  EmojiList,
} from '@/typings/global';
console.log('我走到global了');

const { AlipayCcmImSdk } = window;

let goMeeting;
if (history?.location?.query?.goMeeting) {
  console.log('我加来了', history);
  goMeeting = true;
}

console.log('拿到AlipayCcmImSdk');

const defaultConfig: DefaultSdkConfig = {
  mockConfig: {
    accessKey: 'ABC0C41D8A56D0C1',

    accessSecret: '4FFFE2C2092C18D9D55779842E1EB218',

    tntInstId: 'DEMOISVT',

    // accessKey: '0dde877c32c10ab959db454d7124e22b',

    // tntInstId: 'TISV00A',

    appId: '9B16148C616CECA0',

    bizType: '0100',

    appVersion: '0.0.1',

    userId: 't3',

    heartBeatCheckTime: 30,

    useRtc: true,

    useLocalDbEmoji: true,

    usePreServer: true,

    rtcSlot: {
      publishVideoElementId: 'implusPublishVideoElementId',

      subscribeVideoElementId: 'implusSubscribeVideoElementId',

      subscribeAudioElementId: 'implusSubscribeAudioElementId',
    },

    // ...getLocationSearch()

    // ...getCookie()
  },

  emojiList: [],

  isHideSomeFunctions: false,
};

const useGlobalModel = () => {
  console.log('走到useGlobalModel');

  const [mySdkStore, setMySdkStore] = useState(defaultConfig);

  const [globalConverList, setGlobalConverList] = useState([]);

  const [newMessage, setNewMessage] = useState(null);

  const [sdk, setSdk] = useState<SdkType>(null);

  const [userInfo, setUserInfo] = useState<UserInfo>({});

  const [loading, setLoading] = useState(true);

  const [pagePath, setPagePath] = useState({ activeIcon: '' });

  const updateGlobalConverList = (list) => {
    if (list && list.length) {
      setGlobalConverList(list);
    }
  };

  const clearGlobalConverList = () => {
    setGlobalConverList(() => {
      return [];
    });
  };

  console.log('loginOut--------');

  const loginOut = (newInstance?: SdkType) => {
    history.push('/gov/cz/index_dev');

    const instance = newInstance || sdk;

    if (instance) {
      instance.close();

      setSdk(null);
    }
  };

  console.log('login--------');

  const login = async (userId: string, appId: string) => {
    // const info = await sdk.queryUserInfoById({ queryUserId: userId });

    // if (!info) {

    //   Message.error('用户未注册，请重新登录');

    //   loginOut();

    // } else {
    if (goMeeting) {
      const search = history?.location?.search;
      history.push({
        pathname: '/meeting',
        search: search,
      });
    } else {
      window.location.href = `/gov/cz/index_dev`;
    }

    setLoading(true);

    // }
  };

  console.log('走到random--------');

  const random = function (str: string, len) {
    let num = str
      .split('')
      .map((char) => char.charCodeAt())
      .join('');
    return Math.sin(num).toString().split('.')[1].slice(0, len);
  };
  const [newFirend, serNewFirend] = useState('');

  const readNewFirend = () => {
    serNewFirend('');
  };

  useEffect(() => {
    let urlTitle = window.location.protocol;
    // if (window.czLoginGrantType === '1') {
    //   if (!ncz) {
    //     console.error('找不到JS TICKET SDK');
    //     return;
    //   }
    //   console.log('获取到ncz');

    //   //配置

    //   ncz.config({
    //     debug: true,
    //     timestamp: new Date().getTime(),
    //     nonce: random('abcdefghigk', 16),
    //     signType: 'md5',
    //     sign: '',
    //     jsApiList: ['getJdTicket'],
    //   });
    //   console.log('ncz ready');
    //   //调用接口

    //   ncz.ready(function () {
    //     ncz.getJdTicket({
    //       data: {},

    //       success: function (res) {
    //         console.log(res, '返回的数据');

    //         const {
    //           errno, // errno=1 的时候为成功，errno=0 的时候为失败 message, // 信息

    //           data, // 返回结果数据
    //         } = res;
    //         if (errno === 0) {
    //           Message.error('ncz返回状态失败');
    //         }
    //         console.log(errno, '状态');

    //         const { userTicket } = data;

    //         console.log('调用ticket生成成功', userTicket);
    //         if (userTicket) {
    //           axios
    //             .get(
    //               `${urlTitle}//${window.location.host}/gov/cz/oauth/grant?code=${userTicket}&grantType=1`,
    //             )
    //             .then((res) => {
    //               if (!res?.data.data) return Message.error('未返回token');
    //               console.log(res, 'pad端口获取的数据');

    //               axios
    //                 .get(
    //                   `${urlTitle}//${window.location.host}/gov/cz/user/get?token=${res?.data.data}`,
    //                 )
    //                 .then((res) => {
    //                   loginFunc(res);
    //                 });
    //             });

    //           //调用IM服务端授权接口 /gov/cz/oauth/grant?code=传ticket&grantType=1

    //           //接口会返回token
    //         }
    //       },

    //       error: function (res) {
    //         const {
    //           errno, // errno=1 的时候为成功，errno=0 的时候为失败

    //           message, // 信息
    //         } = res;
    //         console.log(message, '走到nzcerror');
    //       },

    //       cancel: function (res) {
    //         const {
    //           errno, // errno=1 的时候为成功，errno=0 的时候为失败 message, // 信息
    //         } = res;
    //         console.log(errno, '走到nzccancel');
    //       },
    //     });
    //   });
    // } else {
    //   if (!window.czLoginToken) {
    //     Message.error('登陆失败, 未获取到token');

    //     history.push('/gov/cz/index_dev');

    //     return;
    //   }

    //   axios
    //     .get(
    //       `${urlTitle}//${window.location.host}/gov/cz/user/get?token=${window.czLoginToken}`,
    //     )
    //     .then((res) => {
    //       loginFunc(res);
    //     });
    // }
    loginFunc();
  }, []);
  console.log('走到loginFUnc');

  const loginFunc = (res) => {
    console.log('res=', res);
    let data = res && res.data && res.data.data ? res.data.data : {};
    // if (goMeeting) {
    //   defaultConfig.mockConfig.userId = history?.location?.query?.localUserId;
    // } else {
    //   if (!data.userUuid) return Message.error('userUuid为空');
    //   if (data.userUuid.includes('-')) {
    //     defaultConfig.mockConfig.userId = data.userUuid.replace(/-/g, '');
    //   } else {
    //     defaultConfig.mockConfig.userId = data.userUuid;
    //   }
    // }
    // if (goMeeting) {
    //   defaultConfig.mockConfig.areaName = history?.location?.query?.areaName;
    //   defaultConfig.mockConfig.nickname = history?.location?.query?.nickname;
    // } else {
    //   defaultConfig.mockConfig.areaName = data.areaName;

    //   defaultConfig.mockConfig.nickname = data.nickname;
    // }

    if (data.userUuid) {
      if (defaultConfig.mockConfig.userId !== '') {
        login(defaultConfig.mockConfig.userId, defaultConfig.mockConfig.appId);

        return;
      } else {
        Message.error('userId为空');

        history.push('/gov/cz/index_dev');
      }
    } else if (!sdk) {
      console.log('走到sdk');

      const newSdkIns = new AlipayCcmImSdk({
        ...defaultConfig.mockConfig,

        userId: defaultConfig.mockConfig.userId,

        appId: defaultConfig.mockConfig.appId,
      });

      const onInitOk = async () => {
        setTimeout(() => setLoading(false), 0);

        const info = await newSdkIns.queryUserInfoById({
          queryUserId: defaultConfig.mockConfig.userId,
        });
        console.log('info========', info);
        if (!info) {
          Message.error('用户未注册，请重新登录');

          loginOut(newSdkIns);

          return;
        } else {
          setUserInfo(info);
        }
      };

      newSdkIns.onError = (error: any) => console.error(error);

      newSdkIns.onInitOk = onInitOk;

      newSdkIns.onNewMessage = (data) => {
        setNewMessage(data);
      };

      newSdkIns.onKicked = () => {
        Message.error('当前用户已在其他端登录！');

        history.push('/gov/cz/index_dev');
      };

      newSdkIns.onEmojiInitOk = () => {
        newSdkIns.getEmojiById('all').then((emojiList: EmojiList) => {
          setMySdkStore({ ...mySdkStore, emojiList });
        });
      };

      newSdkIns.onNewFriendRequest = (newFriendRepones) => {
        const { userId } = newFriendRepones;
        serNewFirend(userId);
      };

      newSdkIns.connect();

      setSdk(newSdkIns);
    }
  };

  return {
    mySdkStore,

    sdk,

    setMySdkStore,

    loading,

    newMessage,

    userInfo,

    login,

    loginOut,

    globalConverList,

    updateGlobalConverList,

    clearGlobalConverList,

    pagePath,

    setPagePath,
    newFirend,
    readNewFirend,
    serNewFirend,
  };
};

export default useGlobalModel;
