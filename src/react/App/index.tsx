import { RootReducerState } from "../../global";
import { Layout, Spin } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ApplicationRouter from "../Components/Router/ApplicationRouter/ApplicationRouter";
import DndKitProvider from "../DnD/DndKitProvider";
import Sidebar from "../Components/Router/Sidebar/Sidebar.component";
import userActions from "../../redux/user/user.actions";
import highscoreActions from "../../redux/highScores/highscores.actions";

const { Content } = Layout;

function BaseApplication() {
  const dispatch = useDispatch();

  const { loggedIn } = useSelector(({ User }: RootReducerState) => ({
    loggedIn: User.loggedIn
  }));

  const mountComponent = () => {
    // Initialize offline/local user and highscores (no Firebase)
    dispatch(userActions.getLocalStorage());
    dispatch(highscoreActions.setOfflineHighScores());
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
            <ApplicationRouter />
          </DndKitProvider>
        </Content>
      </Layout>
    </Layout>
  );
}

export default BaseApplication;
