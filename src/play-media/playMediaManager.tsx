import { useState, useRef, useEffect } from "react";
import { Alert } from "react-native";
import AgoraManager from "../agora-manager/agoraManager";
import config from "../agora-manager/config";
import {
  IMediaPlayer,
  MediaPlayerState,
  ChannelMediaOptions,
} from "react-native-agora";

const PlayMediaManager = () => {
  const agoraManager = AgoraManager();
  const { agoraEngineRef, joined, remoteUIDs } = agoraManager;
  const mediaPlayerRef = useRef<IMediaPlayer>();
  const [channelName, setChannelName] = useState("");
  const [isUrlOpened, setIsUrlOpened] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mediaPlayerState, setMediaPlayerState] = useState<MediaPlayerState|null> (MediaPlayerState.PlayerStateIdle);

  useEffect(() => {
    return () => {
        // Release the engine when component unmount.
        agoraEngineRef.current?.destroyMediaPlayer(mediaPlayerRef?.current);
        agoraManager.destroyEngine();
    };
  }, []);

  const joinChannel = async () => {
    try {
        await agoraManager.setupAgoraEngine();
        await agoraManager.fetchRTCToken(channelName);
        await agoraManager.joinChannel();
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  const leaveChannel = async () => {
    try {
      agoraManager.leaveChannel();
      agoraManager.destroyEngine();
      agoraEngineRef.current?.destroyMediaPlayer(mediaPlayerRef.current);
      setMediaPlayerState(MediaPlayerState.PlayerStateIdle);
      setIsPlaying(false);
      setIsUrlOpened(false);
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };

  const playMedia = async () => {
    if (!agoraManager.joined) {
        Alert.alert("Join the channel to start media streaming");
      return;
    }

    if (!isUrlOpened) {
        await initializeMediaPlayer();
        const ret = mediaPlayerRef.current?.open(config.mediaLocation, 0);
        if(ret !== 0)
        {
          Alert.alert("File not found");
        }
    } else if (mediaPlayerState === MediaPlayerState.PlayerStatePaused) {
        mediaPlayerRef.current?.resume();
    } else if (mediaPlayerState === MediaPlayerState.PlayerStatePlaying) {
        mediaPlayerRef.current?.pause();
    } else {
        mediaPlayerRef.current?.play();
        setIsPlaying(true);
        updateChannelPublishOptions(true);
    }
  };

  const initializeMediaPlayer = async () => {
    mediaPlayerRef.current = agoraEngineRef.current?.createMediaPlayer();

    mediaPlayerRef.current?.registerPlayerSourceObserver({
      onPlayerSourceStateChanged,
      onPositionChanged
    });
  };

  const onPositionChanged = (position: number) => {
    // Use position and duration to update your play progressBar here.
  }
  
  const onPlayerSourceStateChanged = (state: MediaPlayerState) => {
    setMediaPlayerState(state);
    if (state === MediaPlayerState.PlayerStateOpenCompleted) {
      setIsUrlOpened(true);
    } else if (
      state === MediaPlayerState.PlayerStatePlaybackAllLoopsCompleted
    ) {
      handleMediaFinishedPlaying();
    }
  };

  const handleMediaFinishedPlaying = () => {
    setIsPlaying(false);
    updateChannelPublishOptions(false);
  };

  const updateChannelPublishOptions = (publishMediaPlayer: boolean) => {
    const channelOptions = new ChannelMediaOptions();
    channelOptions.publishMediaPlayerAudioTrack = publishMediaPlayer;
    channelOptions.publishMediaPlayerVideoTrack = publishMediaPlayer;
    channelOptions.publishMicrophoneTrack = !publishMediaPlayer;
    channelOptions.publishCameraTrack = !publishMediaPlayer;
    if (publishMediaPlayer) {
      channelOptions.publishMediaPlayerId =
        mediaPlayerRef.current?.getMediaPlayerId();
    }
    agoraEngineRef.current?.updateChannelMediaOptions(channelOptions);
  };

  return {
    agoraEngineRef,
    isPlaying,
    remoteUIDs,
    joined,
    joinChannel,
    leaveChannel,
    fetchRTCToken: agoraManager.fetchRTCToken,
    setUserRole: agoraManager.setUserRole,
    setChannelName,
    playMedia,
    mediaPlayerRef,
    mediaPlayerState
  };
};

export default PlayMediaManager;