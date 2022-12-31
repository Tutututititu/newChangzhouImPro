import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import { useModel } from 'umi';
import { Input, Popover, List } from 'antd';
import { SoundOutlined, CloseOutlined } from '@ant-design/icons';
// import { debounce } from 'lodash';

import ChatListNavBar from '@/components/ChatListNavBar';
import ConversationList from './ConversationList';
// import ConversationListByGroup from './ConversationListByGroup';
// import AddUserModal from './AddUserModal';
// import SelectSingleMember from '@/components/SelectSingleMember';
// import SelecteGroupMember from '@/components/SelecteGroupMember';
// import GlobalSearch from '../GlobalSearch';
// import MeetingBlack from '@/components/meetingBlackboard';

import './style.less';
const ConverList = forwardRef((props, ref) => {
  const conversationRef = useRef(null);
  useImperativeHandle(ref, () => ({
    toChangeGroupName,
  }));
  const { mySdkStore, userInfo } = useModel('global');
  const {
    meetJoinTip,
    setMeetJoinTip,
    roomId,
    roomToken,
    setRole,
    setVisible,
    inMeetingType,
    setInMeetingType,
  } = useModel('meetingModal');
  const toChangeGroupName = () => {
    conversationRef.current && conversationRef.current.toChangeGroupName();
  };
  // const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  // const [selectSingleMemberVisible, setSelectSingleMemberVisible] =
  //   useState(false);
  // const [
  //   createGroupConversationModalVisible,
  //   setCreateGroupConversationModalVisible,
  // ] = useState(false);
  // const [globalSearchProps, setGlobalSearchProps] = useState({
  //   visible: false,
  //   keyword: '',
  // });
  // const [createMeeting, setCreateMeeting] = useState(false);

  // const handleAddUser = () => {
  //   setAddUserModalVisible(true);
  // };

  // const handleCreateGroupConversation = () => {
  //   setCreateGroupConversationModalVisible(true);
  // };

  // const handleCreateConversation = () => {
  //   setSelectSingleMemberVisible(true);
  // };

  // const handleCreateMeeting = () => {
  //   setCreateMeeting(true);
  // };

  // const handleCreateMeeting = () => {
  //   history.push({ pathname: `/createMeeting` });
  // }

  // const handleCreateChattingRoom = () => {

  // }

  // const handleCreateSecretConversation = () => {

  // }

  // const createPopoverItem = [
  //   {
  //     key: 'addUser',
  //     icon: <UserAddOutlined style={{ marginRight: 15 }} />,
  //     text: '添加好友',
  //     handler: handleAddUser,
  //   },
  //   {
  //     key: 'createConversation',
  //     icon: <UserOutlined style={{ marginRight: 15 }} />,
  //     text: '发起单聊',
  //     handler: handleCreateConversation,
  //   },
  //   {
  //     key: 'createGroupConversation',
  //     icon: <UsergroupAddOutlined style={{ marginRight: 15 }} />,
  //     text: '发起群聊',
  //     handler: handleCreateGroupConversation,
  //   },
  //   {
  //     key: 'createMeeting',
  //     icon: <VideoCameraOutlined style={{ marginRight: 15 }} />,
  //     text: '发起会议',
  //     handler: handleCreateMeeting,
  //   },
  //   {
  //     key: 'makeMeeting',
  //     icon: <VideoCameraAddOutlined style={{ marginRight: 15 }} />,
  //     text: '预约会议',
  //   },
  //   {
  //     key: 'joinMeeting',
  //     icon: <PlusSquareOutlined style={{ marginRight: 15 }} />,
  //     text: '加入会议',
  //   },
  //   // { key: 'createChattingRoom', icon: <DesktopOutlined style={{ marginRight: 15 }} />, text: '创建聊天室', },
  //   // { key: 'createSecretConversation', icon: <LockOutlined style={{ marginRight: 15 }} />, text: '发起密聊' },
  // ];

  // const plusMemu = (
  //   <List split={false}>
  //     {createPopoverItem.map((item) => (
  //       <List.Item key={item.key} onClick={item.handler}>
  //         {item.icon}
  //         {item.text}
  //       </List.Item>
  //     ))}
  //   </List>
  // );

  // const handleSearch = (e) => {
  //   const value = e.target.value;
  //   setGlobalSearchProps({ visible: !!value, keyword: value });
  // };

  // const handleSearchWithDebounce = debounce(handleSearch, 200);
  const closeMeeting = () => {
    setMeetJoinTip(false);
  };
  const joinRoom = () => {
    setMeetJoinTip(false);
    setRole('callee');
    setInMeetingType('add');
    setVisible(true);
  };
  return (
    <div className="chatListPage">
      <div className="converContent">
        {meetJoinTip && (
          <div className="conMeeting">
            <div className="leftMeeting" onClick={joinRoom}>
              <SoundOutlined />
              […] 正在进行，点击加入
            </div>
            <CloseOutlined className="closeMeeting" onClick={closeMeeting} />
          </div>
        )}
        <div className="topWrapper">
          {/* <div className="inputWrapper">
            {!mySdkStore.isHideSomeFunctions && (
              <Input
                placeholder="搜索"
                prefix={<SearchOutlined />}
                className="searchBar"
                onChange={handleSearchWithDebounce}
              />
            )}
            <Popover
              placement="topRight"
              title={null}
              overlayClassName="plusMemuList"
              content={plusMemu}
              trigger="click"
            >
              <PlusCircleOutlined
                style={{ marginLeft: 7, fontSize: '22px', cursor: 'pointer' }}
              />
            </Popover>
          </div> */}
          {mySdkStore.isHideSomeFunctions ? null : <ChatListNavBar />}
        </div>
        <ConversationList ref={conversationRef} {...props} />
        {/* <ConversationListByGroup {...props} /> */}
      </div>
      {/* {addUserModalVisible && (
        <AddUserModal onClose={() => setAddUserModalVisible(false)} />
      )}
      {selectSingleMemberVisible && (
        <SelectSingleMember
          onClose={() => setSelectSingleMemberVisible(false)}
        />
      )}
      {createGroupConversationModalVisible && (
        <SelecteGroupMember
          type="create"
          onClose={() => setCreateGroupConversationModalVisible(false)}
        />
      )}
      {globalSearchProps.visible && (
        <GlobalSearch
          {...globalSearchProps}
          onClose={() => setGlobalSearchProps({ visible: false, keyword: '' })}
        />
      )}
      {createMeeting && (
        <MeetingBlack
          userInfo={userInfo}
          setCreateMeeting={setCreateMeeting}
        ></MeetingBlack>
      )} */}
    </div>
  );
});
export default ConverList;
