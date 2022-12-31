import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Image, List, Divider } from 'antd';
import moment from 'moment';

import InfiniteScroll from 'react-infinite-scroll-component';

import { MessageInSearchResult } from '@/typings/chat';

import './style.less';

interface PicMsgMap {
  [timeString: string]: MessageInSearchResult[];
}

const formatResult = (rows: MessageInSearchResult[]) => {
  const map: PicMsgMap = {};

  rows.forEach((item) => {
    const timeString = moment(item.timestamp).format('YYYY年MM月');
    if (map[timeString]) {
      map[timeString].push(item);
    } else {
      map[timeString] = [item];
    }
  });

  return map;
};

interface Props {
  cid: string;
  keyword: string;
}

export default function (props: Props) {
  const { sdk } = useModel('global');
  const { cid, keyword } = props;
  const [result, setResult] = useState<PicMsgMap>({});
  const [pagination, setPagination] = useState({ current: 1, totalPage: 1 });

  const handleSearch = async (pageIndex = 1) => {
    const { rows, totalPage } = await sdk.searchMessage({
      resourceType: 'image_video',
      searchKey: keyword,
      pageIndex,
      sessionIds: [cid],
    });
    console.log(rows, '[]oookl');

    const formattedResult = formatResult(rows);
    setResult(
      pageIndex === 1 ? formattedResult : { ...result, ...formattedResult },
    );

    setPagination({ current: pageIndex, totalPage });
  };

  const getNextData = async () => {
    await handleSearch(pagination.current + 1);
  };

  useEffect(() => {
    handleSearch(1);
  }, []);

  return (
    <div className="searchMessagePicturePage" id="scrollableDiv">
      <InfiniteScroll
        dataLength={50}
        next={getNextData}
        hasMore={pagination.current < pagination.totalPage}
        loader={'加载中...'}
        endMessage={<Divider plain>没有更多了</Divider>}
        scrollableTarget="scrollableDiv"
      >
        {Object.keys(result).map((timeString) => (
          <div className="speratorBox" key={timeString}>
            <div className="speratorTime">{timeString}</div>
            <List
              className="speratorList"
              grid={{ gutter: 16, column: 5 }}
              dataSource={result[timeString]}
              renderItem={(item) => (
                <List.Item>
                  {item.msgContent?.pic ? (
                    <Image src={item.msgContent?.pic} />
                  ) : item?.msgType == 'video' ? (
                    <video
                      width="100%"
                      height="100%"
                      src={item.msgContent?.url}
                      controls
                    />
                  ) : null}
                </List.Item>
              )}
            />
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
