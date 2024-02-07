import { useState, useEffect } from "react";
import AgoraManager from "../agora-manager/agoraManager";
import { Alert } from "react-native";
import { RtcConnection } from "react-native-agora";
import config from "../agora-manager/config";

const AuthenticationWorkflowManager = () => {
  const agoraManager = AgoraManager();
  const [channelName, setChannelName] = useState("");

  // Function to set up the video SDK engine
  const setupAgoraEngine = async () => {
    await agoraManager.setupAgoraEngine();

    // Register event handler
    agoraManager.agoraEngineRef.current?.registerEventHandler({
      onTokenPrivilegeWillExpire: onTokenPrivilegeWillExpire,
    });
  };

  useEffect(() => {
    return () => {
        // Release the engine when component unmount.
        agoraManager.destroyEngine();
    };
  }, []);

  // Event handler for token privilege expiration
  const onTokenPrivilegeWillExpire = (connection: RtcConnection, token: string) => {
    agoraManager.fetchRTCToken(channelName);
    agoraManager.agoraEngineRef.current?.renewToken(config.token);
  };

  // Function to handle joining the call
  const joinChannel = async () => {
    try {
      if(config.serverUrl ==="" )
      {
        Alert.alert("Please specify a server url to fetch token from the server");
        return;
      }
      await setupAgoraEngine();
      await agoraManager.fetchRTCToken(channelName);
      await agoraManager.joinChannel();
    } 
    catch (error) {
      console.error("Error joining the call:", error);
      Alert.alert("An error occurred while joining the call.");
    }
  };

  // Function to handle leaving the call
  const leaveChannel = async () => {
    try {
      await agoraManager.leaveChannel();
      agoraManager.destroyEngine();
    } catch (error) {
      console.error("Error leaving the call:", error);
    }
  };

  return {
    agoraEngine : agoraManager.agoraEngineRef,
    joined: agoraManager.joined,
    remoteUIDs: agoraManager.remoteUIDs,
    joinChannel: joinChannel,
    leaveChannel: leaveChannel,
    setUserRole: agoraManager.setUserRole,
    setupAgoraEngine: setupAgoraEngine,
    destroyEngine: agoraManager.destroyEngine,
    setChannelName
  };
};

export default AuthenticationWorkflowManager;
