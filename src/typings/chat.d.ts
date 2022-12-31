import { UserInfo } from '@/typings/global';

export interface MessageUser {
  avatarUrl: string;
  channel: string;
  domain: string;
  extInfo: Record<string, unknown>;
  nickName: string;
  uid: string;
  userId: string;
  userMark: string;
  userName: string;
}

export interface BizParams {
  batchSendMessage: 0 | 1;
  deleteMessage: 0 | 1;
  divideSessionGroups: 0 | 1;
  groupMemberLimit: number;
  groupMemberMax: number;
  isAllowAdminAtAll: 0 | 1;
  isAllowAdminDing: 0 | 1;
  isAllowAdminModify: 0 | 1;
  isAllowAdminTopMessage: 0 | 1;
  isAllowCmdBatchTransfer: 0 | 1;
  isAllowCmdRecall: 0 | 1;
  isAllowCmdReply: 0 | 1;
  isAllowCmdTransfer: 0 | 1;
  isAllowDing: 0 | 1;
  isAllowEmoji: 0 | 1;
  isAllowGroupShortcutBar: 0 | 1;
  isAllowInputAt: 0 | 1;
  isAllowInspectMessage: 0 | 1;
  isAllowMeeting: 0 | 1;
  isAllowMemberTalkSecret: 0 | 1;
  isAllowNotice: 0 | 1;
  isAllowRobot: 0 | 1;
  isAllowSearchGroupId: 0 | 1;
  isAllowSingleShortcutBar: 0 | 1;
  isAllowSystemUser: 0 | 1;
  isAllowUser: 0 | 1;
  isDisbandGroup: 0 | 1;
  isNeedOfflinePush: 0 | 1;
  isShowHistoryMessage: 0 | 1;
  multipleChoiceMsg: 0 | 1;
  setMsgExtraProperty: 0 | 1;
  shortcutBarItems: 0 | 1;
  showFriendPhone: 0 | 1;
}

export interface TextMessage {
  text: string;
}

export interface EmojiMessage {
  emoji: string;
  iconId: string;
  iconUrl: string;
}

export interface UrlMessage {
  href: string;
  title: string;
}

export interface RtcMessage {
  invitedUserRejected: boolean;
  roomId: string;
  rtcAction: 'receiveInvite' | 'receiveInvite';
  rtcRoomInfo: {
    closeTime: string;
    createTime: string;
    currentUserCount: number;
    currentUsers: UserInfo[];
    status: 'CLOSED' | 'CLOSED';
  };
}

export interface CustomMessage {
  data: any;
  dataType: string;
  dataVersion: string;
}

export type MessageContent = TextMessage | EmojiMessage;

interface EmojiItem {
}

export interface InstantReplyFaceInfo {
  faceContent: EmojiItem;
  from: UserInfo;
}

export type InstantReplyFaceInfos = InstantReplyFaceInfo[];

export interface QuotedReplyInfo {
  quoteMessageContent: MessageContent;
  quoteMessageContentType: string;
  quoteMessageId: string;
  quoteMessageSender: UserInfo;
  topicId: string;
}

export interface QuotedInfo {
  beQuoted: boolean;
  replyCounter: number;
  topicId: string;
}

export interface CommonMessage {
  id: string;
  atUsers: MessageUser[];
  bizParams: BizParams;
  cid: string;
  content: MessageContent;
  contentType: string;
  contentTypeCode: number | string;
  from: MessageUser;
  messageContentType: string;
  messageType: string;
  // privateUsers: MessageUser[];
  sourceType: string;
  templateCode: number | string;
  timestamp: string;
  to: MessageUser;
}

export interface MessaageInChatBox extends CommonMessage {
  readStatusVO?: any;
  msgId: string;
  localMsgId: string;
  msgContent: MessageContent;
  msgType: string;
  instantReplyFaceInfos: InstantReplyFaceInfos[];
  quotedInfo: QuotedInfo;
  quoteReplyInfo: QuotedReplyInfo;
  localId: string;
  isCollected: boolean;
  isDelete: boolean;
  isRead: boolean;
  isRecall: boolean;
}

export interface MessageInMessageChannel extends CommonMessage {
  sid: string;
  msgId: string;
  sessionName: string;
}

export interface MessageInSearchResult
  extends Omit<CommonMessage, 'id' | 'content'> {
  msgId: string;
  searchContent: string;
  msgContent: MessageContent;
}

export interface ConversationItem {
  actualLastMsgContent: MessageContent;
  bizParams: BizParams;
  cid: string;
  dingSession: boolean;
  avatarUrl: string;
  closed: boolean;
  creator: string;
  gmtCreate: string;
  groupSession: boolean;
  lastMsg: string;
  lastMsgContent: MessageContent;
  lastMsgContentType: string;
  lastMsgId: string;
  lastMsgIsAtMe: boolean;
  lastMsgSendTime: number;
  lastMsgSenderId: string;
  lastMsgSenderNickName: string;
  lastMsgTitle: string;
  mainUserId: string;
  mainUserIsBlack: boolean;
  meetingSession: boolean;
  nickName: string;
  notifySession: boolean;
  sessionLogoUrl: string;
  sessionName: string;
  sessionType: 'single' | 'group';
  shieldMode: boolean;
  singleMainUser: UserInfo;
  singleSession: boolean;
  singleSubUser: UserInfo;
  subAvatarUrl: string;
  subUserId: string;
  subUserIdOfSingleSession: string;
  subUserIsConcern: boolean;
  topMode: boolean;
  topRank: boolean;
  type: 'single' | 'group';
  unReadCount: number;
  userMark: string;
  userName: string;
}

export declare type ConversationList = ConversationItem[];

export interface ConversationInfo extends ConversationItem {
  userId: string;
}
