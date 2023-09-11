import React, {useState} from "react";
import AgoraManager from "../agora-manager/agoraManager";
import AgoraUI from "../agora-manager/agoraUI";
import { View, Text } from "react-native";
import {AudioProfileType,
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
    LogLevel
    } from 'react-native-agora'

const ensureCallQuality = () => {
  const agoraManager = AgoraManager();
  const [quality, setQuality] = useState(''); // Indicates network quality
  const [isHighQuality, setVideoQuality] = useState(false);// Quality of the remote video stream being played.
  const [isEchoTestRunning, SetEchoTest] = useState(false); // A variable to track echo test state.


  const startProbeTest = () => {
    // Configure a LastmileProbeConfig instance.
    var config = new LastmileProbeConfig();
    // Probe the uplink network quality.
    config.probeUplink = true;
    // Probe the downlink network quality.
    config.probeDownlink = true;
    // The expected uplink bitrate (bps). The value range is [100000,5000000].
    config.expectedUplinkBitrate = 100000;
    // The expected downlink bitrate (bps). The value range is [100000,5000000].
    config.expectedDownlinkBitrate = 100000;
    agoraManager.agoraEngine?.startLastmileProbeTest(config);
};

  // Initialize Agora SDK engine for video
  const setupVideoSDKEngine = async () => {
    await agoraManager.setupVideoSDKEngine();
    if(agoraManager.agoraEngine)
    {
        // Enable the dual stream mode
        agoraManager.agoraEngine.enableDualStreamMode(true);
        // Specify the audio scenario and audio profile.
        agoraManager.agoraEngine.setAudioProfile(
            AudioProfileType.AudioProfileMusicHighQualityStereo,
            AudioScenarioType.AudioScenarioGameStreaming,
        );
        // Set the video profile
        var videoConfig = new VideoEncoderConfiguration();
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
        if (videoConfig.advanceOptions !== undefined) 
        {
            videoConfig.advanceOptions.compressionPreference =
            CompressionPreference.PreferLowLatency;
        }
        // Apply the configuration
        agoraManager.agoraEngine.setVideoEncoderConfiguration(videoConfig);
        // Start the probe test
        startProbeTest();

        // Configure the log file.
        agoraManager.agoraEngine.setLogFile('Specify\\a\\path\\for\\the\\file\\agorasdk.log');
        agoraManager.agoraEngine.setLogFileSize(256); // Ranges from 128 - 20480kb.
        agoraManager.agoraEngine.setLogLevel(LogLevel.LogLevelWarn);
    };
}

  // Create an instance of the engine and join the channel
  const handleJoinCall = async () => {
    setupVideoSDKEngine();
    await agoraManager.joinCall();
  };

  // Leave the channel and release the engine instance.
  const handleLeaveCall = async () => {
    await agoraManager.leaveCall();
    agoraManager.agoraEngine?.release();
  };
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
const setRemoteStreamQuality = () => {
    setVideoQuality(!isHighQuality);
    if (isHighQuality) {
    agoraManager.agoraEngine?.setRemoteVideoStreamType(
        agoraManager.remoteUids[0],
        VideoStreamType.VideoStreamHigh,
    );
    console.log('Switching to high-quality video');
    } 
    else 
    {
        agoraManager.agoraEngine?.setRemoteVideoStreamType(
        agoraManager.remoteUids[0],
        VideoStreamType.VideoStreamLow,
        );
        console.log('Switching to low-quality video');
    }
};
const echoTest = async () => {
    SetEchoTest(!isEchoTestRunning);
    if (isEchoTestRunning) {
        // The time interval between  when you speak and when the recording plays back is 4 second.
        agoraManager.agoraEngine?.startEchoTest(4);
        console.log('Echo test started');
    } else {
        // Stop the echo test before you join a channel.
        agoraManager.agoraEngine?.stopEchoTest();
        console.log('Echo test stopped');
    }
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
            <View >
                <Text> Network Quality: {quality}</Text>
            </View>
            <View>
                <Text onPress={echoTest}>
                    Echo Test
                </Text>
                <Text onPress={setRemoteStreamQuality}>
                    Switch stream quality
                </Text>
            </View>
        </View>
      }

    />
  );
};

export default ensureCallQuality;

