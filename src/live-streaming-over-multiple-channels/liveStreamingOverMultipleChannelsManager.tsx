import { useState, useEffect, useRef } from "react";
import AgoraManager from "../agora-manager/agoraManager";
import createAgoraRtcEngine, {
  IRtcEngineEx,
  ClientRoleType,
  ChannelMediaOptions,
  ChannelMediaRelayEvent,
  ChannelMediaRelayState,
  ChannelProfileType,
  RtcConnection,
  VideoSourceType,
  UserOfflineReasonType
} from "react-native-agora";
import config from "../agora-manager/config";
import { Alert } from "react-native";

const LivesStreamingOverMultipleChannelsManager = () => {
  const agoraManager = AgoraManager();
  const { agoraEngineRef, joined, remoteUIDs } = agoraManager;
  const [channelName, setChannelName] = useState("");
  const [mediaRelaying, setMediaRelaying] = useState(false);
  const [isSecondChannelJoined, setSecondChannelJoined] = useState(false);
  const agoraEngineRefEX = useRef<IRtcEngineEx | null>(null);
  const [secondChannelRemoteUIDs, addRemoteUser] = useState<number[]>([]);


  useEffect(() => {
    return () => {
      // Release the engine when the component unmounts.
      agoraManager.destroyEngine();
      if (agoraEngineRefEX.current) {
        agoraEngineRefEX.current.release();
        agoraEngineRefEX.current = null;
      }
    };
  }, []);

  // Setup and initialize the secondary Agora engine for the second channel.
  const setupAgoraEngineEx = async () => {
    try {
      agoraEngineRefEX.current = createAgoraRtcEngine() as IRtcEngineEx;
      agoraEngineRefEX.current.registerEventHandler({
        onJoinChannelSuccess: (connection, _Uid) => {
          console.log("Successfully joined the channel " + connection.channelId);
          setSecondChannelJoined(true);
        },
        onUserJoined: (connection: RtcConnection, remoteUid: number, elapsed: number) => {
          console.log("Remote user joined with uid " + remoteUid);
          if (!remoteUIDs.includes(remoteUid)) {
            addRemoteUser([...secondChannelRemoteUIDs, remoteUid]);
          }
        },
        onUserOffline:(connection: RtcConnection, remoteUid: number, reason: UserOfflineReasonType) => {
          addRemoteUser(remoteUIDs.filter((uid) => uid !== remoteUid));
        },
      });

      // Check if App ID is specified before initializing the engine.
      if (config.appId === "") {
        Alert.prompt("Please specify a valid app ID to initialize the engine instance");
        return;
      }

      // Initialize the secondary engine with required configurations.
      agoraEngineRefEX.current.initialize({
        appId: config.appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      console.log("Engine initialized");
    } catch (e) {
      console.error("Error initializing engine:", e);
    }
  };

  // Join or leave the second channel.
  const joinSecondChannel = async () => {
    if (config.secondChannelName === "" || config.secondChannelToken === "" || config.secondChannelUid === null) {
      Alert.alert("Please specify the required second channel parameters in the config file");
      return;
    }

    if (isSecondChannelJoined) {
      // Leave the second channel if already joined.
      agoraEngineRefEX.current?.leaveChannelEx({
        localUid: config.secondChannelUid,
        channelId: config.secondChannelName,
      });
      setSecondChannelJoined(false);
      addRemoteUser([]);
      console.log("You left the second channel");
      return;
    } else {
      // Join the second channel if not already joined.
      await setupAgoraEngineEx();

      // Enable video for the secondary engine.
      agoraEngineRefEX.current?.enableVideo();

      agoraEngineRefEX.current?.startPreview(VideoSourceType.VideoSourceCamera);

      var mediaOptions = new ChannelMediaOptions();
        mediaOptions.autoSubscribeAudio = true;
        mediaOptions.autoSubscribeVideo = true;
        mediaOptions.publishCameraTrack = true;
        mediaOptions.channelProfile = ChannelProfileType.ChannelProfileLiveBroadcasting;
        mediaOptions.clientRoleType = ClientRoleType.ClientRoleBroadcaster;

      // Join the second channel with the specified configurations.
      agoraEngineRefEX.current?.joinChannelEx(
        config.secondChannelToken,
        {
          localUid: config.secondChannelUid,
          channelId: config.secondChannelName,
        },
        mediaOptions
      );
    }
  };

  // Join the primary channel.
  const joinChannel = async () => {
    try {
      // Setup and initialize the primary Agora engine.
      await agoraManager.setupAgoraEngine();

      // Register event handlers for channel media relay state changes.
      agoraEngineRef.current?.registerEventHandler({
        onChannelMediaRelayStateChanged: (state, code) => {
          switch (state) {
            case ChannelMediaRelayState.RelayStateConnecting:
              console.log("Channel media relay connecting.");
              break;
            case ChannelMediaRelayState.RelayStateRunning:
              setMediaRelaying(true);
              console.log("Channel media relay running.");
              break;
            case ChannelMediaRelayState.RelayStateFailure:
              setMediaRelaying(false);
              console.log("Channel media relay failure. Error code: " + code);
          }
        },
        onChannelMediaRelayEvent: (code) => {
          switch (code) {
            case ChannelMediaRelayEvent.RelayEventNetworkDisconnected:
              console.log("User disconnected from the server due to a poor network connection.");
              break;
            case ChannelMediaRelayEvent.RelayEventNetworkConnected:
              console.log("Network reconnected");
              break;
            case ChannelMediaRelayEvent.RelayEventPacketJoinedSrcChannel:
              console.log("User joined the source channel");
          }
        },
      });

      // Fetch RTC token and join the primary channel.
      await agoraManager.fetchRTCToken(channelName);
      await agoraManager.joinChannel();
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  // Start or stop channel media relay.
  const startAndStopMediaRelay = () => {
    if (config.destChannelName === "" || config.destChannelToken === "" || config.destUid === null) {
      Alert.alert("Please specify the required destination channel parameters in the config file");
      return;
    }

    if (!agoraManager.joined) {
      Alert.alert("Join a channel first to start channel media relay");
      return;
    }

    if (mediaRelaying) {
      // Stop channel media relay.
      agoraEngineRef.current?.stopChannelMediaRelay();
    } else {
      // Start relaying media streams across channels.
      agoraEngineRef.current?.startChannelMediaRelay({
        srcInfo: {
          channelName: channelName,
          token: config.token,
          uid: config.uid,
        },
        destInfos: [
          {
            channelName: config.destChannelName,
            token: config.destChannelToken,
            uid: config.destUid,
          },
        ],
        destCount: 1,
      });
    }
  };

  // Leave the channel and clean up resources.
  const leaveChannel = async () => {
    try {
      await agoraManager.leaveChannel();
      agoraManager.destroyEngine();
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };

  return {
    agoraEngineRef,
    join: joinChannel,
    leave: leaveChannel,
    joined,
    fetchRTCToken: agoraManager.fetchRTCToken,
    remoteUIDs,
    setUserRole: agoraManager.setUserRole,
    setChannelName,
    startAndStopMediaRelay,
    mediaRelaying,
    joinSecondChannel,
    isSecondChannelJoined,
    secondChannelRemoteUIDs
  };
};

export default LivesStreamingOverMultipleChannelsManager;
