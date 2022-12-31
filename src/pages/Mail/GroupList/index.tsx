import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '@/components/AvatarImage';
import LayoutRightHeader from '@/components/LayoutRightHeader';

import './style.less';

export default function () {
  const { sdk, setPagePath } = useModel('global');
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });

  const getList = async (pageIndex) => {
    const res = await sdk.queryConversationList({
      pageIndex,
      pageSize: 40,
      type: 'group',
    });
    const { list: rows, totalPage } = res;
    setPagination({ pageIndex, totalPage });
    console.log(list, rows, '==');
    let inSetList;
    try {
      if (pageIndex === 1) {
        inSetList = rows.sort((a, b) => {
          console.log(a);

          return a.lastMsgSendTime > b.lastMsgSendTime;
        });
      } else {
        inSetList = [...list, ...rows].sort((a, b) => {
          return a?.lastMsgSendTime > b?.lastMsgSendTime;
        });
      }
    } catch (e) {
      console.log(e);
    }
    setList(inSetList);
  };

  const getNextData = async () => {
    await getList(pagination.pageIndex + 1);
  };

  useEffect(() => {
    getList(1);
  }, []);

  return (
    <div className="groupListPage">
      <LayoutRightHeader title="我的群组" />
      <div id="scrollableDiv" className="groupListPageScrollableDiv">
        <InfiniteScroll
          dataLength={list.length}
          next={getNextData}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
          scrollableTarget="scrollableDiv"
        >
          <List split={false}>
            {list.map((item) => {
              return (
                <List.Item
                  className="groupListItem"
                  key={item.cid}
                  onClick={() =>
                    setPagePath({ activeIcon: 'chat', cid: item.cid })
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <AvatarImage
                        src={item.sessionLogoUrl}
                        style={{ borderRadius: 8 }}
                        fit="cover"
                        width={42}
                        height={42}
                        groupName={item.name}
                      />
                    }
                    description={`${item.memberCount}人`}
                    title={item.name}
                  />
                </List.Item>
              );
            })}
          </List>
        </InfiniteScroll>
      </div>
    </div>
  );
}
