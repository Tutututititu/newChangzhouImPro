import React from 'react';
import { Badge } from 'antd';
import styled from 'styled-components';
import Multiavatar from './Multiavatar';
import AvatarImage from '@/components/AvatarImage';

const StyledChatAvatarContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
`;

class ChatAvatar extends React.PureComponent {
  render() {
    const { avatar, type, name } = this.props;
    const defaultImageTextProps = {
      [type === 'group' ? 'groupName' : 'userName']: name,
    };

    return (
      <StyledChatAvatarContainer>
        <Badge dot>
          <AvatarImage
            {...defaultImageTextProps}
            src={avatar}
            alt="头像"
            width={42}
            height={42}
            style={{ borderRadius: 8 }}
          />
        </Badge>
      </StyledChatAvatarContainer>
    );
  }
}

export default ChatAvatar;
