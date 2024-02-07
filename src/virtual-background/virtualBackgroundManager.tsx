
import AgoraManager from "../agora-manager/agoraManager";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { BackgroundSourceType, BackgroundBlurDegree } from "react-native-agora";
import config from "../agora-manager/config";
import { getAbsolutePath } from "../../utils";


const VirtualBackgroundManager = () => {
    const agoraManager = AgoraManager();
    const { agoraEngineRef, joined, remoteUIDs } = agoraManager;
    const [channelName, setChannelName] = useState("");
    const [isVirtualBackgroundOn, setVirtualBackgroundStatus] = useState(false);
    var counter = 0; // to cycle through the different types of backgrounds
  
    // Constants for better readability
    const BackgroundTypes = {
      Blur: 1,
      Color: 2,
      Image: 3,
    };

    useEffect(() => {
        return () => {
            // Release the engine when component unmount.
            agoraManager.destroyEngine();
        };
    }, []);

    const joinChannel = async () => {
      try {
        await agoraManager.setupAgoraEngine();
        await agoraManager.fetchRTCToken(channelName);
        await agoraManager.joinChannel();
        await enableVideoFiltersExtension();
      } catch (error) {
        console.error("Error joining channel:", error);
      }
    };
  
    const changeBackground = () => {
      const nextBackgroundType = getNextBackgroundType();
  
      if (nextBackgroundType === BackgroundTypes.Blur) {
        setBlurBackground();
      } else if (nextBackgroundType === BackgroundTypes.Color) {
        setColorBackground();
      } else if (nextBackgroundType === BackgroundTypes.Image) {
        setImageBackground();
      }
  
      // Increment the counter for the next cycle
      counter++;
    };
  
    const leaveChannel = async () => {
      try {
        await agoraManager.leaveChannel();
        agoraManager.destroyEngine();
      } catch (error) {
        console.error("Error leaving channel:", error);
      }
    };
  
    const enableVideoFiltersExtension = async () => {
      try {
        const res = agoraEngineRef.current?.enableExtension(
          'agora_video_filters_segmentation',
          'portrait_segmentation',
          true,
        );
        if(res === -4)
        {
            Alert.alert("Virtual background is not compatible with your device");
        }
        console.log("Enable extension returns :", res);
      } catch (error) {
        console.error("Error enabling video filters extension:", error);
      }
    };
  
    const getNextBackgroundType = () => counter % 3 + 1;
  
    const setBlurBackground = () => {
      setVirtualBackgroundStatus(true);
      agoraEngineRef.current?.enableVirtualBackground(isVirtualBackgroundOn, {
        background_source_type: BackgroundSourceType.BackgroundBlur,
        blur_degree: BackgroundBlurDegree.BlurDegreeHigh,
      },
      {});
      console.log('Background Blur turned on');
    };
  
    const setColorBackground = () => {
      setVirtualBackgroundStatus(true);
      agoraEngineRef.current?.enableVirtualBackground(isVirtualBackgroundOn, {
        background_source_type: BackgroundSourceType.BackgroundColor,
        color: 0x0000ff,
      },
      {});
      console.log('Background Color turned on');
    };
  
    const setImageBackground = async () => {
      setVirtualBackgroundStatus(true);
      agoraEngineRef.current?.enableVirtualBackground(isVirtualBackgroundOn, {
        background_source_type: BackgroundSourceType.BackgroundImg,
        source: config.imagePath,
      },
      {});
      console.log('Background Image turned on');
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
      changeBackground,
    };
  };
  
  export default VirtualBackgroundManager;
  