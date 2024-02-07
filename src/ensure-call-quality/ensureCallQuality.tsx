import React, { useState } from "react";
import AgoraUI from "../agora-manager/agoraUI";
import { View, Text, Button, TextInput, Alert } from "react-native";
import CallQualityManager from "./callQualityManager";
import { styles } from "../agora-manager/agoraUI";

const EnsureCallQuality = () => {
  const callQualityManager = CallQualityManager();
  const [isHighVideoQuality, setVideoQualityState] = useState(false);

  const startAndStopEchoTest = async () => {
    if (callQualityManager.joined) {
      Alert.alert("You can only run the echo test before joining the channel");
      return;
    }

    if (!callQualityManager.isEchoTestRunning) {
      await callQualityManager.startEchoTest();
    } else {
      await callQualityManager.stopEchoTest();
    }
  };

  const setRemoteStreamQuality = async () => {
    setVideoQualityState(!isHighVideoQuality);

    if (isHighVideoQuality) {
      callQualityManager.setHighStreamQuality();
    } else {
      callQualityManager.setLowStreamQuality();
    }
  };

  return (
    <AgoraUI
      joined={callQualityManager.joined}
      handleJoinCall={callQualityManager.joinChannel}
      handleLeaveCall={callQualityManager.leaveChannel}
      remoteUids={callQualityManager.remoteUIDs}
      setUserRole={callQualityManager.setUserRole}
      additionalContent={
        <View>
          <TextInput
            placeholder="Type a channel name here"
            placeholderTextColor={"white"}
            onChangeText={(text) => callQualityManager.setChannelName(text)}
            style={styles.input}
          />
          <Text style={styles.networkQuality}>
            Network Quality: {callQualityManager.networkQuality}
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              title={
                callQualityManager.isEchoTestRunning
                  ? "Stop Test"
                  : "Start Echo Test"
              }
              onPress={startAndStopEchoTest}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              title={
                isHighVideoQuality
                  ? "Low Video Quality"
                  : "High Video Quality"
              }
              onPress={setRemoteStreamQuality}
            />
          </View>
        </View>
      }
    />
  );
};

export default EnsureCallQuality;
