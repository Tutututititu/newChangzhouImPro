import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Divider, Image } from 'antd';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '../../../components/AvatarImage';

import { MessageInSearchResult } from '@/typings/chat';

import './style.less';

interface Props {
  cid: string;
  keyword: string;
}

export default function (props: Props) {
  const { cid, keyword } = props;
  const { sdk } = useModel('global');
  const [result, setResult] = useState<MessageInSearchResult[]>([]);
  const [pagination, setPagination] = useState({ current: 1, totalPage: 1 });

  const handleSearch = async (pageIndex = 1) => {
    try {
      const { rows, totalPage } = await sdk.searchMessage({
        searchKey: keyword,
        pageIndex,
        pageSize: 50,
        sessionIds: [cid],
      });
      console.log(rows, '---------');

      setResult(pageIndex === 1 ? rows : [...result, ...rows]);

      setPagination({ current: pageIndex, totalPage });
    } catch (e: any) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleSearch(1);
  }, [keyword]);

  const getNextData = async () => {
    console.log(pagination.current, pagination.totalPage);
    await handleSearch(pagination.current + 1);
  };

  return (
    <div className="searchMessageContentPage" id="scrollableDiv">
      <InfiniteScroll
        height={480}
        dataLength={result.length}
        next={getNextData}
        hasMore={pagination.current < pagination.totalPage}
        loader={'加载中...'}
        endMessage={<Divider plain>没有更多了</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List>
          {result.map((item) => (
            <List.Item key={item.msgId}>
              <List.Item.Meta
                avatar={
                  <AvatarImage
                    style={{ borderRadius: '8' }}
                    src={item.from?.avatarUrl}
                    nickName={item.from?.nickName}
                    userName={item.from?.userName}
                    userId={item.from?.userId}
                    width={42}
                    height={42}
                    fit="fill"
                  />
                }
                title={
                  <div className="userinfoBar">
                    {item.from.nickName}
                    <span className="time">
                      {moment(item.timestamp).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                }
                description={
                  item.msgContent?.pic ? (
                    <Image src={item.msgContent?.pic} />
                  ) : item.msgContent.iconUrl ? (
                    <Image
                      src={item.msgContent.iconUrl}
                      className={'historyIcon'}
                    />
                  ) : (
                    // <div
                    //   className="userMessage searchContent"
                    //   dangerouslySetInnerHTML={{
                    //     __html: item.searchContent,
                    //   }}
                    // />
                    <div
                      className="searchContent"
                      dangerouslySetInnerHTML={{
                        __html:
                          item.searchContent || item?.msgContent?.msgTitle,
                      }}
                    ></div>
                  )
                }
              />
            </List.Item>
          ))}
        </List>
      </InfiniteScroll>
    </div>
  );
}
