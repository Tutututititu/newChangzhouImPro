declare module '*.less';

export interface DefaultSdkConfig {
  mockConfig: {
    accessKey: string;
    accessSecret?: string;
    tntInstId: string;
    appId: string;
    accessSecret?: string;
    bizType: string;
    appVersion?: string;
    userId: string;
    heartBeatCheckTime: number;
    useRtc?: boolean;
    useLocalDbEmoji?: boolean;
    usePreServer?: boolean;
    rtcSlot?: {
      publishVideoElementId: string;
      subscribeVideoElementId: string;
      subscribeAudioElementId: string;
    };
  };
  emojiList: [] | EmojiList;
  isHideSomeFunctions?: boolean;
}

export interface SdkType {
  [key: string]: any;
}

export interface UserInfo {
  birthday: string;
  gender: string;
  avatarUrl: string;
  nickName: string;
  companyName: string;
  gmtCreate: number;
  userName: string;
  userId: string;
  phoneNo: string;
  isBlack: false;
  isConcern: boolean;
  tntInstId: string;
  appId: string;
  userType: string;
  email: string;
  mark: string;
  goodFriendTag: null | string;
  userExtraPropertyVO: { [key: string]: 'true' | 'false' };
}

interface UserItem {
}

export declare type UserList = UserItem[];

export interface EmojiItem {
  cn: string;
  globalUniqueId: string;
  url: string;
}

export declare type EmojiList = EmojiItem[];

export interface CommonError {
  errorMessage: string;
}

export interface TagItem {
  code: string;
  name: string;
}

export declare type TagList = TagItem[];
