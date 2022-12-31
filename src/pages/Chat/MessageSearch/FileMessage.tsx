import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Divider } from 'antd';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';

import FileIcon from '@/components/FileIcon';
import { transferFileSize } from '@/utils';

import { MessageInSearchResult } from '@/typings/chat';

import './style.less';

interface Props {
  cid: string;
  keyword: string;
}

export default function (props: Props) {
  console.log(props, '0-0-00-');

  const { sdk } = useModel('global');
  const { cid, keyword } = props;
  const [result, setResult] = useState<MessageInSearchResult[]>([]);
  const [pagination, setPagination] = useState({ current: 1, totalPage: 1 });

  const handleSearch = async (pageIndex = 1) => {
    const { rows, totalPage } = await sdk.searchMessage({
      searchKey: keyword,
      resourceType: 'file',
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
  }, []);

  const handleDownload = (item) => {
    const docA = document.createElement('a');
    docA.setAttribute('href', item.url);
    docA.setAttribute('download', item.fileName);
    docA.setAttribute('target', '_blank');
    docA.click();
  };

  return (
    <div className="searchMessageFilePage" id="scrollableDiv">
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
              <List.Item
                key={item.msgId}
                onClick={() => handleDownload(item.msgContent)}
              >
                <List.Item.Meta
                  avatar={<FileIcon type={item.msgContent?.type} />}
                  title={
                    <>
                      {transferFileSize(item.msgContent?.size)}{' '}
                      {item.from?.nickName}{' '}
                      {moment(item.timestamp).format('YYYY-MM-DD HH:mm')} 创建
                    </>
                  }
                  description={
                    <div
                      className="searchContent"
                      dangerouslySetInnerHTML={{ __html: item.searchContent }}
                    ></div>
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
