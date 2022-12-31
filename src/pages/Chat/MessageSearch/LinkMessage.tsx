import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Divider, message as Message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import moment from 'moment';
import copy from 'copy-text-to-clipboard';
import InfiniteScroll from 'react-infinite-scroll-component';

import AvatarImage from '../../../components/AvatarImage';

import { MessageInSearchResult } from '@/typings/chat';

import './style.less';

interface Props {
  cid: string;
  keyword: string;
}

export default function (props: Props) {
  const { sdk } = useModel('global');
  const { cid, keyword } = props;
  const [result, setResult] = useState<MessageInSearchResult[]>([]);
  const [pagination, setPagination] = useState({ current: 1, totalPage: 1 });

  const handleSearch = async (pageIndex = 1) => {
    const { rows, totalPage } = await sdk.searchMessage({
      resourceType: 'url',
      searchKey: keyword,
      pageIndex,
      sessionIds: [cid],
    });
    setResult(pageIndex === 1 ? rows : [...result, ...rows]);

    setPagination({ current: pageIndex, totalPage });
  };

  const getNextData = async () => {
    await handleSearch(pagination.current + 1);
  };

  useEffect(() => {
    handleSearch(1);
  }, [keyword]);

  const handleCopy = (link: string) => {
    copy(link);
    Message.success('复制成功');
  };

  return (
    <div className="searchMessageLinkPage" id="scrollableDiv">
      <InfiniteScroll
        dataLength={result.length}
        next={getNextData}
        hasMore={pagination.current < pagination.totalPage}
        loader={'加载中...'}
        endMessage={<Divider plain>没有更多了</Divider>}
        scrollableTarget="scrollableDiv"
      >
        <List>
          {result.map((item) => {
            return (
              <List.Item key={item.msgId}>
                <List.Item.Meta
                  avatar={
                    <AvatarImage
                      src={item.from.avatarUrl}
                      nickName={item.from?.nickName}
                      userName={item.from?.userName}
                      userId={item.from?.userId}
                      style={{ borderRadius: 8 }}
                      fit="cover"
                      width={40}
                      height={40}
                    />
                  }
                  title={moment(item.timestamp).format('HH:mm')}
                  description={
                    <div className="linkBox">
                      <a
                        href={item.msgContent?.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.msgContent?.title}
                      </a>
                      <CopyOutlined
                        onClick={() => handleCopy(item.msgContent?.href || '')}
                        style={{ marginLeft: 12 }}
                      />
                    </div>
                  }
                />
              </List.Item>
            );
          })}
        </List>
      </InfiniteScroll>
    </div>
  );
}
