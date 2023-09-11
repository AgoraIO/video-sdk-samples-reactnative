import React, { useState } from "react";
import AgoraManager from "../agora-manager/agoraManager";
import AgoraUI from "../agora-manager/agoraUI";
import config from "../agora-manager/config";
import { View, TextInput } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

const AuthenticationWorkflow = () => {
  const agoraManager = AgoraManager();
  const [channelName, setChannelName] = useState("");

  // Initialize Agora SDK engine for video
  const setupVideoSDKEngine = async () => {
    await agoraManager.setupVideoSDKEngine();
  };

  const fetchRTCToken = async (channelName: string) =>{
    if (config.serverUrl !== "") {
        console.log(`${config.serverUrl}/rtc/${channelName}/publisher/uid/${config.uid}/?expiry=${config.tokenExpiryTime}`);
      try {
        const response = await fetch(
          `${config.serverUrl}/rtc/${channelName}/publisher/uid/${config.uid}/?expiry=${config.tokenExpiryTime}`
        );
        const data = await response.json() as { rtcToken: string };
        console.log("RTC token fetched from server: ", data.rtcToken);
        config.token = data.rtcToken;
        return data.rtcToken;
      } catch (error) {
        console.error(error);
        throw error;
      }
    } else {
      return config.rtcToken;
    }
  }

  // Create an instance of the engine and join the channel
  const handleJoinCall = async () => {
    if (channelName === "") {
      console.log("Enter a channel name to join.");
      return;
    }
    await fetchRTCToken(channelName); // Use the provided channelName
    setupVideoSDKEngine();
    await agoraManager.joinCall();
  };

  // Leave the channel and release the engine instance.
  const handleLeaveCall = async () => {
    await agoraManager.leaveCall();
    agoraManager.agoraEngine?.release();
  };

  return (
    <AgoraUI
      joined={agoraManager.joined}
      handleJoinCall={handleJoinCall}
      handleLeaveCall={handleLeaveCall}
      remoteUids={agoraManager.remoteUids}
      setUserRole={agoraManager.setUserRole}
      additionalContent={
        <View>
        <TextInput
            placeholder="Type a channel name here"
            value={channelName}
            onChangeText={(text) => setChannelName(text)}
            style={{
                alignSelf: 'center',
                borderColor: 'black', // Set the border color to black
                borderWidth: 1, // Add a border width to make it visible
            }}
            />
        </View>
      }
    />
  );
};

export default AuthenticationWorkflow;
