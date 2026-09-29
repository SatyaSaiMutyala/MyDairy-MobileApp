import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Camera, Lock, RotateCcw, UserRound } from 'lucide-react-native';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { FormCard } from '../components/FormCard';
import { FormScreen } from '../components/FormScreen';
import { Notice } from '../components/Notice';
import { SignerCard } from '../components/SignerCard';
import { Stat } from '../components/Stat';
import { dateLabel, declarations, Phase, units } from '../data/labReadiness';
import { currentUser } from '../data/user';
import { recordKey, summarise, useLab } from '../state/LabStore';
import { pickPhotos, takeSelfie } from '../utils/photos';
import { colors, hairline, radius, s, vs } from '../theme';

export function LabSignOffScreen() {
  const nav = useNavigation();
  const { unitId, date, phase } = useRoute<any>().params as {
    unitId: string;
    date: string;
    phase: Phase;
  };
  const lab = useLab();
  const record = lab.records[recordKey(unitId, date, phase)];
  const totals = summarise(phase, record);
  const unit = units.find(u => u.id === unitId);

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

  return (
    <FormScreen
      title={phase === 'opening' ? 'Opening declaration' : 'Closing declaration'}
      footer={
        <Button
          label="Sign off and lock"
          iconLeft={Lock}
          disabled={!selfie || totals.open > 0}
          onPress={() => {
            lab.signOff(unitId, date, phase, selfie);
            nav.goBack();
          }}
        />
      }>
      <FormCard title={`${unit?.name} · ${dateLabel(date)}`}>
        <View style={styles.stats}>
          <Stat size="sm" value={totals.done} label="Done" dot={{ color: colors.teal }} />
          <Stat size="sm" value={totals.deviation} label="Deviation" dot={{ color: colors.amber }} />
          <Stat size="sm" value={totals.na} label="N/A" dot={{ color: colors.slate }} />
          <Stat size="sm" value={totals.photos} label="Photos" dot={{ color: colors.blue }} />
        </View>
      </FormCard>

      <FormCard title="Declaration">
        <AppText variant="bodyRegular" style={styles.declaration}>
          {declarations[phase]}
        </AppText>
        <SignerCard
          name={currentUser.name}
          role={currentUser.role}
          note="Taken from your login — it cannot be typed"
        />
      </FormCard>

      <FormCard title="Selfie">
        <View style={styles.selfieRow}>
          <View style={styles.frame}>
            {selfie ? (
              <Image source={{ uri: selfie }} style={styles.photo} />
            ) : (
              <UserRound size={s(40)} color={colors.inkFaint} strokeWidth={1.4} />
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
  notice: { marginBottom: vs(14) },
});
