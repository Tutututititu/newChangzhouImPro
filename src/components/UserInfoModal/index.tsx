import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { List, Button, Tag, Spin, message as Message } from 'antd';
import { CopyOutlined, PlusOutlined } from '@ant-design/icons';
import copy from 'copy-text-to-clipboard';

import TagModal from '@/components/TagModal';
import AvatarImage from '@/components/AvatarImage';

import './style.less';

import { UserInfo, TagList } from '@/typings/global';

interface Props {
  userId: string;
}

export default function (props: Props) {
  const { userId } = props;
  const {
    sdk,
    userInfo: { userId: myUserId },
    mySdkStore,
    setPagePath,
  } = useModel('global');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tags, setTags] = useState<TagList>([]);

  const fetchUserInfo = async () => {
    const info = await sdk.queryUserInfoById({ queryUserId: userId });
    if (!info) {
      Message.error('用户不存在');
      return;
    }

    setUserInfo(info);
    if (
      info?.userExtraPropertyVO &&
      Object.keys(info.userExtraPropertyVO).length
    ) {
      const allTags: TagList = await sdk.queryFavoriteTags();
      const userTags = allTags.filter(
        (item) => info.userExtraPropertyVO[item.code] === 'true',
      );
      setTags(userTags);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const filterTagList = (list: TagList) => {
    return list.filter(({ code }) =>
      userInfo?.userExtraPropertyVO
        ? userInfo?.userExtraPropertyVO[code] === 'false'
        : true,
    );
  };

  const addConcern = async () => {
    await sdk.addUserConcern({ relUserId: userId, userId: myUserId });
    Message.success('添加关注成功');
    setUserInfo(userInfo ? { ...userInfo, isConcern: true } : null);
  };

  const removeConcern = async () => {
    await sdk.removeUserConcern({ relUserId: userId, userId: myUserId });
    Message.success('已取消关注');
    setUserInfo(userInfo ? { ...userInfo, isConcern: false } : null);
  };

  const handleCreateConversation = async () => {
    // 似乎不需要了, 回显的都是同组织架构下的
    // if (!userInfo?.isGoodFriend) {
    //   if (userInfo?.departments) {
    //     try {
    //       const res = await sdk.queryUserInfoById({ queryUserId: myUserId });
    //       if (res?.departments) {
    //         if (
    //           JSON.parse(res.departments)[0].deptId !==
    //           JSON.parse(res.departments)[0].deptId
    //         ) {
    //           return Message.error('非同组织架构下,不允许直接聊天');
    //         }
    //       } else {
    //         return Message.error('非同组织架构下,不允许直接聊天');
    //       }
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   } else {
    //     return Message.error('非同组织架构下,不允许直接聊天');
    //   }
    // }

    sdk.createConversation({ type: 'single', subUserId: userId }).then(
      (data) => {
        setPagePath({ activeIcon: 'chat', cid: data.cid });
      },
      () => {
        Message.success({
          icon: 'fail',
          content: '操作失败',
        });
      },
    );
  };

  const copyUserId = (e) => {
    copy(userId);
    Message.success('复制成功');
    e.stopPropagation();
  };

  const handleAddTagOk = async (tagCodes: string[], allTagInfos: TagList) => {
    try {
      const modifiedTags = tags.map(({ code }) => code).concat(tagCodes);
      const tagString = [...tags, ...allTagInfos]
        .map((item) => item.name)
        .join(',');
      await sdk.collectUser({ targetUserId: userId, tagCodes: modifiedTags });
      await sdk.updateGoodFriendRelationInfo({
        invitedUserId: userId,
        updateType: 'TAG',
        tag: tagString,
      });
      setTags([...tags, ...allTagInfos]);
      Message.success('设置成功');
      setTagModalVisible(false);
    } catch (e) {
      Message.error('操作失败');
      console.log(e);
    }
  };
  const handleRtc = async () => {};
  const handleDeleteTag = async (tagCode: string) => {
    // 删除标签没对接正确的接口
    try {
      const modifiedTags = tags.filter(({ code }) => code !== tagCode);
      const tagString = modifiedTags.map((item) => item.name).join(',');
      await sdk.collectUser({ targetUserId: userId, tagCodes: modifiedTags });
      await sdk.updateGoodFriendRelationInfo({
        invitedUserId: userId,
        updateType: 'TAG',
        tag: tagString,
      });
      setTags(modifiedTags);
      Message.success('标签已删除');
    } catch (e) {
      Message.error('操作失败');
      console.log(e);
    }
  };

  return !userInfo ? (
    <Spin />
  ) : (
    <div className="userInfoPage">
      <List>
        <List.Item>
          <List.Item.Meta
            avatar={
              <AvatarImage
                nickName={userInfo.nickName}
                userName={userInfo.userName}
                userId={userId}
                style={{ borderRadius: '12px' }}
                src={userInfo.avatarUrl}
                width={60}
                height={60}
                fit="fill"
              />
            }
            title={
              <div className="userName">
                {userInfo.userName}
                {userInfo.isConcern ? (
                  <Button
                    size="small"
                    className="userOperateBtn"
                    onClick={removeConcern}
                  >
                    取消关注
                  </Button>
                ) : (
                  <Button
                    size="small"
                    className="userOperateBtn"
                    type="primary"
                    onClick={addConcern}
                  >
                    关注
                  </Button>
                )}
              </div>
            }
            description={
              <div className="userId">
                {/* {'ID:' + userId}{' '} */}
                {/* <CopyOutlined
                  style={{ color: '#1890FF' }}
                  onClick={copyUserId}
                /> */}
              </div>
            }
          />
        </List.Item>
      </List>
      {/* <div className="sloganArea">
      <div className="sloganLabel">
        个性签名
      </div>
      <div className="slogen">
        todo: 没有字段
      </div>
    </div> */}
      {
        !mySdkStore.isHideSomeFunctions && (
          <>
            {/* <div className="tagTitle">标签</div> */}
            {/* <div className="tagBar">
              {tags.map((tag) => (
                <Tag
                  key={tag.code}
                  closable
                  onClose={() => handleDeleteTag(tag.code)}
                  style={{ marginBottom: 8 }}
                >
                  {tag.name}
                </Tag>
              ))}
              <Tag
                className="siteTagPlus"
                style={{ marginBottom: 8 }}
                key="delete"
                onClick={() => setTagModalVisible(true)}
              >
                <PlusOutlined /> 添加
              </Tag>
            </div> */}
          </>
        )

        // <List style={{ margin: '12px 0 20px'}}>
        //   <List.Item extra={ userInfo.goodFriendTag || '未设置' } onClick={handleCollect}>
        //     标签
        //   </List.Item>
        // </List>
      }
      <Button
        block
        size="large"
        type="primary"
        style={{ marginBottom: 12, marginTop: 12 }}
        onClick={handleCreateConversation}
      >
        发消息
      </Button>
      {/*<Button block size="large" onClick={handleRtc}>*/}
      {/*  音视频通话*/}
      {/*</Button>*/}
      {tagModalVisible && (
        <TagModal
          filterList={filterTagList}
          onClose={() => setTagModalVisible(false)}
          onOk={handleAddTagOk}
        />
      )}
    </div>
  );
}
