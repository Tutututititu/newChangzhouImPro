import React, {useRef, useState,useEffect} from 'react';

import MailList from './MailList';
import CommonContactorList from './CommonContactorList';
import NewFriendList from './NewFriendList';
import ContactorList from './ContactorList';
import FriendList from './FriendList';
import GroupList from './GroupList';
import OrganizationalList from './OrganizationalList';

export default (props:any) => {
  const updaterRef = useRef(null);
  const { pagePath,UserInfo } = props;
  const [activePage, setActivePage] = useState(
    pagePath.activePage || 'commonContactorList',
  );
  const [organizationalData, setOrganizationalData] = useState({});
  const toOrganizationalChange=(item: any)=>{
    setOrganizationalData(item);
    setTimeout(() => {
      updaterRef.current&&updaterRef.current.toChangeOrganizational()
    }, 200);
  };
  const renderComponent = () => {
    switch (activePage) {
      case 'commonContactorList':
        return <CommonContactorList />;
      case 'newFriendList':
        return <NewFriendList />;
      case 'contactorList':
        return <ContactorList />;
      case 'friendList':
        return <FriendList />;
      case 'groupList':
        return <GroupList />;
      case 'organizationalList':
        return <OrganizationalList ref={updaterRef} organizationalData={organizationalData} />;
    }
  };

  return (
    <>
      <div className="im-layout-center">
        <MailList
          activePage={activePage}
          toOrganizationalChange={toOrganizationalChange}
          UserInfo={UserInfo}
          onActivePageChange={(page: string) => setActivePage(page)}
        />
      </div>
      <div
        className="im-layout-right"
        style={{ background: '#fff', borderLeft: '1px solid rgba(0,0,0,0.06)' }}
      >
        {renderComponent()}
      </div>
    </>
  );
};
