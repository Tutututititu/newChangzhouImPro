import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from 'react';
import { useModel } from 'umi';
import { List, Popover } from 'antd';
import { pinyin } from 'pinyin-pro';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '@/components/AvatarImage';
import LayoutRightHeader from '@/components/LayoutRightHeader';
import UserInfoModal from '@/components/UserInfoModal';

import './style.less';
import axios from 'axios';
const OrganizationalList = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    toChangeOrganizational,
  }));
  const { organizationalData } = props;
  const charCodeOfA = 'A'.charCodeAt(0);
  const toChangeOrganizational = () => {
    getList(1);
  };
  const groupsKey = {};
  Array(27)
    .fill('')
    .forEach((_, i) => {
      // @ts-ignore
      groupsKey[i === 26 ? '#' : String.fromCharCode(charCodeOfA + i)] = [];
    });

  const mapToArray = (map: { [x: string]: any }) => {
    return Object.keys(map)
      .filter((key) => map[key]?.length)
      .map((title) => ({
        title,
        items: map[title],
      }));
  };
  const { sdk } = useModel('global');
  const [pagination, setPagination] = useState({ pageIndex: 1, totalPage: 1 });
  const [group, setGroup] = useState(mapToArray(groupsKey));

  const getList = (pageIndex: number) => {
    let urlTitle = window.location.protocol;
    axios
      .get(
        `/api/gov/cz/dept/users?orgId=${organizationalData.deptId}&pageIndex=${pageIndex}&pageSize=100`,
        // `/api/gov/cz/dept/users?orgId=${organizationalData.deptId}&pageIndex=${pageIndex}&pageSize=100`,
      )
      .then((res) => {
        let data = res.data.data;
        console.log('data====', data);
        let rows = data && data.rows ? data.rows : [];
        let totalPage = Number(data && data.totalPage ? data.totalPage : 0);
        setPagination({ pageIndex, totalPage });
        rows.forEach((item) => {
          let name = item.userName || item.nickName;
          name = name.replace(/\s*/g, '');
          const letters = pinyin(name, { toneType: 'none' });
          const code = (letters[0]?.[0]?.[0] || '').toUpperCase();
          if (groupsKey[code]) {
            groupsKey[code].push(item);
          } else {
            groupsKey['#'].push(item);
          }
        });
        console.log('groupsKey===', groupsKey);
        setGroup(mapToArray(groupsKey));
      });
  };
  const getNextData = async () => {
    await getList(pagination.pageIndex + 1);
  };

  return (
    <div className="organizationalPage">
      <div className="organizational">
        <div className="organizationalIcon">
          <img src={require('../../../assets/apartment.png')} alt="" />
        </div>
        <LayoutRightHeader title="组织架构" />
      </div>
      <div id="scrollableDiv" className="organizationalPageScrollableDiv">
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
                      <List.Item.Meta
                        avatar={
                          <Popover
                            destroyTooltipOnHide
                            trigger={'click'}
                            placement="topLeft"
                            overlayClassName="userInfoPopover"
                            content={<UserInfoModal userId={item.userId} />}
                          >
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
                          </Popover>
                        }
                        description={
                          <>
                            {item?.departments
                              ? item?.departments[0].deptName
                              : ''}
                          </>
                        }
                        title={item.userName}
                      />
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
});
export default OrganizationalList;
