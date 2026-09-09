import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { colors } from '../../theme/colors';
import { AnimatedPressable } from '../../components/animations/AnimatedPressable';

interface Props {
  onDone: () => void;
}

/**
 * Full-screen, skippable studio-logo-style intro cutscene (Gemini/Veo clip
 * supplied by the user: desert run -> pyramid entrance -> Kungbäkola logo
 * reveal) — plays once per cold start, like the skippable intro in Shadow
 * Fight, then hands off to the story/course flow.
 */
export function IntroVideoScreen({ onDone }: Props) {
  const [muted, setMuted] = useState(true);
  const doneRef = useRef(false);

  const player = useVideoPlayer(require('../../../assets/video/intro.mp4'), (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  useEffect(() => {
    const endSub = player.addListener('playToEnd', finish);
    // Safety net: if the clip can't be decoded on some device/browser, don't
    // strand the viewer on a black screen — move on automatically.
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') finish();
    });
    return () => {
      endSub.remove();
      statusSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  function toggleMute() {
    const next = !muted;
    player.muted = next;
    setMuted(next);
  }

  return (
    <View style={styles.screen}>
      <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
      <AnimatedPressable style={styles.skipButton} onPress={finish} pressScale={0.94} accessibilityRole="button">
        <Text style={styles.skipText}>Überspringen ›</Text>
      </AnimatedPressable>
      <AnimatedPressable style={styles.muteButton} onPress={toggleMute} pressScale={0.9} accessibilityRole="button">
        <Text style={styles.muteIcon}>{muted ? '🔇' : '🔊'}</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
  skipButton: {
    position: 'absolute',
    top: 54,
    right: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  muteButton: {
    position: 'absolute',
    bottom: 34,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteIcon: { fontSize: 16, color: colors.background },
});
