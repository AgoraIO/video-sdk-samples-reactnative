import { useState, useEffect } from "react";
import AgoraManager from "../agora-manager/agoraManager";
import {
  AudioProfileType,
  AudioScenarioType,
  FrameRate,
  VideoDimensions,
  OrientationMode,
  DegradationPreference,
  VideoMirrorModeType,
  LastmileProbeConfig,
  VideoEncoderConfiguration,
  VideoStreamType,
  CompressionPreference,
  QualityType,
  LogLevel,
  RtcConnection,
  RtcStats,
  ConnectionStateType,
  ConnectionChangedReasonType,
  LastmileProbeResult,
  RemoteVideoState,
  RemoteVideoStateReason,
  RemoteVideoStats
} from 'react-native-agora';
import config from "../agora-manager/config";
import { Alert } from "react-native";

const CallQualityManager = () => {
  const agoraManager = AgoraManager();

  // State variables
  const [networkQuality, setQuality] = useState(''); // Indicates network quality
  const [isEchoTestRunning, setEchoTestState] = useState(false); // A variable to track the echo test state.
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    return () => {
        // Release the engine when component unmount.
        agoraManager.destroyEngine();
    };
  }, []);

  // Function to start a network probe test
  const startProbeTest = () => {
    // Configure a LastmileProbeConfig instance.
    const probeConfig = new LastmileProbeConfig();
    probeConfig.probeUplink = true; // Probe the uplink network quality.
    probeConfig.probeDownlink = true; // Probe the downlink network quality.
    probeConfig.expectedUplinkBitrate = 100000; // Expected uplink bitrate (bps).
    probeConfig.expectedDownlinkBitrate = 100000; // Expected downlink bitrate (bps).
    agoraManager.agoraEngineRef.current?.startLastmileProbeTest(probeConfig);
  };

  // Function to set up the video SDK engine
  const setupAgoraEngine = async () => {
    await agoraManager.setupAgoraEngine();
    if (agoraManager.agoraEngineRef.current) {
      // Enable the dual stream mode
      agoraManager.agoraEngineRef.current.enableDualStreamMode(true);
      // Specify the audio scenario and audio profile.
      agoraManager.agoraEngineRef.current.setAudioProfile(
        AudioProfileType.AudioProfileMusicHighQualityStereo,
        AudioScenarioType.AudioScenarioGameStreaming,
      );
      // Set the video profile
      const videoConfig = new VideoEncoderConfiguration();
      // Set mirror mode
      videoConfig.mirrorMode = VideoMirrorModeType.VideoMirrorModeAuto;
      // Set framerate
      videoConfig.frameRate = FrameRate.FrameRateFps10;
      // Set bitrate
      videoConfig.bitrate = 100000;
      // Set dimensions
      videoConfig.dimensions = new VideoDimensions();
      // Set orientation mode
      videoConfig.orientationMode = OrientationMode.OrientationModeAdaptive;
      // Set degradation preference
      videoConfig.degradationPreference =
        DegradationPreference.MaintainBalanced;
      // Set compression preference
      if (videoConfig.advanceOptions !== undefined) {
        videoConfig.advanceOptions.compressionPreference =
          CompressionPreference.PreferLowLatency;
      }
      // Apply the configuration
      agoraManager.agoraEngineRef.current.setVideoEncoderConfiguration(videoConfig);

      // Start the probe test
      startProbeTest();

      // Configure the log file.
      const logFilePath = `${config.logFilePath}\\agorasdk.log`;
      agoraManager.agoraEngineRef.current.setLogFile(logFilePath);
      agoraManager.agoraEngineRef.current.setLogFileSize(256); // Ranges from 128 - 20480kb.
      agoraManager.agoraEngineRef.current.setLogLevel(LogLevel.LogLevelWarn);
      agoraManager.agoraEngineRef.current.registerEventHandler({
        onNetworkQuality,
        onLastmileProbeResult,
        onLastmileQuality,
        onConnectionStateChanged,
        onRtcStats,
        onRemoteVideoStateChanged,
        onRemoteVideoStats
      });
    }
  };

  const onConnectionStateChanged = (connection: RtcConnection, state: ConnectionStateType, reason: ConnectionChangedReasonType) => {
    console.log(
      'Connection state changed' +
      '\n New state: ' +
      state +
      '\n Reason: ' +
      reason,
    );
  };

  const onLastmileQuality = (Quality: QualityType) => {
    updateNetworkStatus(Quality);
  }
  
  const onLastmileProbeResult = (result: LastmileProbeResult) => {
    agoraManager.agoraEngineRef.current?.stopLastmileProbeTest();
    // The result object contains the detailed test results that help you
    // manage call quality, for example, the downlink jitter.
    console.log('Downlink jitter: ' + result.downlinkReport?.jitter);
    agoraManager.destroyEngine();
  }

  const onNetworkQuality = (_connection: RtcConnection, _Uid: number, _txQuality: QualityType, rxQuality: QualityType) => {
    // Use downlink network quality to update the network status
    updateNetworkStatus(rxQuality);
  }

  const onRtcStats = (connection: RtcConnection, stats: RtcStats) => {
    console.log(stats.userCount + ' user(s)');
    console.log('Packet loss rate: ' + stats.rxPacketLossRate);
  }

  const onRemoteVideoStateChanged = (
    _connection: RtcConnection,
    Uid: number,
    state: RemoteVideoState,
    reason: RemoteVideoStateReason,
    elapsed: number,
  ) => {
    console.log(
      'Remote video state changed: \n Uid =' +
      Uid +
      ' \n NewState =' +
      state +
      ' \n reason =' +
      reason +
      ' \n elapsed =' +
      elapsed,
    );
  }

  const onRemoteVideoStats = (_connection: RtcConnection, stats: RemoteVideoStats) => {
    console.log(
      'Remote Video Stats: ' +
      '\n User id =' +
      stats.uid +
      '\n Received bitrate =' +
      stats.receivedBitrate +
      '\n Total frozen time =' +
      stats.totalFrozenTime,
    );
  };

  const leaveChannel = async () => {
    agoraManager.leaveChannel();
    agoraManager.destroyEngine();
  };

  // Function to join a call
  const joinChannel = async () => {
    if (isEchoTestRunning) {
      console.log('Please, stop the echo test to join the channel');
      return;
    }
    await setupAgoraEngine();
    await agoraManager.fetchRTCToken(channelName);
    await agoraManager.joinChannel();
  };

  // Function to update network quality based on the QualityType
  const updateNetworkStatus = (Quality: QualityType) => {
    if (Quality > 0 && Quality < 3) {
      setQuality('Excellent');
    } else if (Quality <= 4) {
      setQuality('Poor');
    } else if (Quality <= 6) {
      setQuality('Bad');
    } else {
      setQuality('');
    }
  };

  const setLowStreamQuality = () => {
    if (agoraManager.remoteUIDs === null) {
      console.log("No remote user in the channel");
      return;
    }
    agoraManager.agoraEngineRef.current?.setRemoteVideoStreamType(
      agoraManager.remoteUIDs[0],
      VideoStreamType.VideoStreamLow
    );
  };

  const setHighStreamQuality = () => {
    if (agoraManager.joined) {
      if (agoraManager.remoteUIDs === null) {
        console.log("No remote user in the channel");
        return;
      }
      agoraManager.agoraEngineRef.current?.setRemoteVideoStreamType(
        agoraManager.remoteUIDs[0],
        VideoStreamType.VideoStreamHigh
      );
    } else {
      console.log("Join the channel to switch the remote user's video quality");
    }
  };

  // Function to start or stop the echo test
  const startEchoTest = async () => {
    if(config.token==="")
    {
      Alert.alert("Please specify a token in the config file to run echo test");
      return;
    }
    await setupAgoraEngine();
    const ret = await agoraManager.agoraEngineRef.current?.startEchoTest({
      enableAudio: true,
      token: config.token,
      channelId: config.channelName,
      intervalInSeconds: 2,
    });
    console.log("Channel join status: ", ret);
    setEchoTestState(true);
  };

  const stopEchoTest = async () => {
    agoraManager.agoraEngineRef.current?.stopEchoTest();
    agoraManager.destroyEngine();
    setEchoTestState(false);
  };

  return {
    isEchoTestRunning,
    startEchoTest,
    stopEchoTest,
    setHighStreamQuality,
    setLowStreamQuality,
    joinChannel,
    leaveChannel,
    setChannelName,
    joined: agoraManager.joined,
    remoteUIDs: agoraManager.remoteUIDs,
    setUserRole: agoraManager.setUserRole,
    networkQuality
  };
};

export default CallQualityManager;