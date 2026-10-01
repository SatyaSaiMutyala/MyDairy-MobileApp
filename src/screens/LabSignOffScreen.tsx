import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, Lock, RotateCcw, UserRound } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { ShimmerRows } from '../components/Shimmer';
import { SignerCard } from '../components/SignerCard';
import { Stat } from '../components/Stat';
import { uploadFile } from '../lab/model';
import { errorMessage } from '../store';
import {
  Target,
  useLabSignOffMutation,
  useLabStateQuery,
} from '../store/api/labApi';
import { longDate } from '../utils/dates';
import { getPosition, Point } from '../utils/location';
import { pickPhotos, takeSelfie } from '../utils/photos';
import { colors, hairline, radius, s, vs } from '../theme';

export function LabSignOffScreen() {
  const nav = useNavigation();
  const target = useRoute<any>().params as Target;
  const state = useLabStateQuery(target);
  const [signOff, call] = useLabSignOffMutation();

  const [selfie, setSelfie] = useState<string>();
  const [error, setError] = useState<string>();
  const [noCamera, setNoCamera] = useState(false);

  const capture = async () => {
    const shot = await takeSelfie();
    setError(shot.error);
    if (shot.error) {
      setNoCamera(true);
    }
    if (shot.uris[0]) {
      setSelfie(shot.uris[0]);
    }
  };

  // Only offered when the phone has no usable camera (for example a simulator).
  const choose = async () => {
    const picked = await pickPhotos(1);
    setError(picked.error);
    if (picked.uris[0]) {
      setSelfie(picked.uris[0]);
    }
  };

  // The position is fetched while the person reads the declaration, so
  // signing never has to wait for it.
  const point = useRef<Point | null>(null);
  useEffect(() => {
    getPosition().then(p => {
      point.current = p;
    });
  }, []);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!selfie || busy) {
      return;
    }
    setBusy(true);
    try {
      await signOff({
        ...target,
        selfie: uploadFile(selfie, 'selfie.jpg'),
        point: point.current,
      }).unwrap();
      nav.goBack();
    } catch {
      // The API's message is shown above the button.
    } finally {
      setBusy(false);
    }
  };

  const summary = state.data?.summary;
  const phase = target.phase;

  if (state.isLoading) {
    return (
      <FormScreen title="Sign off">
        <FormCard>
          <ShimmerRows rows={4} icon={false} />
        </FormCard>
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title={
        phase === 'opening' ? 'Opening declaration' : 'Closing declaration'
      }
      footer={
        <>
          {call.error ? (
            <Notice
              tone="error"
              title={errorMessage(call.error)}
              style={styles.footNotice}
            />
          ) : !summary?.complete && summary ? (
            <Notice
              tone="info"
              title="This record is not complete yet"
              text={
                summary.blockers[0] ??
                `${summary.pending} activities still have no answer.`
              }
              style={styles.footNotice}
            />
          ) : null}
          <Button
            label={busy ? 'Signing off…' : 'Sign off and lock'}
            iconLeft={Lock}
            disabled={!selfie || !summary?.complete || busy}
            onPress={submit}
          />
        </>
      }
    >
      {state.error ? (
        <Notice
          tone="error"
          title={errorMessage(state.error)}
          style={styles.notice}
        />
      ) : null}
      {summary ? (
        <FormCard title={`${state.data?.unit.name} · ${longDate(target.date)}`}>
          <View style={styles.stats}>
            <Stat
              size="sm"
              value={summary.done}
              label="Done"
              dot={{ color: colors.teal }}
            />
            <Stat
              size="sm"
              value={summary.dev}
              label="Deviation"
              dot={{ color: colors.amber }}
            />
            <Stat
              size="sm"
              value={summary.na}
              label="N/A"
              dot={{ color: colors.slate }}
            />
            <Stat
              size="sm"
              value={summary.photos}
              label="Photos"
              dot={{ color: colors.blue }}
            />
          </View>
        </FormCard>
      ) : null}

      <FormCard title="Declaration">
        <AppText variant="bodyRegular" style={styles.declaration}>
          {state.data?.declaration}
        </AppText>
        <SignerCard
          name={state.data?.signer.name ?? ''}
          role={state.data?.signer.role ?? ''}
          note="Taken from your login — it cannot be typed"
        />
      </FormCard>

      <FormCard title="Selfie">
        <View style={styles.selfieRow}>
          <View style={styles.frame}>
            {selfie ? (
              <Image source={{ uri: selfie }} style={styles.photo} />
            ) : (
              <UserRound
                size={s(40)}
                color={colors.inkFaint}
                strokeWidth={1.4}
              />
            )}
          </View>
          <View style={styles.selfieText}>
            <AppText variant="meta" color={colors.inkMuted}>
              Face the camera. This photograph is filed with the declaration as
              proof of who signed.
            </AppText>
            <Button
              label={selfie ? 'Retake' : 'Take selfie'}
              size="md"
              variant={selfie ? 'outline' : 'secondary'}
              iconLeft={selfie ? RotateCcw : Camera}
              onPress={capture}
              style={styles.selfieBtn}
            />
            {noCamera ? (
              <Button
                label="Choose a photo"
                size="md"
                variant="outline"
                onPress={choose}
                style={styles.selfieBtn}
              />
            ) : null}
          </View>
        </View>
        {error ? (
          <Notice tone="error" title={error} style={styles.notice} />
        ) : null}
      </FormCard>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  notice: { marginTop: vs(10), marginBottom: vs(4) },
  footNotice: { marginBottom: vs(10) },
  stats: { flexDirection: 'row', marginBottom: vs(12) },
  declaration: { marginBottom: vs(14) },
  selfieRow: { flexDirection: 'row', gap: s(14), marginBottom: vs(14) },
  frame: {
    width: s(104),
    height: s(128),
    borderRadius: radius.md,
    borderWidth: hairline,
    borderColor: colors.line,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  selfieText: { flex: 1 },
  selfieBtn: { marginTop: vs(10) },
});
