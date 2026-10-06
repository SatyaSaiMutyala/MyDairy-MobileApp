import { PermissionsAndroid, Platform } from 'react-native';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

// `noCamera` is set only when the phone has no usable camera, as opposed to
// the person refusing it.
export type PhotoResult = { uris: string[]; error?: string; noCamera?: boolean };

// Same budgets as the website: evidence 1280 px, selfie 800 px, JPEG quality 80.
const EVIDENCE = { maxWidth: 1280, maxHeight: 1280, quality: 0.8 } as const;
const SELFIE = { maxWidth: 800, maxHeight: 800, quality: 0.8 } as const;

const messages: Record<string, string> = {
  camera_unavailable: 'The camera is not available on this device.',
  permission: 'Permission was refused. Allow it in the phone settings and try again.',
  others: 'The photograph could not be added. Please try again.',
};

function read(response: ImagePickerResponse): PhotoResult {
  if (response.didCancel) {
    return { uris: [] };
  }
  if (response.errorCode) {
    return {
      uris: [],
      error: messages[response.errorCode] ?? messages.others,
      noCamera: response.errorCode === 'camera_unavailable',
    };
  }
  return {
    uris: (response.assets ?? []).map(a => a.uri).filter((u): u is string => !!u),
  };
}

// The manifest declares CAMERA, so Android refuses to open the camera until
// the person has allowed it at runtime. iOS asks by itself.
async function cameraAllowed() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const answer = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
  );
  return answer === PermissionsAndroid.RESULTS.GRANTED;
}

export async function takePhoto(): Promise<PhotoResult> {
  if (!(await cameraAllowed())) {
    return { uris: [], error: messages.permission };
  }
  return read(
    await launchCamera({ mediaType: 'photo', cameraType: 'back', ...EVIDENCE }),
  );
}

export async function takeSelfie(): Promise<PhotoResult> {
  if (!(await cameraAllowed())) {
    return { uris: [], error: messages.permission };
  }
  return read(
    await launchCamera({ mediaType: 'photo', cameraType: 'front', ...SELFIE }),
  );
}

export async function pickPhotos(limit: number): Promise<PhotoResult> {
  return read(
    await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: Math.max(1, Math.min(6, limit)),
      ...EVIDENCE,
    }),
  );
}
