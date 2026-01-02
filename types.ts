
export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

export interface MemeCaptionPair {
  top: string;
  bottom: string;
}

export interface MagicCaptionResponse {
  captions: MemeCaptionPair[];
}

export interface MemeState {
  image: string | null;
  topText: string;
  bottomText: string;
  magicCaptions: MemeCaptionPair[];
}
