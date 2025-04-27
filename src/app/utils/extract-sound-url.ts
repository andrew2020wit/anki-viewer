export function extractSoundUrl(soundUrlStr: string | undefined): string {
  if (!soundUrlStr) {
    return '';
  }

  return soundUrlStr.replace('[sound:', '').replace(']', '').trim();
}
