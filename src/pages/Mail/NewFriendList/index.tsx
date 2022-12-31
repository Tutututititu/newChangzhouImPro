import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Button, message as Message } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

import { NewFriendApplyStatus } from './config';
import LayoutRightHeader from '@/components/LayoutRightHeader';
import AvatarImage from '@/components/AvatarImage';

import './style.less';

export default function () {
  const {
    sdk,
    userInfo: { userId: myUserId },
    readNewFirend,
    newFirend,
  } = useModel('global');
  const [newFriendList, setNewFriendList] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });
  const [setting, setSetting] = useState({});

  const getFriendList = async (pageIndex) => {
    let { rows, totalPage } = await sdk.queryFriendApplyListByStatus({
      pageIndex: pageIndex || 1,
    });

    console.log(rows, 'ppppp00');
    console.log(totalPage, 'totalPage');
    console.log('newFriendList====', newFriendList);

    setNewFriendList(pageIndex === 1 ? rows : [...rows, ...newFriendList]);
    setPagination({ pageIndex, totalPage });
  };

  useEffect(() => {
    getFriendList(1);
  }, []);
  useEffect(() => {
    if (newFirend) {
      getFriendList(pagination.pageIndex);
    }
  }, [newFirend]);
  useEffect(async () => {
    const setting = await sdk.querySecretConfig();
    console.log(setting, 'ppopopooo');

    setSetting(setting);
  }, []);

  useEffect(async () => {
    console.log('newFriendList=====', newFriendList);
    if (newFriendList.length) {
      let list = [];
      newFriendList.map((x) => {
        if (x?.invitedUserId) {
          list.push(x.invitedUserId);
        }
      });
      const res = await sdk.batchQueryUserInfo({
        userIds: list,
        pageIndex: 1,
        pageSize: list.length,
      });

      for (let i = 0; i < res.rows.length; i++) {
        for (let index = 0; index < newFriendList.length; index++) {
          if (res.rows[i].userId === newFriendList[index]?.invitedUserId) {
            newFriendList[index].departments = res.rows[i].departments;
          }
        }
      }
      console.log([...newFriendList]);

      setNewFriendList([...newFriendList]);
    }
  }, [pagination]);

  const queryConfig = async () => {
    const setting = await sdk.querySecretConfig();
    setSetting(setting);
  };

  useEffect(() => {
    queryConfig();
  }, []);

  const getNextData = async () => {
    await getFriendList(pagination.pageIndex + 1);
  };

  const handlePassApply = async (toUserId, invitedNo) => {
    readNewFirendFun();
    // todo: api 无请求 返回undefined
    const res = await sdk.replyAddFriendRequest({
      invitedNo,
      accept: true,
      toUserId,
    });
    if (res?.errorMessage) {
      Message.error(res?.errorMessage);
      return;
    }
    getFriendList(1);
  };

  const handleRefuse = async (toUserId, invitedNo) => {
    readNewFirendFun();
    // todo: api 无请求 返回undefined
    const res = await sdk.replyAddFriendRequest({
      invitedNo,
      accept: false,
      toUserId,
    });
    if (res?.errorMessage) {
      Message.error(res?.errorMessage);
      return;
    }
    getFriendList(1);
  };

  const readNewFirendFun = () => {
    readNewFirend();
  };

  const getExtra = (status: number | string, userInfo) => {
    console.log(status, userInfo, 'llololo');

    if (
      userInfo.originnator !== myUserId &&
      !setting?.secretConfig?.enableVerificationWhenAddMe
    ) {
      return '已添加';
    }

    switch (status) {
      case NewFriendApplyStatus.WAITING:
        return userInfo.originnator === myUserId ? (
          '等待中'
        ) : (
          <>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => handleRefuse(userInfo.userId, userInfo.invitedNo)}
            >
              拒绝
            </Button>
            <Button
              type="primary"
              onClick={() =>
                handlePassApply(userInfo.userId, userInfo.invitedNo)
              }
            >
              同意
            </Button>
          </>
        );
      case NewFriendApplyStatus.PASSED:
        return '已添加';
      case NewFriendApplyStatus.REFUSE:
        return '已拒绝';
      case NewFriendApplyStatus.EXPIRE:
        return '已过期';
    }
  };
  // const getPat = (val) => {
  //   sdk.queryUserInfoById({queryUserId: val}).then(res => {
  //     console.log(res, 'pp');
  //     return res?.departments? JSON.parse(res?.departments) : '';
  //   })

  //   // return val;
  // }
  const listPath = (val) => {
    // JSON.parse(newUseDataProps?.departments)[0].deptName
    let list = JSON.parse(val);
    if (list.length) {
      let outList = list
        .map((x) => {
          return x.deptName;
        })
        .join(' | ');
      return outList;
    }
  };

  return (
    <div className="newFriendListPage">
      <LayoutRightHeader title="新的朋友" />
      <div id="scrollableDiv" className="newFriendListPageScrollableDivb">
        <InfiniteScroll
          className="scrollH"
          dataLength={newFriendList.length}
          next={getNextData}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
          scrollableTarget="scrollableDiv"
        >
          <List split={false}>
            {newFriendList.map((item) => (
              <List.Item key={item.id} actions={[getExtra(item.status, item)]}>
                <List.Item.Meta
                  avatar={
                    <AvatarImage
                      nickName={item.nickName}
                      userName={item.userName}
                      userId={item.invitedUserId}
                      style={{ borderRadius: '8px' }}
                      src={item.avatarUrl}
                      width={42}
                      height={42}
                      fit="fill"
                    />
                  }
                  description={
                    <div className="userId">
                      {item?.departments ? listPath(item?.departments) : ''}
                    </div>
                  }
                  title={item.userName}
                />
              </List.Item>
            ))}
          </List>
        </InfiniteScroll>
      </div>
    </div>
  );
}
