// ProductWorkflow.js
import React from "react";
import { View, Text, Button, TextInput, Switch } from "react-native";
import AgoraUI from "../agora-manager/agoraUI";
import { VideoSourceType, RenderModeType, RtcSurfaceView } from 'react-native-agora';
import ProductWorkflowManager from "./productWorkflowManager";
import { styles } from "../agora-manager/agoraUI";
import config from "../agora-manager/config";

const ProductWorkflow = () => {
    const productWorkflowManager = ProductWorkflowManager(); // Assuming this import is available

    return (
        <AgoraUI
            joined={productWorkflowManager.joined}
            handleJoinCall={productWorkflowManager.Join}
            handleLeaveCall={productWorkflowManager.Leave}
            remoteUids={productWorkflowManager.remoteUIDs}
            setUserRole={productWorkflowManager.setUserRole}
            additionalContent={
                <View>
                    <TextInput
                        placeholder="Type a channel name here"
                        onChangeText={(text) => productWorkflowManager.setChannelName(text)}
                        style={styles.input}
                        placeholderTextColor="white"
                    />
                    <View style={styles.volumeControl}>
                        <Button title="+" onPress={productWorkflowManager.increaseVolume} />
                        <Text style={styles.volumeText}>Volume: {productWorkflowManager.volume}</Text>
                        <Button title="-" onPress={productWorkflowManager.decreaseVolume} />
                    </View>
                    <Button
                        title={productWorkflowManager.isSharingScreen ? "Stop Sharing" : "Share Screen"}
                        onPress={productWorkflowManager.isSharingScreen ? productWorkflowManager.stopScreenSharing : productWorkflowManager.startScreenCapture}
                    />
                    <View style={styles.muteSwitchContainer}>
                        <Text style={styles.muteLabel}>Mute Remote User:</Text>
                        <Switch
                            onValueChange={(newValue) => productWorkflowManager.mute(newValue)}
                        />
                    </View>
                </View>
            }
            additionalViews = {
                productWorkflowManager.isSharingScreen && (
                    <RtcSurfaceView
                        style={styles.screenShareView}
                        canvas={{
                            uid: config.uid,
                            sourceType: VideoSourceType.VideoSourceScreen,
                            renderMode: RenderModeType.RenderModeFit,
                        }}
                        connection={{localUid: config.uid, channelId: config.channelName}}
                    />
                )
            }
        />
    );
};

export default ProductWorkflow;
