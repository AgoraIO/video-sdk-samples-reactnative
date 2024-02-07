import React from "react";
import AgoraUI from "../agora-manager/agoraUI";
import { View, TextInput, Button, Text, ScrollView } from "react-native";
import LivesStreamingOverMultipleChannelsManager from "./liveStreamingOverMultipleChannelsManager";
import { styles } from "../agora-manager/agoraUI";
import { RtcSurfaceView } from "react-native-agora";
import config from "../agora-manager/config";

const LivesStreamingOverMultipleChannels = () => {
  const livesStreamingOverMultipleChannelsManager = LivesStreamingOverMultipleChannelsManager();

  return (
    <>
      <AgoraUI
        joined={livesStreamingOverMultipleChannelsManager.joined}
        handleJoinCall={livesStreamingOverMultipleChannelsManager.join}
        handleLeaveCall={livesStreamingOverMultipleChannelsManager.leave}
        remoteUids={livesStreamingOverMultipleChannelsManager.remoteUIDs}
        setUserRole={livesStreamingOverMultipleChannelsManager.setUserRole}
        additionalContent={
          <View>
            <TextInput
              placeholder="Type a channel name here"
              onChangeText={(text) => livesStreamingOverMultipleChannelsManager.setChannelName(text)}
              style={styles.input}
              placeholderTextColor={"white"}
            />
            <Button
              title={livesStreamingOverMultipleChannelsManager.mediaRelaying ? "Stop Media Relay" : "Start Media Relay"}
              onPress={livesStreamingOverMultipleChannelsManager.startAndStopMediaRelay}
            />
            <Button
              title={livesStreamingOverMultipleChannelsManager.isSecondChannelJoined ? "Leave Second Channel" : "Join Second Channel"}
              onPress={livesStreamingOverMultipleChannelsManager.joinSecondChannel}
            />
          </View>
        }
        additionalViews={
          livesStreamingOverMultipleChannelsManager.secondChannelRemoteUIDs.length !== 0 ? (
            <View key={livesStreamingOverMultipleChannelsManager.secondChannelRemoteUIDs[0]}>
              <Text style={{color: "white"}}>Second channel remote users: </Text>
              <RtcSurfaceView
                canvas={{ uid: livesStreamingOverMultipleChannelsManager.secondChannelRemoteUIDs[0] }}
                style={styles.videoView}
                connection={{ localUid: config.secondChannelUid, channelId: config.secondChannelName }}
              />
            </View>
          ) : null
        }
      />
    </>
    
  );
};

export default LivesStreamingOverMultipleChannels;