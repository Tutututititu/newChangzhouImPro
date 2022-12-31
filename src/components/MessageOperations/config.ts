import { ContentType } from '../../constants';

export const defaultEnableOperate = {
  canEmoji: true,
  canStrongReminder: true,
  canCopy: true,
  canTransfer: true,
  canReply: true,
  canCollect: true,
  canLater: true,
  canRecall: true,
  canMultiSelect: true,
  canSecretSend: true,
  canStayTop: true,
  canDelete: true
}

export const MessageTypeCanOperate = {
  [ContentType.Rtc]: {
    canEmoji: false,
    canStrongReminder: false,
    canCopy: false,
    canTransfer: false,
    canReply: false,
    canCollect: false,
    canLater: false,
    canRecall: false,
    canMultiSelect: false,
    canSecretSend: false,
    canStayTop: false,
    canDelete: true,
  },
  [ContentType.Custom]: {
    canEmoji: false,
    canStrongReminder: false,
    canReply: false,
    canStayTop: false,
  },
  [ContentType.StrongReminder]: {
    canStrongReminder: false,
  },
  [ContentType.Merged]: {
    canEmoji: false,
    canStrongReminder: false,
    canReply: false,
    canCollect: false,
    canStayTop: false,
    canDelete: false,
  },
  [ContentType.Voice]: {
    canEmoji: false,
    canTransfer: true,
    canReply: false,
    canCollect: false,
    canStayTop: false,
  },
}