export const COOKIE_USER_KEY = 'IM_userId';
export const COOKIE_APPID_KEY = 'IM_appId';

export const ContentType = {
  Text: 'text',
  Image: 'image',
  File: 'file',
  Rtc: 'rtc',
  Video: 'video',
  Voice: 'voice',
  Custom: 'custom',
  Url: 'url',
  Face: 'face',
  Merged: 'merged',
  StrongReminder: 'strong_reminder',
  Location: 'location',
};

export const ChangeMessagesStatus = {
  Recall: 'recall',
  Read: 'read',
  Delete: 'delete',
  Later: 'later',
};

export const MessageDataChangeType = {
  AddInstantReplyFace: 'addInstantReplyFace',
  RecallInstantReplyFace: 'recallInstantReplyFace',
};

export const StrongRemainderReplyContent = ['收到', 'OK', '马上就到'];

export const CustomDataType = {
  ImageBase64Url: 'ImageBase64Url',
  RichText: 'RichText',
  Instruction: 'Instruction',
  UserCard: 'UserCard',
};

export const ConversationType = {
  Single: 'single',
  Group: 'group',
  Notify: 'notify',
};

export const MsgTypeMap = {
  1: 'TEXT',
  2: 'IMAGE',
  3: 'VOICE',
  4: 'VIDEO',
  5: 'RTC',
  6: 'FACE',
  7: 'LOCATION',
  8: 'URL',
  9: 'CARD',
  10: 'FILE',
  11: 'CUSTOM',
  12: '',
  13: 'MERGED',
  14: '',
  15: 'STRONG_REMINDER',
};

export const RtcAction = {
  Invite: 'invite',
  HangUp: 'hangUp',
  RejectInvite: 'rejectInvite',
  AcceptInvite: 'acceptInvite',
  ReceiveInvite: 'receiveInvite',
};
