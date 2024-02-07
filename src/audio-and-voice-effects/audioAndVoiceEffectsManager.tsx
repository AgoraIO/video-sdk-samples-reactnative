import { useState, useEffect } from "react";
import AgoraManager from "../agora-manager/agoraManager";
import config from "../agora-manager/config";
import {
  AudioProfileType,
  AudioMixingReasonType,
  VoiceConversionPreset,
  AudioEqualizationBandFrequency,
  AudioScenarioType,
  AudioEffectPreset,
  VoiceBeautifierPreset,
  AudioMixingStateType,
} from "react-native-agora";

const AudioAndVoiceEffectsManager = () => {
  // Instantiate AgoraManager to manage Agora-related functionalities
  const agoraManager = AgoraManager();
  // Destructure commonly used properties from agoraManager for cleaner code
  const { agoraEngineRef, joined, remoteUIDs } = agoraManager;

  // State for managing audio mixing state
  const [audioMixingState, setMixingState] = useState<AudioMixingStateType | null>(null);
  // State for managing whether an audio effect is currently playing
  const [isEffectPlaying, setAudioEffectState] = useState(false);
  // State for managing the current voice effect index
  const [voiceEffectIndex, setVoiceEffectIndex] = useState(0);
  // State for managing the channel name
  const [channelName, setChannelName] = useState("");

  // Function to join the channel asynchronously
  const joinChannel = async () => {
    try {
      await setupAgoraEngine();
      await agoraManager.fetchRTCToken(channelName);
      await agoraManager.joinChannel();
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  // Function to leave the channel asynchronously
  const leaveChannel = async () => {
    try {
      agoraManager.leaveChannel();
      agoraManager.destroyEngine();
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };

  // Function to stop audio mixing
  const stopAudioMixing = () => {
    const res = agoraEngineRef.current?.stopAudioMixing();
    console.log(res);
  };

  useEffect(() => {
    return () => {
        // Release the engine when component unmount.
        agoraManager.destroyEngine();
    };
}, []);

  // Function to stop the currently playing sound effect
  const stopSoundEffect = () => {
    agoraEngineRef.current?.stopEffect(config.soundEffectId);
    setAudioEffectState(false);
  };

  // Function to start or control the audio mixing
  const startAudioMixing = () => {
    if (!joined) {
      console.log("Please, join a channel to start audio mixing");
      return;
    }

    if (audioMixingState === AudioMixingStateType.AudioMixingStatePaused) {
      agoraEngineRef.current?.resumeAudioMixing();
    } else if (audioMixingState === AudioMixingStateType.AudioMixingStatePlaying) {
      agoraEngineRef.current?.pauseAudioMixing();
    } else {
      agoraEngineRef.current?.startAudioMixing(config.audioFilePath, true, 1, 0);
    }
  };

  // Callback function when an audio effect finishes playing
  const onAudioEffectFinished = (soundId: number) => {
    console.log("Audio effect finished", soundId);
    setAudioEffectState(false);
  };

  // Callback function for audio mixing state changes

  const onAudioMixingStateChanged = (state: AudioMixingStateType, reason: AudioMixingReasonType ) => {
    if (state === AudioMixingStateType.AudioMixingStateStopped) {
      stopAudioMixing();
    }
    setMixingState(state);
  };

  const preloadSoundEffect = () =>
  {
    if(agoraEngineRef.current)
    {
      agoraEngineRef.current?.preloadEffect(config.soundEffectId, config.soundEffectFilePath);
    }
  }

  // Function to set up the Agora engine with configurations and event handlers
  const setupAgoraEngine = async () => {
    try {
      await agoraManager.setupAgoraEngine();

      agoraEngineRef.current?.setAudioProfile(
        AudioProfileType.AudioProfileMusicHighQualityStereo,
        AudioScenarioType.AudioScenarioGameStreaming
      );
      
      // Preload effect before you join the channel.
      preloadSoundEffect();

      agoraEngineRef.current?.registerEventHandler({
        onAudioEffectFinished,
        onAudioMixingStateChanged,
      });
    } catch (error) {
      console.error("Error setting up Agora Engine:", error);
    }
  };

  // Function to apply different voice effects based on the current index
  const applyVoiceEffect = () => {
    if (!joined) {
      console.log("Please, join a channel to apply voice effect");
      return;
    }

    var index = voiceEffectIndex + 1;

    if (index > 5) {
        index = 0;
    }
    
    setVoiceEffectIndex(index);

    // Turn off all previous effects
    agoraEngineRef.current?.setVoiceBeautifierPreset(VoiceBeautifierPreset.VoiceBeautifierOff);
    agoraEngineRef.current?.setAudioEffectPreset(AudioEffectPreset.AudioEffectOff);
    agoraEngineRef.current?.setVoiceConversionPreset(VoiceConversionPreset.VoiceConversionOff);

    // Apply specific effect based on the index
    switch (index) {
      case 1:
        agoraEngineRef.current?.setVoiceBeautifierPreset(VoiceBeautifierPreset.ChatBeautifierMagnetic);
        break;
      case 2:
        agoraEngineRef.current?.setVoiceBeautifierPreset(VoiceBeautifierPreset.SingingBeautifier);
        break;
      case 3:
        agoraEngineRef.current?.setAudioEffectPreset(AudioEffectPreset.VoiceChangerEffectHulk);
        break;
      case 4:
        agoraEngineRef.current?.setVoiceConversionPreset(VoiceConversionPreset.VoiceChangerBass);
        break;
      case 5:
        agoraEngineRef.current?.setLocalVoiceEqualization(
          AudioEqualizationBandFrequency.AudioEqualizationBand1k,
          3
        );
        agoraEngineRef.current?.setLocalVoicePitch(0.5);
        break;
      default:
        // Remove previous effect
        agoraEngineRef.current?.setLocalVoicePitch(1.0);
        agoraEngineRef.current?.setLocalVoiceEqualization(
          AudioEqualizationBandFrequency.AudioEqualizationBand1k,
          0
        );
        break;
    }
  };

  // Function to change audio route (speakerphone or earpiece)
  const changeAudioRoute = (newValue: boolean) => {
    agoraEngineRef.current?.setDefaultAudioRouteToSpeakerphone(false);
    agoraEngineRef.current?.setEnableSpeakerphone(newValue);
  };

  // Function to play a sound effect
  const playSoundEffect = () => {
    if (!joined) {
      console.log("Please, join a channel to start audio mixing");
      return;
    }

    agoraEngineRef.current?.playEffect(
      config.soundEffectId,
      config.soundEffectFilePath,
      0,
      1,
      0,
      100,
      true
    );
    setAudioEffectState(true);
  };

  // Function to stop all applied voice effects
  const stopAllEffect = () => {
    agoraEngineRef.current?.setVoiceBeautifierPreset(VoiceBeautifierPreset.VoiceBeautifierOff);
    agoraEngineRef.current?.setAudioEffectPreset(AudioEffectPreset.AudioEffectOff);
    agoraEngineRef.current?.setVoiceConversionPreset(VoiceConversionPreset.VoiceConversionOff);
  };

  // Return the necessary functions and states to be used in the component
  return {
    agoraEngineRef: agoraEngineRef,
    Join: joinChannel,
    Leave: leaveChannel,
    joined: joined,
    fetchRTCToken: agoraManager.fetchRTCToken,
    startAudioMixing,
    stopAudioMixing,
    applyVoiceEffect,
    playSoundEffect,
    stopSoundEffect,
    changeAudioRoute,
    audioMixingState,
    remoteUIDs: remoteUIDs,
    setUserRole: agoraManager.setUserRole,
    isEffectPlaying,
    stopAllEffect,
    voiceEffectIndex,
    setChannelName,
  };
};

export default AudioAndVoiceEffectsManager;
