import React from 'react';
import { CustomDataType } from '../../constants';
import RichText from './Custom/RichText';
import UserCard from './Custom/UserCard';
import MeetingCard from './Custom/MeetingCard';

export default function (props) {
  const { dataType } = props.msgContent;
  switch (dataType) {
    case CustomDataType.RichText:
      return <RichText {...props} />;
    case CustomDataType.UserCard:
      return <UserCard {...props} />;
    case 'meetingCard':
      return <MeetingCard {...props} />;
    default:
      return null;
  }
}
