declare module 'omt:*' {
  const value: string;
  export default value;
}

declare interface AudioAnalyzerNode extends AudioNode {
  getByteTimeDomainData: (array: Uint8Array) => void;
  frequencyBinCount: number;
}
