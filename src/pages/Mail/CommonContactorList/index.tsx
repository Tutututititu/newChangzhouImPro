import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Popover } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '@/components/AvatarImage';
import LayoutRightHeader from '@/components/LayoutRightHeader';
import UserInfoModal from '@/components/UserInfoModal';

import './style.less';

export default function () {
  const { sdk } = useModel('global');
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });
  const [list, setList] = useState([]);

  const getMailList = (pageIndex: number) => {
    sdk.queryCommonlyUsedContact({ pageIndex }).then(({ rows, totalPage }) => {
      setPagination({ pageIndex, totalPage });
      let listR = rows;
      listR.forEach((x, i, self) => {
        if (x?.departments) {
          let list = JSON.parse(x?.departments);
          if (list.length) {
            let outList = list
              .map((x) => {
                return x.deptName;
              })
              .join(' | ');
            self[i].deptName = outList;
          }
          // self[i].deptName = JSON.parse(x?.departments)[0].deptName;
        }
      });
      console.log(listR, 'pp');

      setList(listR);
    });
  };

  const getNextData = async () => {
    await getMailList(pagination.pageIndex + 1);
  };

  useEffect(() => {
    getMailList(1);
  }, []);

  return (
    <div className="commonContactorListPage">
      <LayoutRightHeader title="常用联系人" />
      <div id="scrollableDiv" className="commonContactorListPageScrollableDiv">
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
                <List.Item key={item.userId}>
                  <Popover
                    destroyTooltipOnHide
                    trigger={'click'}
                    placement="topLeft"
                    overlayClassName="userInfoPopover"
                    content={<UserInfoModal userId={item.userId} />}
                  >
                    <List.Item.Meta
                      avatar={
                        <AvatarImage
                          src={item.avatarUrl}
                          style={{ borderRadius: 8 }}
                          fit="cover"
                          width={42}
                          height={42}
                          nickName={item.nickName}
                          userName={item.userName}
                          userId={item.userId}
                        />
                      }
                      title={item.userName}
                      description={<>{item?.deptName ? item?.deptName : ''}</>}
                    />
                  </Popover>
                </List.Item>
              );
            })}
          </List>
        </InfiniteScroll>
      </div>
    </div>
  );
}
