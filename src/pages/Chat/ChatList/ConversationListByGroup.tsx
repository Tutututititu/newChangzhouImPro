// import React, { useState, useEffect } from 'react';
// import { history } from 'umi';
// // import { SwipeAction } from 'antd-mobile-v2';
// import { Toast, Checkbox, List } from 'antd-mobile';
// import moment from 'moment';
// import { observer } from "mobx-react-lite";

// import ChatInboxCard from '../../../components/ChatInboxCard';

// import './style.less';

// const ConverList = observer((props) => {
//   const { withCheckBox = false, onCheckboxGroupChange, mySdkStore } = props;
//   const [showCheckBox, setShowCheckBox] = useState(withCheckBox);
//   const [pagination, setPagination] = useState(1);
//   const [listByGroup, setListByGroup] = useState([]);

//   useEffect(() => {
//     if(mySdkStore.sdkInitOk) {
//       Toast.show({
//         icon: 'loading',
//         content: '加载中…',
//       });
//       getConverByGroup();
//     }
//   }, [mySdkStore.sdkInitOk]);

//   useEffect(() => {
//     if(mySdkStore.sdk && !showCheckBox) {
//       mySdkStore.sdk.onNewMessage = (msgs) => {
//         // console.log('onNewMessage', msgs)
//         // const lastMsg = msgs[msgs.length - 1];
//         // const { cid, msgType, msgContent, msgId } = lastMsg;
//         // setConverList((preConverList) => {
//         //   const matchIndex = preConverList.findIndex(conver => conver.cid === cid);
//         //   if(matchIndex >= 0) {
//         //     const lastMsg = resolveMsgFormContent(msgType, msgContent)
//         //     console.log('onNewMessage change lastmag>>>:', matchIndex, lastMsg);
//         //     const matchItem = preConverList[matchIndex];
//         //     const { unReadCount, bizParams } = matchItem;
//         //     preConverList[matchIndex] = {...matchItem, unReadCount: bizParams.is_default_read ? unReadCount : (unReadCount + msgs.length), lastMsgId: msgId, lastMsgContentType: msgType, lastMsg, gmtModified: new Date().valueOf() };
//         //   }
//         //   return [...preConverList];
//         // });
//       };
//       mySdkStore.sdk.onGroupInfoChange = (updateGroupRepones) => {
//         // const { cid, updateType, name, logoUrl } = updateGroupRepones
//         // setConverList((preConverList) => {
//         //   const matchIndex = preConverList.findIndex(conver => conver.cid === cid);
//         //   if(matchIndex > -1){
//         //     const matchItem = preConverList[matchIndex];
//         //     if(updateType === 'name') {
//         //       preConverList[matchIndex] = {...matchItem, name };
//         //     }else if(updateType === 'logo') {
//         //       preConverList[matchIndex] = { ...matchItem, logoUrl };
//         //     }
//         //   }
//         //   return [...preConverList];
//         // });
//         // console.log('onGroupInfoChange>>>: ', updateGroupRepones);
//       };
//       mySdkStore.sdk.onConverChange = (converChangeRepones) => {
//         // console.log('onConverChange>>>: ', converChangeRepones);
//         // setPageIndex(1);
//         // setConverList([]);
//         // getConver();
//       };
//     }
//   }, [mySdkStore.sdk])

//   const getConverByGroup = async() => {
//     const groupList = await mySdkStore.sdk.queryConversationGroups();
//     groupList.map(async item => {
//       const { list: converList } = await mySdkStore.sdk.queryConversationListByGroup({ groupId: item.id, pageIndex: 1, pageSize: 3 });
//       return {...item, converList}
//     });
//     console.log(groupList)
//     setListByGroup(groupList);
//   }

//   const toChatPage = (cid) => history.push({pathname: `/chatDetail/${cid}`, search: `?debug=true` })

//   const handleShowSingleGroupList = () => {

//   }

//   return (<>
//     { listByGroup.map(item => <List key={item.id} style={{ '--border-bottom': 0 }}>
//       <List.Item key="title" onClick={handleShowSingleGroupList}>{item.groupName}</List.Item>
//       { (item.converList || []).map(subItem =>
//         <SwipeAction
//           style={{ backgroundColor: 'gray' }}
//           autoClose
//           right={[
//             {
//               text: '置顶',
//               onPress: () => console.log('cancel'),
//               style: { backgroundColor: '#017FFF', color: 'white' },
//             },
//             {
//               text: '移除',
//               onPress: () => console.log('移除'),
//               style: { backgroundColor: '#F4333C', color: 'white' },
//             },
//           ]}
//         >
//       <List.Item key={item.cid}>
//         <ChatInboxCard
//           onCardClicked={showCheckBox ? null : () => toChatPage(item.cid)}
//           {...subItem}
//           withCheckBox={showCheckBox}
//           isDefaultRead={item.bizParams?.is_default_read}
//           />
//       </List.Item>
//       </SwipeAction>)}
//     </List>) }
//     </>)
// })

// export default ConverList;

export default () => {};
