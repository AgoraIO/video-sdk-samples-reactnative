import React, { useEffect, useState } from "react";
import AgoraUI from "../agora-manager/agoraUI";
import { View, Button, TextInput, Text } from "react-native";
import PlayMediaManager from "./playMediaManager";
import { RtcSurfaceView, VideoSourceType, MediaPlayerState, VideoViewSetupMode } from "react-native-agora";
import { styles } from "../agora-manager/agoraUI";

const PlayMedia = () => {
  const {
    joined,
    joinChannel,
    leaveChannel,
    remoteUIDs,
    setUserRole,
    setChannelName,
    isPlaying,
    playMedia,
    mediaPlayerRef,
    mediaPlayerState,
  } = PlayMediaManager();

  const stateToBtnTextMap = {
    [MediaPlayerState.PlayerStatePlaying]: "Pause Player",
    [MediaPlayerState.PlayerStatePaused]: "Resume Player",
    [MediaPlayerState.PlayerStateOpening]: "Opening Media File",
    default: "Play Media File",
  };

  const [playMediaBtnTxt, setPlayMediaBtnTxt] = useState(stateToBtnTextMap.default);

  useEffect(() => {
    setPlayMediaBtnTxt(stateToBtnTextMap[mediaPlayerState] || stateToBtnTextMap.default);
  }, [mediaPlayerState]);

  return (
      <AgoraUI
        joined={joined}
        handleJoinCall={joinChannel}
        handleLeaveCall={leaveChannel}
        remoteUids={remoteUIDs}
        setUserRole={setUserRole}
        additionalContent={
          <View>
            <TextInput
              placeholder="Type a channel name here"
              placeholderTextColor="white"
              onChangeText={(text) => setChannelName(text)}
              style={styles.input}
            />
            <View>
              <Button title={playMediaBtnTxt} onPress={playMedia} />
            </View>
          </View>
        }
        additionalViews = {
          isPlaying && (
            <View>
              <Text style = {{color: "white"}}>Media Player</Text>
              <RtcSurfaceView
                style={styles.mediaPlayerView}
                canvas={{
                  uid: mediaPlayerRef.current?.getMediaPlayerId(),
                  sourceType: VideoSourceType.VideoSourceMediaPlayer,
                  setupMode: VideoViewSetupMode.VideoViewSetupAdd,
                  mediaPlayerId: mediaPlayerRef.current?.getMediaPlayerId(),
                }}
              />
            </View>
          )
        }
      />
  );
};

export default PlayMedia;
