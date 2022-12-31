import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Popover } from 'antd';
import { pinyin } from 'pinyin-pro';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '@/components/AvatarImage';
import LayoutRightHeader from '@/components/LayoutRightHeader';
import UserInfoModal from '@/components/UserInfoModal';

import './style.less';

export default function () {
  const charCodeOfA = 'A'.charCodeAt(0);
  const groupsKey = {};
  Array(27)
    .fill('')
    .forEach((_, i) => {
      groupsKey[i === 26 ? '#' : String.fromCharCode(charCodeOfA + i)] = [];
    });

  const mapToArray = (map) => {
    let c = Object.keys(map)
      .filter((key) => map[key]?.length)
      .map((title) => ({
        title,
        items: map[title],
      }));
    c.forEach((x) => {
      x.items.sort(function (a, b) {
        return a?.nickName.localeCompare(b?.nickName);
      });
    });
    return c;
    // return Object.keys(map)
    //   .filter((key) => map[key]?.length)
    //   .map((title) => ({
    //     title,
    //     items: map[title],
    //   }));
  };

  const { sdk } = useModel('global');
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });
  const [group, setGroup] = useState(mapToArray(groupsKey));

  const getList = (pageIndex: number) => {
    sdk
      .queryFriend({ pageIndex, pageSize: 150 })
      .then(({ rows, totalPage }) => {
        setPagination({ pageIndex, totalPage });
        rows.forEach((item) => {
          const name = item.userName || item.nickName;
          const letters = pinyin(name, { toneType: 'none' });
          const code = (letters[0]?.[0]?.[0] || '').toUpperCase();
          if (groupsKey[code]) {
            groupsKey[code].push(item);
          } else {
            groupsKey['#'].push(item);
          }
        });
        console.log(mapToArray(groupsKey), 'iiiii');

        setGroup(mapToArray(groupsKey));
      });
  };

  const getNextData = async () => {
    await getList(pagination.pageIndex + 1);
  };

  useEffect(() => {
    getList(1);
  }, []);

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
    <div className="friendListPage">
      <LayoutRightHeader title="我的好友" />
      <div id="scrollableDiv" className="friendListPageScrollableDiv">
        <InfiniteScroll
          dataLength={group.length}
          next={getNextData}
          hasMore={pagination.totalPage > pagination.pageIndex}
          loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
          scrollableTarget="scrollableDiv"
        >
          {group.map((g) => {
            const { title, items } = g;
            return (
              <List split={false} key={title} header={title}>
                {items.map((item) => {
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
                          description={
                            <>
                              {item?.departments
                                ? listPath(item?.departments)
                                : ''}
                            </>
                          }
                          title={item.userName}
                        />
                      </Popover>
                    </List.Item>
                  );
                })}
              </List>
            );
          })}
        </InfiniteScroll>
      </div>
    </div>
  );
}
