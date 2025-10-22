import { RootReducerState } from "../../global";
import { Layout, Spin } from "antd";
import React, { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ApplicationRouter from "../Components/Router/ApplicationRouter/ApplicationRouter";
import DndKitProvider from "../DnD/DndKitProvider";
import Sidebar from "../Components/Router/Sidebar/Sidebar.component";
import { auth } from "../../firebase/firebase.utils";
import { setUserRedux } from "../Components/Forms/helper";

const Joyride = lazy(() => import("../HocWrappers/Joyride/Joyride.component"));

const { Content } = Layout;

function BaseApplication() {
  const dispatch = useDispatch();

  const { loggedIn } = useSelector(({ User }: RootReducerState) => ({
    loggedIn: User.loggedIn
  }));

  const mountComponent = () => {
    const user = auth.currentUser;
    setUserRedux(user, dispatch, loggedIn);
  };
  useEffect(mountComponent, []);

  return loggedIn === undefined ? (
    <Spin spinning />
  ) : (
    <Layout className="mainLayout">
      <Sidebar />
      <Layout className="appLayout">
        <Content className="appContent">
          <DndKitProvider>
            <Suspense fallback={null}>
              <Joyride />
            </Suspense>
            <ApplicationRouter />
          </DndKitProvider>
        </Content>
      </Layout>
    </Layout>
  );
}

export default BaseApplication;
